<svelte:window on:keydown={handleKeydown} />
<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { pageDisplayMode, readingMode } from '$lib/stores/settings';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data: PageData;
	export let form: ActionData;
	const { user, manga, chapter, pages, comments } = data;
	const currentChapter = Number(chapter.chapter_number);
	let currentPageIndex = 0;

	$: progress = pages.length > 0 ? ((currentPageIndex + 1) / pages.length) * 100 : 0;

	let imagesToPreload: string[] = [];
	const PRELOAD_AHEAD_COUNT = 3;

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

	onMount(() => {
		const updateFullscreenStatus = () => {
			isFullscreen = document.fullscreenElement !== null;
		};
		document.addEventListener('fullscreenchange', updateFullscreenStatus);
		return () => document.removeEventListener('fullscreenchange', updateFullscreenStatus);
	});


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

<div class="reader-container bg-black min-h-screen font-[Tajawal]">
	<header class="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-md text-white shadow-lg sticky-header">
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

			<div class="flex items-center gap-x-4">
				<h1 class="font-bold text-lg text-center hidden md:block">{manga.title} - #{chapter.chapter_number}</h1>
				<button on:click={toggleFullscreen} class="text-gray-300 hover:text-white" title="تبديل وضع ملء الشاشة (F)">
					{#if isFullscreen}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
					{/if}
				</button>
			</div>
		</div>
        <div class="w-full bg-gray-600 h-1">
            <div class="bg-orange-500 h-1" style="width: {progress}%"></div>
        </div>
	</header>
	
	<main class="flex flex-col items-center pt-8 pb-4">
		{#if pages.length > 0}
			{#if $readingMode === 'vertical'}
				{#each pages as page}
					<img
						src="{baseCdnUrl}/{page.image_path}?width=1200&quality=85"
						alt="صفحة رقم {page.page_number}"
						class="max-w-full md:max-w-4xl mb-2 shadow-md"
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
						<div class="flex justify-center items-start gap-2">
							<img
								src="{baseCdnUrl}/{pages[currentPageIndex].image_path}?width=1200&quality=85"
								alt="صفحة رقم {pages[currentPageIndex].page_number}"
								class="max-h-[85vh] object-contain shadow-md {($pageDisplayMode === 'single' || !pages[currentPageIndex + 1])
									? 'max-w-full md:max-w-4xl'
									: 'max-w-[48%]'}"
							/>
							{#if $pageDisplayMode === 'double' && pages[currentPageIndex + 1]}
								<img
									src="{baseCdnUrl}/{pages[currentPageIndex + 1].image_path}?width=1200&quality=85"
									alt="صفحة رقم {pages[currentPageIndex + 1].page_number}"
									class="max-w-[48%] max-h-[85vh] object-contain shadow-md"
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
	<footer class="container mx-auto px-4 py-6 flex justify-between items-center text-white">
		<a
			href="/manga/{manga.slug}/{currentChapter - 1}"
			class="bg-orange-600 py-2 px-6 rounded hover:bg-orange-700 transition-colors {currentChapter <= 1
				? 'opacity-50 pointer-events-none'
				: ''}">الفصل السابق</a
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
                            <div class="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center font-bold">
                                {comment.expand.user.email.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div class="bg-gray-800 rounded-lg p-4 flex-grow">
                            <p class="font-bold text-orange-400">{comment.expand.user.email}</p>
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

/* ✨ إخفاء الهيدر في وضع ملء الشاشة ✨ */
:global(:root:fullscreen .sticky-header) {
	display: none;
}
</style>