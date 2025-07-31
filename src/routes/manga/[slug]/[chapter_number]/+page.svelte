<svelte:window on:keydown={handleKeydown} on:scroll={handleScroll} />
<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { pageDisplayMode, readingMode, readerBackgroundColor, imageFitMode } from '$lib/stores/settings';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';

	export let data: PageData;
	export let form: ActionData;
	const { user, manga, chapter, pages, comments } = data;
	const currentChapter = Number(chapter.chapter_number);
	let currentPageIndex = 0;
	$: progress = pages.length > 0 ? ((currentPageIndex + 1) / pages.length) * 100 : 0;
	let imagesToPreload: string[] = [];
	const PRELOAD_AHEAD_COUNT = 3;

	let showSettings = false;
	let showThumbnails = false;
	let uiVisible = true;
	let inactivityTimer: number;
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
		if(window.scrollY < lastScrollY) {
			resetTimer();
		}
		lastScrollY = window.scrollY;
	}

	onMount(() => {
		resetTimer();
		const updateFullscreenStatus = () => {
			isFullscreen = document.fullscreenElement !== null;
		};
		document.addEventListener('fullscreenchange', updateFullscreenStatus);
		return () => {
			document.removeEventListener('fullscreenchange', updateFullscreenStatus);
			clearTimeout(inactivityTimer);
		};
	});
	onDestroy(() => {
		clearTimeout(inactivityTimer);
	});

	$: {
		if ($readingMode === 'horizontal' && pages.length > 0) {
			const start = currentPageIndex + ($pageDisplayMode === 'double' ? 2 : 1);
			const end = start + PRELOAD_AHEAD_COUNT;
			imagesToPreload = pages.slice(start, end).map(p => `${baseCdnUrl}/${p.image_path}?width=1200&quality=85`);
		} else {
			imagesToPreload = [];
		}
	}

	const baseCdnUrl = "https://dragonball-cdn.b-cdn.net";

	let isFullscreen = false;

	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
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
			if (event.key === 'ArrowRight') {
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
		<div class="container mx-auto px-4 py-3 flex justify-between items-center">
			<a href="/manga/{manga.slug}" class="hover:text-orange-500 transition-colors text-sm md:text-base">
				&larr; قائمة الفصول
			</a>

			<div class="flex items-center gap-x-2 md:gap-x-4">
				<div class="flex items-center space-x-2">
					<button on:click={() => readingMode.set('vertical')} class="px-3 py-1 rounded-md text-sm transition-colors {$readingMode === 'vertical' ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'}">
						عمودي
					</button>
					<button on:click={() => readingMode.set('horizontal')} class="px-3 py-1 rounded-md text-sm transition-colors {$readingMode === 'horizontal' ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'}">
						أفقي
					</button>
				</div>
				
				{#if $readingMode === 'horizontal'}
					<div class="flex items-center space-x-2 border-l border-gray-600 pl-2">
						<button on:click={() => pageDisplayMode.set('single')} class="px-3 py-1 rounded-md text-sm transition-colors {$pageDisplayMode === 'single' ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'}">
							صفحة واحدة
						</button>
						<button on:click={() => pageDisplayMode.set('double')} class="px-3 py-1 rounded-md text-sm transition-colors {$pageDisplayMode === 'double' ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'}">
							صفحتان
						</button>
					</div>
				{/if}
			</div>

			<div class="flex items-center gap-x-4 relative">
				<h1 class="font-bold text-lg text-center hidden md:block">{manga.title} - #{chapter.chapter_number}</h1>
				
				<!-- svelte-ignore a11y_consider_explicit_label -->
				<button on:click={() => showThumbnails = !showThumbnails} class="text-gray-300 hover:text-white" title="قائمة الصفحات">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
				</button>

				<!-- svelte-ignore a11y_consider_explicit_label -->
				<button on:click={() => showSettings = !showSettings} class="text-gray-300 hover:text-white" title="إعدادات القارئ">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
				</button>
				<button on:click={toggleFullscreen} class="text-gray-300 hover:text-white" title="تبديل وضع ملء الشاشة (F)">
					{#if isFullscreen}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
					{/if}
				</button>

                {#if showSettings}
                <div class="absolute top-full right-0 mt-2 bg-gray-800 rounded-lg shadow-lg p-4 text-sm w-64 border border-gray-700">
                    <div class="mb-4">
                        <p class="font-bold mb-2 text-white">لون الخلفية</p>
                        <div class="flex gap-2">
                            <!-- svelte-ignore a11y_consider_explicit_label -->
                            <button on:click={() => readerBackgroundColor.set('black')} class:ring-orange-500={$readerBackgroundColor === 'black'} class="w-8 h-8 rounded-full bg-black border border-gray-600 ring-2 ring-transparent"></button>
                            <!-- svelte-ignore a11y_consider_explicit_label -->
                            <button on:click={() => readerBackgroundColor.set('white')} class:ring-orange-500={$readerBackgroundColor === 'white'} class="w-8 h-8 rounded-full bg-white border border-gray-400 ring-2 ring-transparent"></button>
                            <!-- svelte-ignore a11y_consider_explicit_label -->
                            <button on:click={() => readerBackgroundColor.set('#f4e8d8')} class:ring-orange-500={$readerBackgroundColor === '#f4e8d8'} class="w-8 h-8 rounded-full bg-[#f4e8d8] border border-gray-400 ring-2 ring-transparent"></button>
                        </div>
                    </div>
                    <div>
                        <p class="font-bold mb-2 text-white">طريقة عرض الصور</p>
                        <div class="flex flex-col gap-2">
                            <button on:click={() => imageFitMode.set('fit-width')} class:bg-orange-600={$imageFitMode === 'fit-width'} class="text-right w-full p-2 rounded bg-gray-700 hover:bg-gray-600">ملاءمة العرض</button>
                            <button on:click={() => imageFitMode.set('fit-height')} class:bg-orange-600={$imageFitMode === 'fit-height'} class="text-right w-full p-2 rounded bg-gray-700 hover:bg-gray-600">ملاءمة الطول</button>
                            <button on:click={() => imageFitMode.set('original')} class:bg-orange-600={$imageFitMode === 'original'} class="text-right w-full p-2 rounded bg-gray-700 hover:bg-gray-600">الحجم الأصلي</button>
                        </div>
                    </div>
                </div>
                {/if}
			</div>
		</div>
    
        <div class="w-full bg-gray-600 h-1">
            <div class="bg-orange-500 h-1" style="width: {progress}%"></div>
        </div>
	</header>
	
	{#if showThumbnails}
	<div class="thumbnails-sidebar fixed top-0 left-0 h-full w-48 bg-gray-900/90 backdrop-blur-md z-30 overflow-y-auto p-2" dir="ltr">
		<h3 class="text-white text-center font-bold p-2">الصفحات</h3>
		<div class="grid grid-cols-2 gap-2">
			{#each pages as page, i}
				<a href={$readingMode === 'vertical' ? `#page-${i}` : '#'}
				   on:click={() => {
					   if ($readingMode === 'horizontal') { currentPageIndex = i; }
					   showThumbnails = false;
				   }}
				   class="thumbnail-item group relative rounded overflow-hidden border-2"
				   class:border-orange-500={$readingMode === 'horizontal' && currentPageIndex === i}
				   class:border-transparent={$readingMode !== 'horizontal' || currentPageIndex !== i}
				>
					<img
						src="{baseCdnUrl}/{page.image_path}?width=150&quality=75"
						alt="صفحة {i + 1}"
						class="w-full h-auto"
						loading="lazy"
					/>
					<div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
						{i + 1}
					</div>
				</a>
			{/each}
		</div>
	</div>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="fixed inset-0 z-20 bg-black/30" on:click={() => showThumbnails = false}></div>
	{/if}

	<main class="flex flex-col items-center pt-8 pb-4">
		{#if pages.length > 0}
			{#if $readingMode === 'vertical'}
				{#each pages as page, i}
					<img
						id="page-{i}"
						src="{baseCdnUrl}/{page.image_path}?width=1200&quality=85"
						alt="صفحة رقم {page.page_number}"
						class="mb-2 shadow-md mx-auto scroll-mt-20"
						class:fit-width={$imageFitMode === 'fit-width'}
						class:fit-height={$imageFitMode === 'fit-height'}
						class:original-size={$imageFitMode === 'original'}
						loading="lazy"
					/>
				{/each}
			{:else}
				{@const step = $pageDisplayMode === 'double' ? 2 : 1}
				<div class="w-full flex flex-col items-center justify-center min-h-[70vh]">
					<div class="relative w-full max-w-7xl flex items-center justify-center">
						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button
							on:click={() => (currentPageIndex = Math.max(0, currentPageIndex - step))}
							class="absolute left-2 md:-left-12 z-10 p-3 bg-black/50 rounded-full hover:bg-black/80 disabled:opacity-0 transition-opacity"
							disabled={currentPageIndex === 0}
							title="الصفحة السابقة"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
						</button>
						<div class="flex justify-center items-start gap-2"
                             class:fit-height-container={$imageFitMode === 'fit-height'}>
							<img
								src="{baseCdnUrl}/{pages[currentPageIndex].image_path}?width=1200&quality=85"
								alt="صفحة رقم {pages[currentPageIndex].page_number}"
								class="object-contain shadow-md"
                                class:fit-width-horizontal-single={($pageDisplayMode === 'single' || !pages[currentPageIndex + 1]) && $imageFitMode !== 'fit-height'}
                                class:fit-width-horizontal-double={$pageDisplayMode === 'double' && pages[currentPageIndex + 1] && $imageFitMode !== 'fit-height'}
                                class:fit-height={$imageFitMode === 'fit-height'}
                                class:original-size={$imageFitMode === 'original'}
							/>
							{#if $pageDisplayMode === 'double' && pages[currentPageIndex + 1]}
								<img
									src="{baseCdnUrl}/{pages[currentPageIndex + 1].image_path}?width=1200&quality=85"
									alt="صفحة رقم {pages[currentPageIndex + 1].page_number}"
									class="object-contain shadow-md"
                                    class:fit-width-horizontal-double={$imageFitMode !== 'fit-height'}
                                    class:fit-height={$imageFitMode === 'fit-height'}
                                    class:original-size={$imageFitMode === 'original'}
								/>
							{/if}
						</div>
						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button
							on:click={() => (currentPageIndex = Math.min(pages.length - 1, currentPageIndex + step))}
							class="absolute right-2 md:-right-12 z-10 p-3 bg-black/50 rounded-full hover:bg-black/80 disabled:opacity-0 transition-opacity"
							disabled={currentPageIndex >= pages.length - step}
							title="الصفحة التالية"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
						</button>
					</div>
					<p class="mt-4 text-gray-400">
						{#if $pageDisplayMode === 'double' && pages[currentPageIndex + 1]}
							صفحة {currentPageIndex + 1}-{currentPageIndex + 2} من {pages.length}
						{:else}
							صفحة {currentPageIndex + 1} من {pages.length}
						{/if}
					</p>
				</div>
			{/if}
		{:else}
			<div class="text-white text-center py-20">
				<h2 class="text-2xl">لم يتم العثور على صفحات لهذا الفصل.</h2>
			</div>
		{/if}
	</main>
	<footer 
		class="reader-footer container mx-auto px-4 py-6 flex justify-between items-center text-white"
		class:footer-hidden={!uiVisible}
	>
		<a
			href="/manga/{manga.slug}/{currentChapter - 1}"
			class="bg-orange-600 py-2 px-6 rounded hover:bg-orange-700 transition-colors {currentChapter <= 1 ? 'opacity-50 pointer-events-none' : ''}">الفصل السابق</a
		>
		<a
			href="/manga/{manga.slug}/{currentChapter + 1}"
			class="bg-orange-600 py-2 px-6 rounded hover:bg-orange-700 transition-colors">الفصل التالي</a
		>
	</footer>
    <section class="container mx-auto px-4 py-10">
        <h2 class="text-3xl font-bold text-white mb-6 border-b-2 border-gray-700 pb-2">
            التعليقات ({comments.length})
        </h2>
        {#if user}
            <form method="POST" action="?/addComment" class="mb-8">
                <div class="bg-gray-800 rounded-lg p-4">
                    <textarea 
                        name="content" 
                        rows="4" 
                        placeholder="أضف تعليقك هنا..."
                        class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:outline-none focus:border-orange-500"
                        required
                    ></textarea>
                    {#if form?.error}
                        <p class="text-red-500 text-sm mt-2">{form.error}</p>
                    {/if}
                    <button type="submit" class="mt-4 bg-orange-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-700">
                        إرسال التعليق
                    </button>
                </div>
            </form>
        {:else}
            <div class="mb-8 text-center bg-gray-800 p-6 rounded-lg">
                <p><a href="/login" class="text-orange-500 hover:underline font-bold">سجل دخولك</a> لتتمكن من إضافة تعليق.</p>
            </div>
        {/if}
        <div class="space-y-6">
            {#each comments as comment}
                <article class="flex space-x-4">
                    {#if comment.expand?.user}
                        <div class="flex-shrink-0">
                            <div class="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center font-bold text-white">
                                {comment.expand.user.username.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div class="bg-gray-800 rounded-lg p-4 flex-grow">
                            <p class="font-bold text-orange-400">{comment.expand.user.username}</p>
                            <div class="prose prose-invert text-gray-300 mt-2">
                                {@html comment.content}
                            </div>
                        </div>
                    {/if}
                </article>
            {:else}
                <p class="text-center text-gray-400">لا توجد تعليقات بعد. كن أول من يعلق!</p>
            {/each}
        </div>
    </section>
</div>

<style>
.prose { max-width: none; }

:global(:root:fullscreen .sticky-header) {
	display: none;
}

/* Vertical Reading Mode Styles */
.fit-width {
	max-width: 100%;
	width: 100%;
	height: auto;
}
.fit-height {
	max-height: 90vh;
	width: auto;
	max-width: none;
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
.sticky-header, .reader-footer {
	transition: transform 0.3s ease-in-out;
	position: sticky;
	width: 100%;
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