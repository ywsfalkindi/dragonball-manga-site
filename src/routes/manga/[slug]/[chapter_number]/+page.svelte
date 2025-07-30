<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { readingMode } from '$lib/stores/settings';

	export let data: PageData;
	export let form: ActionData;

	const { user, manga, chapter, pages, comments } = data;
	const currentChapter = Number(chapter.chapter_number);

	let currentPageIndex = 0;

	// تأكد من استبدال الرابط بالرابط الصحيح الخاص بك من Bunny.net
	const baseCdnUrl = "https://dragonball-cdn.b-cdn.net";
</script>

<svelte:head>
	<title>قراءة مانجا {manga.title} - الفصل #{chapter.chapter_number}</title>
</svelte:head>

<div class="reader-container bg-black min-h-screen font-[Tajawal]">
	<header class="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-md text-white shadow-lg">
		<div class="container mx-auto px-4 py-3 flex justify-between items-center">
			<a href="/manga/{manga.slug}" class="hover:text-orange-500 transition-colors text-sm md:text-base">
				&larr; قائمة الفصول
			</a>

			<div class="flex items-center space-x-2">
				<button
					on:click={() => readingMode.set('vertical')}
					class="px-3 py-1 rounded-md text-sm transition-colors {$readingMode === 'vertical'
						? 'bg-orange-600'
						: 'bg-gray-700 hover:bg-gray-600'}"
				>
					عمودي
				</button>
				<button
					on:click={() => readingMode.set('horizontal')}
					class="px-3 py-1 rounded-md text-sm transition-colors {$readingMode === 'horizontal'
						? 'bg-orange-600'
						: 'bg-gray-700 hover:bg-gray-600'}"
				>
					أفقي
				</button>
			</div>

			<h1 class="font-bold text-lg text-center hidden md:block">{manga.title} - #{chapter.chapter_number}</h1>
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
				<div class="w-full flex flex-col items-center justify-center min-h-[70vh]">
					<div class="relative w-full md:max-w-4xl flex items-center justify-center">
						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button
							on:click={() => (currentPageIndex = Math.max(0, currentPageIndex - 1))}
							class="absolute left-2 md:-left-12 z-10 p-3 bg-black/50 rounded-full hover:bg-black/80 disabled:opacity-0 transition-opacity"
							disabled={currentPageIndex === 0}
							title="الصفحة السابقة"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
						</button>

						<img
							src="{baseCdnUrl}/{pages[currentPageIndex].image_path}?width=1200&quality=85"
							alt="صفحة رقم {pages[currentPageIndex].page_number}"
							class="max-w-full shadow-md"
						/>

						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button
							on:click={() => (currentPageIndex = Math.min(pages.length - 1, currentPageIndex + 1))}
							class="absolute right-2 md:-right-12 z-10 p-3 bg-black/50 rounded-full hover:bg-black/80 disabled:opacity-0 transition-opacity"
							disabled={currentPageIndex === pages.length - 1}
							title="الصفحة التالية"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
						</button>
					</div>
					<p class="mt-4 text-gray-400">صفحة {currentPageIndex + 1} من {pages.length}</p>
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
</style>