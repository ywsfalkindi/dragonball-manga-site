<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import {
		pageDisplayMode,
		readingMode,
		readerBackgroundColor,
		imageFitMode,
		readingDirection,
		verticalPagesGap
	} from '$lib/stores/settings';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { onMount, onDestroy, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_CDN_URL } from '$env/static/public';
	import Comment from '$lib/components/Comment.svelte';
	export let data: PageData;
	export let form: ActionData;

	$: ({
		user,
		manga,
		chapter,
		pages,
		comments,
		nextChapterExists,
		lastPageRead,
		commentsTotalPages
	} = data);
	$: currentChapter = chapter ? Number(chapter.chapter_number) : 0;

	$: currentPageIndex = pages ? Math.max(0, Math.min((lastPageRead || 1) - 1, pages.length - 1)) : 0;
    $: if (browser) {
		console.log('%cPage Index Changed To:', 'color: lightblue; font-weight: bold;', currentPageIndex);
	}
	$: progress = pages.length > 0 ? ((currentPageIndex + 1) / pages.length) * 100 : 0;
	let imagesToPreload: string[] = [];
	const PRELOAD_AHEAD_COUNT = 7;
	let showSettings = false;
	let showThumbnails = false;
	let uiVisible = true;
	let inactivityTimer: number | NodeJS.Timeout;
	let updateTimeout: number | NodeJS.Timeout;
	let newCommentContent = '';
	let currentCommentPage = 1;
	let isLoadingMoreComments = false;
	let initialLoadComplete = false; // ✅ أضف هذا السطر
	let showPageDisplayMenu = false;

	const handleAddComment: SubmitFunction = () => {
	return async ({ result }) => {
		if (result.type === 'success') {
			newCommentContent = ''; // أفرغ مربع النص
			await invalidateAll(); // ✨ هذا السطر سيقوم بتحديث قائمة التعليقات تلقائيًا
		}
	};
};

	async function loadMoreComments() {
		if (isLoadingMoreComments || currentCommentPage >= commentsTotalPages) {
			// لا تفعل شيئاً إذا كنا نحمل بالفعل، أو إذا وصلنا إلى النهاية
			return;
		}

		isLoadingMoreComments = true;
		currentCommentPage++; // ننتقل للصفحة التالية

		try {
			const response = await fetch(`/api/comments/${chapter.id}?page=${currentCommentPage}`);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const newData = await response.json();

			// نضيف التعليقات الجديدة إلى نهاية القائمة الحالية
			comments = [...comments, ...newData.comments];
		} catch (error) {
			console.error('Failed to load more comments:', error);
			// إذا فشل الطلب، نرجع رقم الصفحة كما كان
			currentCommentPage--;
		} finally {
			isLoadingMoreComments = false;
		}
	}

	async function updateProgress(pageIndex: number) {
	// إذا كان زائراً، لا تفعل شيئاً
	if (!user) return;
    console.log('%c1. updateProgress CALLED for index:', 'color: orange;', pageIndex);
	// هذه هي خدعة الـ "debounce":
	// أولاً، نلغي أي مؤقت حفظ سابق لم يتم تنفيذه بعد.
	clearTimeout(updateTimeout);

	// ثانياً، نضبط مؤقتاً جديداً. سيتم إرسال طلب الحفظ بعد 500 جزء من الثانية.
	// إذا قام المستخدم بتغيير الصفحة مرة أخرى خلال هذه الفترة، سيتم إلغاء هذا المؤقت والبدء من جديد.
	updateTimeout = setTimeout(async () => {
		console.log('%c2. SENDING REQUEST to API now...', 'color: yellow;');
		try {
			const response = await fetch('/api/update-progress', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					chapterId: chapter.id,
					// نرسل رقم الصفحة الفعلي (index + 1)
					page: pageIndex + 1
				})
			});

			if (!response.ok) {
					console.error('API Error Response:', await response.text());
				} else {
					console.log('%c3. SUCCESS! Progress saved.', 'color: lightgreen; font-weight: bold;');
				}
				
		} catch (err) {
			console.error('Failed to update progress (Fetch Error):', err);
			// في حال فشل الحفظ، يمكننا إظهار رسالة للمستخدم لاحقاً
			console.error('Failed to update progress:', err);
		}
	}, 500); // تأخير لمدة نصف ثانية
}

	$: if (browser && pages.length > 0 && initialLoadComplete) {
		updateProgress(currentPageIndex);
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

	let observer: IntersectionObserver;
let imageElements: HTMLImageElement[] = [];

onMount(async () => {
		// الخطوة 1: انتظر حتى يتم رسم كل شيء على الشاشة
		await tick();

		// الخطوة 2: قم بالتمرير إلى الصفحة الصحيحة فوراً
		if ($readingMode === 'vertical') {
			const pageElement = document.getElementById(`page-${currentPageIndex}`);
			if (pageElement) {
				pageElement.scrollIntoView({ behavior: 'auto', block: 'start' });
			}
		}
		
		resetTimer();

		// الخطوة 3: انتظر جزءاً من الثانية قبل تشغيل المراقب الذكي
		// هذا يعطي المتصفح وقتاً كافياً لإتمام التمرير قبل أن يبدأ المراقب بالعمل
		setTimeout(() => {
			if ($readingMode === 'vertical' && pages?.length > 0) {
				const options = { root: null, rootMargin: '500px 0px', threshold: 0.1 };

				observer = new IntersectionObserver((entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const img = entry.target as HTMLImageElement;
							const src = img.dataset.src;
							if (src) {
								img.src = src;
							}
						}
					});

					if (!initialLoadComplete) return;

					const visiblePages = entries
						.filter((e) => e.isIntersecting)
						.map((e) => ({
							index: imageElements.indexOf(e.target as HTMLImageElement),
							top: e.boundingClientRect.top
						}))
						.filter((p) => p.index !== -1)
						.sort((a, b) => a.top - b.top);

					if (visiblePages.length > 0) {
						currentPageIndex = visiblePages[0].index;
					}
				}, options);

				imageElements.forEach((img) => {
					if (img) observer.observe(img);
				});
			}
			// الخطوة 4: الآن فقط، وبعد أن استقرت الصفحة، يمكن للمراقب أن يبدأ بتحديث التقدم
			initialLoadComplete = true;
		}, 100); // تأخير بسيط لكنه حاسم
	});
	
	onDestroy(() => {
		if (observer) observer.disconnect();
		clearTimeout(inactivityTimer);
		clearTimeout(updateTimeout);
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
			// تحديد مفاتيح التنقل بناءً على اتجاه القراءة
			const goNextKey = $readingDirection === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
			const goPrevKey = $readingDirection === 'rtl' ? 'ArrowRight' : 'ArrowLeft';

			if (event.key === goNextKey) {
				currentPageIndex = Math.min(pages.length - 1, currentPageIndex + step);
			} else if (event.key === goPrevKey) {
				currentPageIndex = Math.max(0, currentPageIndex - step);
			}
		} else {
			if (event.key === 'ArrowRight' && nextChapterExists) {
				goto(`/manga/${manga.slug}/${currentChapter + 1}`);
			} else if (event.key === 'ArrowLeft' && currentChapter > 1) {
				goto(`/manga/${manga.slug}/${currentChapter - 1}`);
			}
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
	<title>قراءة مانجا {manga.title} - الفصل {chapter.chapter_number}</title>
</svelte:head>

<div
	style="position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; overflow: hidden;"
>
	{#each imagesToPreload as src}
		<img {src} alt="Preloading" />
	{/each}
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="reader-container flex min-h-screen w-full flex-col overflow-x-hidden font-[Tajawal]"
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
		class="sticky-header sticky top-0 z-20 bg-gray-900/80 text-white shadow-lg backdrop-blur-md"
		class:header-hidden={!uiVisible}
	>
		<div class="container mx-auto flex items-center justify-between px-4 py-3">
			<a
				href="/manga/{manga.slug}"
				class="text-sm transition-colors hover:text-orange-500 md:text-base"
			>
				&larr; قائمة الفصول
			</a>

			<div class="flex items-center gap-x-2">
				<button
					on:click={() => {
						readingMode.set('vertical');
						showPageDisplayMenu = false; // إغلاق القائمة عند اختيار الوضع العمودي
					}}
					class="rounded-md px-3 py-1 text-sm transition-colors {$readingMode === 'vertical'
						? 'bg-orange-600'
						: 'bg-gray-700 hover:bg-gray-600'}"
				>
					عمودي
				</button>

				<div class="relative">
					<button
						on:click={() => {
							readingMode.set('horizontal');
							showPageDisplayMenu = !showPageDisplayMenu; // فتح/إغلاق القائمة
						}}
						class="flex items-center gap-1 rounded-md px-3 py-1 text-sm transition-colors {$readingMode ===
						'horizontal'
							? 'bg-orange-600'
							: 'bg-gray-700 hover:bg-gray-600'}"
					>
						<span>أفقي</span>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							></path></svg
						>
					</button>

					{#if showPageDisplayMenu && $readingMode === 'horizontal'}
						<div
							class="ring-opacity-5 absolute top-full left-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black focus:outline-none"
						>
							<div class="py-1">
								<button
									on:click={() => {
										pageDisplayMode.set('single');
										showPageDisplayMenu = false; // إغلاق القائمة عند الاختيار
									}}
									class="block w-full px-4 py-2 text-right text-sm text-gray-200 hover:bg-gray-700 {$pageDisplayMode ===
									'single'
										? 'font-bold text-white'
										: ''}"
								>
									صفحة واحدة
								</button>
								<button
									on:click={() => {
										pageDisplayMode.set('double');
										showPageDisplayMenu = false; // إغلاق القائمة عند الاختيار
									}}
									class="block w-full px-4 py-2 text-right text-sm text-gray-200 hover:bg-gray-700 {$pageDisplayMode ===
									'double'
										? 'font-bold text-white'
										: ''}"
								>
									صفحتان
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div class="relative flex items-center gap-x-4">
				<h1 class="hidden text-center text-lg font-bold md:block">
					{manga.title} - #{chapter.chapter_number}
				</h1>

				<!-- svelte-ignore a11y_consider_explicit_label -->
				<button
					on:click={() => (showThumbnails = !showThumbnails)}
					class="text-gray-300 hover:text-white"
					title="قائمة الصفحات"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line
							x1="3"
							y1="9"
							x2="21"
							y2="9"
						></line><line x1="9" y1="21" x2="9" y2="9"></line></svg
					>
				</button>

				<!-- svelte-ignore a11y_consider_explicit_label -->
				<button
					on:click={() => (showSettings = !showSettings)}
					class="text-gray-300 hover:text-white"
					title="إعدادات القارئ"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path
							d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 
0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
						></path><circle cx="12" cy="12" r="3"></circle></svg
					>
				</button>
				<button
					on:click={toggleFullscreen}
					class="text-gray-300 hover:text-white"
					title="تبديل وضع ملء الشاشة (F)"
				>
					{#if isFullscreen}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path
								d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
							/></svg
						>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path
								d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
							/></svg
						>
					{/if}
				</button>

				{#if showSettings}
					<div
						on:click|stopPropagation
						class="absolute top-full right-0 z-30 mt-2 w-72 rounded-lg border border-gray-700 bg-gray-800 p-4 text-sm shadow-lg"
					>
						<div class="mb-4" dir="rtl">
							<p class="mb-2 font-bold text-white">لون الخلفية</p>
							<div class="flex gap-2">
								<button
									on:click={() => readerBackgroundColor.set('black')}
									class:ring-orange-500={$readerBackgroundColor === 'black'}
									class="flex h-8 w-8 items-center justify-center rounded-full border border-gray-600 bg-black text-white ring-2 ring-transparent"
									aria-label="خلفية سوداء"
								>
									{#if $readerBackgroundColor === 'black'}✓{/if}
								</button>
								<button
									on:click={() => readerBackgroundColor.set('white')}
									class:ring-orange-500={$readerBackgroundColor === 'white'}
									class="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 bg-white text-black ring-2 ring-transparent"
									aria-label="خلفية بيضاء"
								>
									{#if $readerBackgroundColor === 'white'}✓{/if}
								</button>
								<button
									on:click={() => readerBackgroundColor.set('#f4e8d8')}
									class:ring-orange-500={$readerBackgroundColor === '#f4e8d8'}
									class="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 bg-[#f4e8d8] text-black ring-2 ring-transparent"
									aria-label="خلفية عتيقة"
								>
									{#if $readerBackgroundColor === '#f4e8d8'}✓{/if}
								</button>
							</div>
						</div>

						<div>
							<p class="mb-2 font-bold text-white" dir="rtl">طريقة عرض الصور</p>
							<div class="flex flex-col gap-2">
								<button
									on:click={() => imageFitMode.set('fit-width')}
									class:bg-orange-600={$imageFitMode === 'fit-width'}
									class="flex w-full items-center justify-end gap-2 rounded bg-gray-700 p-2 text-right hover:bg-gray-600"
								>
									<span>ملاءمة العرض</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><polyline points="21 16 16 21 21 6 16 11"></polyline><polyline
											points="3 8 8 3 3 18 8 13"
										></polyline><line x1="16" y1="4" x2="8" y2="20"></line></svg
									>
								</button>
								<button
									on:click={() => imageFitMode.set('fit-height')}
									class:bg-orange-600={$imageFitMode === 'fit-height'}
									class="flex w-full items-center justify-end gap-2 rounded bg-gray-700 p-2 text-right hover:bg-gray-600"
								>
									<span>ملاءمة الطول</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><polyline points="16 3 21 8 6 8 11 3"></polyline><polyline
											points="8 21 3 16 18 16 13 21"
										></polyline><line x1="4" y1="16" x2="20" y2="8"></line></svg
									>
								</button>
								<button
									on:click={() => imageFitMode.set('original')}
									class:bg-orange-600={$imageFitMode === 'original'}
									class="flex w-full items-center justify-end gap-2 rounded bg-gray-700 p-2 text-right hover:bg-gray-600"
								>
									<span>الحجم الأصلي</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><circle cx="11" cy="11" r="8"></circle><line
											x1="21"
											y1="21"
											x2="16.65"
											y2="16.65"
										></line></svg
									>
								</button>
							</div>

							<div class="mt-4 border-t border-gray-700 pt-4" dir="rtl">
								<p class="mb-2 font-bold text-white">اتجاه القراءة (أفقي)</p>
								<div class="flex flex-col gap-2">
									<button
										on:click={() => readingDirection.set('rtl')}
										class:bg-orange-600={$readingDirection === 'rtl'}
										class="flex w-full items-center justify-start gap-2 rounded bg-gray-700 p-2 text-right hover:bg-gray-600"
									>
										<span>يمين ← يسار (مانجا)</span>
									</button>
									<button
										on:click={() => readingDirection.set('ltr')}
										class:bg-orange-600={$readingDirection === 'ltr'}
										class="flex w-full items-center justify-start gap-2 rounded bg-gray-700 p-2 text-right hover:bg-gray-600"
									>
										<span>يسار ← يمين (ويب)</span>
									</button>
								</div>
							</div>

							<div class="mt-4 border-t border-gray-700 pt-4" dir="rtl">
								<label for="gap-slider" class="mb-2 block font-bold text-white">
									المسافة بين الصفحات (عمودي): {$verticalPagesGap}px
								</label>
								<input
									type="range"
									id="gap-slider"
									min="0"
									max="100"
									bind:value={$verticalPagesGap}
									class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-600"
									disabled={$readingMode !== 'vertical'}
									title={$readingMode !== 'vertical'
										? 'هذا الإعداد يعمل في وضع القراءة العمودي فقط'
										: ''}
								/>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<div
			class="h-1 w-full cursor-pointer bg-gray-600"
			on:click={handleProgressClick}
			role="button"
			tabindex="0"
			aria-label="الانتقال إلى صفحة"
			on:keydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') handleProgressClick(e as any);
			}}
		>
			<div class="pointer-events-none h-1 bg-orange-500" style="width: {progress}%"></div>
		</div>
	</header>

	{#if showSettings}
		<div class="fixed inset-0 z-10" on:click={() => (showSettings = false)}></div>
	{/if}

	{#if showThumbnails}
		<div
			class="thumbnails-sidebar fixed top-0 left-0 z-30 h-full w-48 overflow-y-auto bg-gray-900/90 p-2 backdrop-blur-md"
			dir="ltr"
		>
			<h3 class="p-2 text-center font-bold text-white">الصفحات</h3>
			<div class="grid grid-cols-2 gap-2">
				{#each pages as page, i}
					<a
						href={$readingMode === 'vertical' ? `#page-${i}` : '#'}
						on:click={() => {
							if ($readingMode === 'horizontal') {
								currentPageIndex = i;
							}
							showThumbnails = false;
						}}
						class="thumbnail-item group relative rounded border-2"
						class:border-orange-500={$readingMode === 'horizontal' && currentPageIndex === i}
						class:border-transparent={$readingMode !== 'horizontal' || currentPageIndex !== i}
					>
						<img
							src="{baseCdnUrl}/{page.image_path}?width=150&quality=75"
							alt="صفحة {i + 1}"
							class="h-auto w-full"
							loading="lazy"
						/>
						<div
							class="absolute inset-0 flex items-center justify-center bg-black/50 font-bold text-white opacity-0 transition-opacity group-hover:opacity-100"
						>
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

	<main class="flex flex-grow flex-col items-center pt-8 pb-4">
		{#if pages.length > 0}
			{#if $readingMode === 'vertical'}
				{#each pages as page, i}
					<img
						bind:this={imageElements[i]}
						id="page-{i}"
						src={i < 2 ? `${baseCdnUrl}/${page.image_path}?width=1200&quality=85` : placeholderSrc}
						data-src="{baseCdnUrl}/{page.image_path}?width=1200&quality=85"
						alt="صفحة رقم {page.page_number}"
						class="mx-auto scroll-mt-20 shadow-md"
						style="margin-bottom: {$verticalPagesGap}px;"
						class:fit-width={$imageFitMode === 'fit-width'}
						class:fit-height={$imageFitMode === 'fit-height'}
						class:original-size={$imageFitMode === 'original'}
						loading="lazy"
					/>
				{/each}
			{:else}
				{@const step = $pageDisplayMode === 'double' ? 2 : 1}
				<div class="relative flex w-full flex-grow flex-col items-center justify-center">
					<div
						class="flex items-start justify-center gap-2"
						class:fit-height-container={$imageFitMode === 'fit-height'}
					>
						<img
							src="{baseCdnUrl}/{pages[currentPageIndex].image_path}?width=1200&quality=85"
							alt="صفحة رقم {pages[currentPageIndex].page_number}"
							class="pointer-events-none object-contain shadow-md"
							class:fit-width-horizontal-single={($pageDisplayMode === 'single' ||
								!pages[currentPageIndex + 1]) &&
								$imageFitMode !== 'fit-height'}
							class:fit-width-horizontal-double={$pageDisplayMode === 'double' &&
								pages[currentPageIndex + 1] &&
								$imageFitMode !== 'fit-height'}
							class:fit-height={$imageFitMode === 'fit-height'}
							class:original-size={$imageFitMode === 'original'}
						/>
						{#if $pageDisplayMode === 'double' && pages[currentPageIndex + 1]}
							<img
								src="{baseCdnUrl}/{pages[currentPageIndex + 1].image_path}?width=1200&quality=85"
								alt="صفحة رقم {pages[currentPageIndex + 1].page_number}"
								class="pointer-events-none object-contain shadow-md"
								class:fit-width-horizontal-double={$imageFitMode !== 'fit-height'}
								class:fit-height={$imageFitMode === 'fit-height'}
								class:original-size={$imageFitMode === 'original'}
							/>
						{/if}
					</div>

					<div
						class="absolute inset-0 flex"
						dir={$readingDirection === 'rtl' ? 'rtl' : 'ltr'}
						on:contextmenu|preventDefault
					>
						<!-- svelte-ignore element_invalid_self_closing_tag -->
						<div
							class="h-full flex-1 cursor-pointer"
							on:click={() => (currentPageIndex = Math.max(0, currentPageIndex - step))}
							aria-label="الصفحة السابقة"
						/>
						<!-- svelte-ignore element_invalid_self_closing_tag -->
						<div class="h-full flex-1" on:click={resetTimer} />
						<!-- svelte-ignore element_invalid_self_closing_tag -->
						<div
							class="h-full flex-1 cursor-pointer"
							on:click={() =>
								(currentPageIndex = Math.min(pages.length - step, currentPageIndex + step))}
							aria-label="الصفحة التالية"
						/>
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
		class="reader-footer z-20 container mx-auto flex items-center justify-between px-4 py-6 text-white"
		class:footer-hidden={!uiVisible}
	>
		<a
			href="/manga/{manga.slug}/{currentChapter - 1}"
			class="rounded bg-orange-600 px-6 py-2 transition-colors hover:bg-orange-700 {currentChapter <=
			1
				? 'pointer-events-none opacity-50'
				: ''}">الفصل السابق</a
		>

		<a
			href="/manga/{manga.slug}/{currentChapter + 1}"
			class="rounded bg-orange-600 px-6 py-2 transition-colors hover:bg-orange-700"
			class:pointer-events-none={!nextChapterExists}
			class:opacity-50={!nextChapterExists}
			aria-disabled={!nextChapterExists}>الفصل التالي</a
		>
	</footer>
	<section class="container mx-auto px-4 py-10" dir="rtl">
		<h2 class="mb-6 border-b-2 border-gray-700 pb-2 text-3xl font-bold text-white">
			التعليقات ({comments.length})
		</h2>
		{#if user}
			<form method="POST" action="?/addComment" use:enhance={handleAddComment} class="mb-8">
				<input type="hidden" name="parentId" value="" />
				<div class="rounded-lg bg-gray-800 p-4">
					<textarea
						name="content"
						rows="4"
						placeholder="أكتب تعليق ..."
						class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white focus:border-orange-500 focus:outline-none"
						required
						bind:value={newCommentContent}
					></textarea>
					{#if form?.error}
						<p class="mt-2 text-sm text-red-500">{form.error}</p>
					{/if}
					<button
						type="submit"
						class="mt-4 rounded-lg bg-orange-600 px-6 py-2 font-bold text-white hover:bg-orange-700"
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

		{#if comments.length > 0}
			<div class="mt-8 text-center">
				{#if currentCommentPage < commentsTotalPages}
					<button
						on:click={loadMoreComments}
						disabled={isLoadingMoreComments}
						class="rounded-lg bg-gray-700 px-6 py-2 font-bold text-white transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if isLoadingMoreComments}
							جارٍ التحميل...
						{:else}
							تحميل المزيد من التعليقات
						{/if}
					</button>
				{:else}
					<p class="text-gray-500" dir="rtl">وصلت إلى نهاية التعليقات</p>
				{/if}
			</div>
		{/if}
	</section>
</div>

<style>
	:global(:root:fullscreen .sticky-header) {
		display: none;
	}

	:global(:root:fullscreen .reader-footer) {
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
		max-width: 100%;
		max-height: 90vh;
	}
	.original-size {
		width: auto;
		height: auto;
		max-width: 100%;
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
		max-width: calc(50% - 4px);
		max-height: 85vh;
	}

	.fit-height-container .fit-height {
		max-width: calc(50% - 4px);
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
