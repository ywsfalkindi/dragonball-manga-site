<svelte:window on:keydown={handleKeydown} on:scroll={handleScroll} />
<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { pageDisplayMode, readingMode, readerBackgroundColor, imageFitMode } from '$lib/stores/settings';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import { PUBLIC_CDN_URL } from '$env/static/public';
	import Comment from '$lib/components/Comment.svelte';
	export let data: PageData;
    export let form: ActionData;

	$: ({ user, manga, chapter, pages, comments, nextChapterExists, lastPageRead } = data);
	$: currentChapter = chapter ? Number(chapter.chapter_number) : 0;
	
    $: currentPageIndex = Math.max(0, Math.min((lastPageRead || 1) - 1, pages.length - 1));

	$: progress = pages.length > 0 ? ((currentPageIndex + 1) / pages.length) * 100 : 0;
	let imagesToPreload: string[] = [];
	const PRELOAD_AHEAD_COUNT = 7;
	let showSettings = false;
	let showThumbnails = false;
	let uiVisible = true;
	let inactivityTimer: number | NodeJS.Timeout;
	let updateTimeout: number | NodeJS.Timeout;

    async function updateProgress(pageIndex: number) {
        if (!user) return;
		clearTimeout(updateTimeout);
        // تم تقليل مدة التأخير إلى 500ms
        updateTimeout = setTimeout(async () => {
            try {
                await fetch('/api/update-progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chapterId: chapter.id,
                        page: pageIndex + 1
                    })
                });
            } catch (err) {
                console.error("Failed to update progress:", err);
            }
        }, 500);
    }

    $: if (browser && pages.length > 0) {
        updateProgress(currentPageIndex);
    }
    
    // ✨ الإصلاح الثاني: التمرير التلقائي عند تغيير الفصل ✨
    $: {
        if (browser && chapter?.id) {
            if ($readingMode === 'vertical') {
                setTimeout(() => {
                    const pageElement = document.getElementById(`page-${currentPageIndex}`);
                    if (pageElement) {
                        pageElement.scrollIntoView({ behavior: 'auto', block: 'start' });
                    }
                }, 100);
            }
        }
    }

    function onImageError(event: Event) {
        const img = event.target as HTMLImageElement;
		img.src = '/image_error.png';
        img.style.width = '300px';
        img.style.opacity = '0.5';
    }

	function hideUI() {
		if (showSettings || showThumbnails) return;
		uiVisible = false;
	}

	function resetTimer() {
		uiVisible = true;
		clearTimeout(inactivityTimer);
		inactivityTimer = setTimeout(hideUI, 3000);
	}

	let lastScrollY = 0;
	function handleScroll() {
		if (browser) {
			if (window.scrollY < lastScrollY) {
				uiVisible = true;
				resetTimer();
			}
			lastScrollY = window.scrollY;
			if ($readingMode === 'vertical') {
                let closestPageIndex = 0;
				let minDistance = Infinity;
                imageElements.forEach((el, index) => {
                    if(el) {
                        const rect = el.getBoundingClientRect();
                        const distance = Math.abs(rect.top - 80);
                
						if (distance < minDistance) {
                            minDistance = distance;
                            closestPageIndex = index;
                        }
                    }
                });
				if (currentPageIndex !== closestPageIndex) {
                    currentPageIndex = closestPageIndex;
				}
            }
		}
	}

    function handleProgressClick(event: MouseEvent) {
        const target = event.currentTarget as HTMLDivElement;
		const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const percentage = x / rect.width;
        const pageCount = pages.length;
		if (pageCount === 0) return;
        const targetIndex = Math.floor(percentage * pageCount);
		if ($readingMode === 'horizontal') {
            const step = $pageDisplayMode === 'double' ? 2 : 1;
            currentPageIndex = Math.max(0, Math.min(pageCount - step, targetIndex));
		} else {
            const pageElement = document.getElementById(`page-${targetIndex}`);
			if (pageElement) {
                pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
				resetTimer();
            }
        }
    }

	let imageElements: HTMLImageElement[] = [];
	let observer: IntersectionObserver;
	onMount(() => {
		resetTimer();
		const updateFullscreenStatus = () => {
			isFullscreen = document.fullscreenElement !== null;
		};
		document.addEventListener('fullscreenchange', updateFullscreenStatus);
        
		if ($readingMode === 'vertical' && imageElements.length > 1) {
			const options = {
				root: null, 
				rootMargin: '500px 0px', 
				threshold: 0.01
			};

			observer = new IntersectionObserver((entries, obs) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const img = entry.target as HTMLImageElement;
						const src = img.dataset.src;
						if (src) {
							img.src = src;
						}
						obs.unobserve(img);
					}
				});
			}, options);
			imageElements.forEach((img) => {
				if(img) observer.observe(img);
			});
		}

		return () => {
			document.removeEventListener('fullscreenchange', updateFullscreenStatus);
			clearTimeout(inactivityTimer);
			if (observer) observer.disconnect();
            clearTimeout(updateTimeout);
		};
	});

	onDestroy(() => {
		clearTimeout(inactivityTimer);
        clearTimeout(updateTimeout);
		if (observer) observer.disconnect();
	});

	$: {
		if ($readingMode === 'horizontal' && pages.length > 0) {
			const start = currentPageIndex + ($pageDisplayMode === 'double' ? 2 : 1);
			const end = start + PRELOAD_AHEAD_COUNT;
			imagesToPreload = pages
				.slice(start, end)
				.map((p) => `${baseCdnUrl}/${p.image_path}?width=1200&quality=85`);
		} else {
			imagesToPreload = [];
		}
	}

	const baseCdnUrl = PUBLIC_CDN_URL;
	const placeholderSrc =
		'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

	let isFullscreen = false;
	function toggleFullscreen() {
		if (browser) {
			if (!document.fullscreenElement) {
				document.documentElement.requestFullscreen();
			} else {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				}
			}
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'f') {
			event.preventDefault();
			toggleFullscreen();
		}

		if ($readingMode === 'horizontal') {
			const step = $pageDisplayMode === 'double' ? 2 : 1;
			if (event.key === 'ArrowRight') {
				currentPageIndex = Math.min(pages.length - 1, currentPageIndex + step);
			} else if (event.key === 'ArrowLeft') {
				currentPageIndex = Math.max(0, currentPageIndex - step);
			}
		} else {
			if (event.key === 'ArrowRight' && nextChapterExists) {
				goto(`/manga/${manga.slug}/${currentChapter + 1}`);
			} else if (event.key === 'ArrowLeft') {
				goto(`/manga/${manga.slug}/${currentChapter - 1}`);
			}
		}
	}
</script>

<svelte:head>
	<title>قراءة مانجا {manga.title} - الفصل #{chapter.chapter_number}</title>
</svelte:head>

<div style="position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; overflow: hidden;">
	{#each imagesToPreload as src}
		<img {src} alt="Preloading" />
	{/each}
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="reader-container min-h-screen font-[Tajawal]"
	style="background-color: {$readerBackgroundColor};"
	on:mousemove={resetTimer}
	on:touchstart={resetTimer}
	on:click={() => {
		if (!uiVisible) {
			resetTimer();
		}
	}}
>
	<header
		class="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-md text-white shadow-lg sticky-header"
		class:header-hidden={!uiVisible}
	>
		<div class="container mx-auto flex items-center justify-between px-4 py-3">
			<a href="/manga/{manga.slug}" class="text-sm transition-colors hover:text-orange-500 md:text-base">
				&larr; قائمة الفصول
			</a>

			<div class="flex items-center gap-x-2 md:gap-x-4">
				<div class="flex items-center space-x-2">
					<button
						on:click={() => readingMode.set('vertical')}
						class="rounded-md px-3 py-1 text-sm transition-colors {$readingMode === 'vertical'
							? 'bg-orange-600'
							: 'bg-gray-700 hover:bg-gray-600'}"
					>
						عمودي
					</button>
					<button
						on:click={() => readingMode.set('horizontal')}
						class="rounded-md px-3 py-1 text-sm transition-colors {$readingMode === 'horizontal'
							? 'bg-orange-600'
							: 'bg-gray-700 hover:bg-gray-600'}"
					>
						أفقي
					</button>
				</div>

				{#if $readingMode === 'horizontal'}
					<div class="flex items-center space-x-2 border-l border-gray-600 pl-2">
						<button
							on:click={() => pageDisplayMode.set('single')}
							class="rounded-md px-3 py-1 text-sm transition-colors {$pageDisplayMode === 'single'
								? 'bg-orange-600'
								: 'bg-gray-700 hover:bg-gray-600'}"
						>
							صفحة واحدة
						</button>
						<button
							on:click={() => pageDisplayMode.set('double')}
							class="rounded-md px-3 py-1 text-sm transition-colors {$pageDisplayMode === 'double'
								?
'bg-orange-600'
								: 'bg-gray-700 hover:bg-gray-600'}"
						>
							صفحتان
						</button>
					</div>
				{/if}
			</div>

			<div class="relative flex items-center gap-x-4">
				<h1 class="hidden text-center text-lg font-bold md:block">
					{manga.title} - #{chapter.chapter_number}
				</h1>

				<!-- svelte-ignore a11y_consider_explicit_label -->
				<button on:click={() => (showThumbnails = !showThumbnails)} class="text-gray-300 hover:text-white" title="قائمة الصفحات">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
				</button>

				<!-- svelte-ignore a11y_consider_explicit_label -->
				<button on:click={() => (showSettings = !showSettings)} class="text-gray-300 hover:text-white" title="إعدادات القارئ">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 
0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
				</button>
				<button on:click={toggleFullscreen} class="text-gray-300 hover:text-white" title="تبديل وضع ملء الشاشة (F)">
					{#if 
isFullscreen}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
					{/if}
				</button>

				{#if showSettings}
					<div class="absolute top-full right-0 z-10 mt-2 w-64 rounded-lg border border-gray-700 bg-gray-800 p-4 text-sm shadow-lg">
						<div class="mb-4">
							<p class="mb-2 font-bold text-white">لون الخلفية</p>
							<div class="flex gap-2">
								<!-- svelte-ignore a11y_consider_explicit_label -->
								<button on:click={() => readerBackgroundColor.set('black')} class:ring-orange-500={$readerBackgroundColor === 'black'} class="h-8 w-8 rounded-full border border-gray-600 bg-black ring-2 ring-transparent"></button>
								<!-- svelte-ignore a11y_consider_explicit_label -->
								<button on:click={() => readerBackgroundColor.set('white')} class:ring-orange-500={$readerBackgroundColor === 'white'} class="h-8 w-8 rounded-full border border-gray-400 bg-white ring-2 ring-transparent"></button>
								<!-- svelte-ignore a11y_consider_explicit_label -->
								<button on:click={() => readerBackgroundColor.set('#f4e8d8')} class:ring-orange-500={$readerBackgroundColor === '#f4e8d8'} class="h-8 w-8 rounded-full border border-gray-400 bg-[#f4e8d8] ring-2 ring-transparent"></button>
							</div>
						</div>
						<div>
							<p class="mb-2 font-bold text-white">طريقة عرض الصور</p>
							<div class="flex flex-col gap-2">
								<button on:click={() => imageFitMode.set('fit-width')} class:bg-orange-600={$imageFitMode === 'fit-width'} class="w-full rounded bg-gray-700 p-2 text-right hover:bg-gray-600">ملاءمة العرض</button>
								<button on:click={() => imageFitMode.set('fit-height')} class:bg-orange-600={$imageFitMode === 'fit-height'} class="w-full rounded bg-gray-700 p-2 text-right hover:bg-gray-600">ملاءمة الطول</button>
								<button on:click={() => imageFitMode.set('original')} class:bg-orange-600={$imageFitMode === 'original'} class="w-full rounded bg-gray-700 p-2 text-right hover:bg-gray-600">الحجم الأصلي</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<div
     
        class="h-1 w-full bg-gray-600 cursor-pointer"
            on:click={handleProgressClick}
            role="button"
            tabindex="0"
            aria-label="الانتقال إلى صفحة"
            on:keydown={(e) => { if (e.key === 'Enter' ||
e.key === ' ') handleProgressClick(e as any); }}
        >
            <div class="h-1 bg-orange-500 pointer-events-none" style="width: {progress}%"></div>
        </div>
        </header>

	{#if showThumbnails}
		<div class="thumbnails-sidebar fixed top-0 left-0 z-30 h-full w-48 overflow-y-auto bg-gray-900/90 p-2 backdrop-blur-md" dir="ltr">
			<h3 class="p-2 text-center font-bold text-white">الصفحات</h3>
			<div class="grid grid-cols-2 gap-2">
				{#each pages as page, i}
					<a
						href={$readingMode === 'vertical' ?
`#page-${i}` : '#'}
						on:click={() => {
							if ($readingMode === 'horizontal') {
								currentPageIndex = i;
							}
							showThumbnails = false;
						}}
						class="thumbnail-item group relative rounded border-2"
						class:border-orange-500={$readingMode === 'horizontal' && currentPageIndex === i}
						class:border-transparent={$readingMode !== 'horizontal' ||
currentPageIndex !== i}
					>
						<img
							src="{baseCdnUrl}/{page.image_path}?width=150&quality=75"
							alt="صفحة {i + 1}"
							class="h-auto w-full"
							loading="lazy"
                            on:error={onImageError}
						/>
						<div class="absolute inset-0 flex items-center justify-center bg-black/50 font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
							{i + 1}
						</div>
					</a>
				{/each}
			</div>
		</div>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="fixed inset-0 z-20 bg-black/30" on:click={() => (showThumbnails = false)}></div>
	{/if}

	<main class="flex flex-col items-center pb-4 pt-8">
		{#if pages.length > 0}
			{#if $readingMode === 'vertical'}
				{#each pages as page, i}
					<img
						bind:this={imageElements[i]}
						id="page-{i}"
						src={i < 2 ?
`${baseCdnUrl}/${page.image_path}?width=1200&quality=85` : placeholderSrc}
						data-src="{baseCdnUrl}/{page.image_path}?width=1200&quality=85"
						alt="صفحة رقم {page.page_number}"
						class="scroll-mt-20 mx-auto mb-2 shadow-md"
						class:fit-width={$imageFitMode === 'fit-width'}
						class:fit-height={$imageFitMode === 'fit-height'}
						class:original-size={$imageFitMode === 'original'}
						loading="lazy"
                        on:error={onImageError}
					/>
				{/each}
			{:else}
				{@const step = $pageDisplayMode === 'double' ?
2 : 1}
				<div class="flex min-h-[70vh] w-full flex-col items-center justify-center">
					<div class="relative flex w-full max-w-7xl items-center justify-center">
						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button
							on:click={() => (currentPageIndex = Math.max(0, currentPageIndex - step))}
							class="absolute left-2 z-10 rounded-full bg-black/50 p-3 transition-opacity disabled:opacity-0 hover:bg-black/80 md:-left-12"
							disabled={currentPageIndex === 0}
							title="الصفحة السابقة"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
						</button>
						<div
							class="flex items-start justify-center gap-2"
							class:fit-height-container={$imageFitMode === 'fit-height'}
						>
							<img
								src="{baseCdnUrl}/{pages[currentPageIndex].image_path}?width=1200&quality=85"
								alt="صفحة رقم {pages[currentPageIndex].page_number}"
								class="object-contain shadow-md"
								class:fit-width-horizontal-single={($pageDisplayMode === 'single' ||
!pages[currentPageIndex + 1]) && $imageFitMode !== 'fit-height'}
								class:fit-width-horizontal-double={$pageDisplayMode === 'double' && pages[currentPageIndex + 1] && $imageFitMode !== 'fit-height'}
								class:fit-height={$imageFitMode === 'fit-height'}
								class:original-size={$imageFitMode === 'original'}
                                on:error={onImageError}
							/>
							{#if $pageDisplayMode === 'double' && pages[currentPageIndex + 1]}
								<img
									src="{baseCdnUrl}/{pages[currentPageIndex + 1].image_path}?width=1200&quality=85"
									alt="صفحة رقم {pages[currentPageIndex + 1].page_number}"
									class="object-contain shadow-md"
									class:fit-width-horizontal-double={$imageFitMode !== 'fit-height'}
									class:fit-height={$imageFitMode === 'fit-height'}
									class:original-size={$imageFitMode === 'original'}
                            
 
                                     on:error={onImageError}
								/>
							{/if}
						</div>
						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button
							on:click={() => (currentPageIndex = Math.min(pages.length - 1, currentPageIndex + step))}
							class="absolute right-2 z-10 rounded-full bg-black/50 p-3 transition-opacity disabled:opacity-0 hover:bg-black/80 md:-right-12"
							disabled={currentPageIndex >= pages.length - step}
							title="الصفحة التالية"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
						</button>
					</div>
					<p class="mt-4 text-gray-400">
						{#if $pageDisplayMode === 'double' && pages[currentPageIndex + 1]}
							صفحة {currentPageIndex + 1}-{currentPageIndex + 2} من {pages.length}
						{:else}
							صفحة {currentPageIndex + 1} من 
{pages.length}
						{/if}
					</p>
				</div>
			{/if}
		{:else}
			<div class="py-20 text-center text-white">
				<h2 class="text-2xl">لم يتم العثور على صفحات لهذا الفصل.</h2>
			</div>
		{/if}
	</main>
	<footer
    class="reader-footer container mx-auto flex items-center justify-between px-4 py-6 text-white z-20"
    class:footer-hidden={!uiVisible}
>
  
       <a
        href="/manga/{manga.slug}/{currentChapter - 1}"
        class="rounded bg-orange-600 px-6 py-2 transition-colors hover:bg-orange-700 {currentChapter <= 1 ?
'pointer-events-none opacity-50' : ''}"
    >الفصل السابق</a>
    
    <a
        href="/manga/{manga.slug}/{currentChapter + 1}"
        class="rounded bg-orange-600 px-6 py-2 transition-colors hover:bg-orange-700"
        class:pointer-events-none={!nextChapterExists}
        class:opacity-50={!nextChapterExists}
        aria-disabled={!nextChapterExists}
    >الفصل التالي</a>
</footer>
	<section class="container mx-auto px-4 py-10">
		<h2 class="mb-6 border-b-2 border-gray-700 pb-2 text-3xl font-bold text-white">
			التعليقات ({comments.length}) </h2>
		{#if user}
			<form method="POST" action="?/addComment" class="mb-8">
				<input type="hidden" name="parentId" value="" />
				<div class="rounded-lg bg-gray-800 p-4">
					<textarea
						name="content"
						rows="4"
						placeholder="أضف تعليقك هنا..."
						class="w-full rounded border border-gray-600 bg-gray-700 p-2 
text-white focus:border-orange-500 focus:outline-none"
						required
					></textarea>
					{#if form?.error}
						<p class="mt-2 text-sm text-red-500">{form.error}</p>
					{/if}
					<button
						type="submit"
						class="mt-4 rounded-lg bg-orange-600 py-2 px-6 font-bold text-white hover:bg-orange-700"
					>
						إرسال التعليق
					</button>
				</div>
			</form>
		{:else}
			<div class="mb-8 rounded-lg bg-gray-800 p-6 text-center">
				<p>
					<a href="/login" class="font-bold text-orange-500 hover:underline">سجل دخولك</a> لتتمكن من
					إضافة تعليق.
</p>
			</div>
		{/if}
		<div class="space-y-6">
			{#each comments as comment}
				<Comment {comment} {user} />
			{:else}
				<p class="text-center text-gray-400">لا توجد تعليقات بعد. كن أول من يعلق!</p>
			{/each}
			</div>
	</section>
</div>

<style>

	:global(:root:fullscreen .sticky-header) {
		display: none;
	}

	/* Vertical Reading Mode Styles */
	.fit-width {
		width: 100%;
		max-width: 100%;
		height: auto;
	}
	.fit-height {
		width: auto;
		max-width: none;
		max-height: 90vh;
	}
	.original-size {
		width: auto;
		height: auto;
		max-width: none;
		max-height: none;
	}

	/* Horizontal Reading Mode Styles */
	.fit-height-container {
		height: 90vh;
	}
	.fit-width-horizontal-single {
		max-width: 100%;
		max-height: 85vh;
	}
	.fit-width-horizontal-double {
		max-width: 49%;
		max-height: 85vh;
	}

	/* Thumbnails sidebar */
	.scroll-mt-20 {
		scroll-margin-top: 5rem;
	}

	/* UI Auto-hide Styles */
	.sticky-header,
	.reader-footer {
		position: sticky;
		width: 100%;
		transition: transform 0.3s ease-in-out;
	}

	.sticky-header {
		top: 0;
	}

	.reader-footer {
		bottom: 0;
	}

	.header-hidden {
		transform: translateY(-100%);
	}

	.footer-hidden {
		transform: translateY(100%);
	}
</style>