<!-- src/lib/components/MangaHeader.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	// ✨ 1. استيراد الدالة السحرية
	import { invalidateAll } from '$app/navigation';
	import type { Manga, LastReadChapterInfo, Chapter } from '$lib/types';

	export let manga: Manga;
	export let user: any;
	export let lastReadChapter: LastReadChapterInfo | null;
	export let firstUnreadChapter: Chapter | null;
	export let isFavorited: boolean;
	export let isSubmitting: boolean;
	export let readCount: number;

	const startChapterNumber = firstUnreadChapter?.chapter_number || 1;
</script>

<header
	class="relative flex min-h-[60vh] items-end bg-cover bg-fixed bg-center p-4 md:p-8"
	style="background-image: url({manga.cover_image_url});"
>
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
	<div class="relative z-10 w-full">
		<h1 class="text-4xl font-extrabold md:text-5xl">{manga.title}</h1>
		<div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-300">
			<span>الحالة: <span class="font-bold text-orange-400">{manga.status}</span></span>
			<span>المؤلف: <span class="font-bold text-orange-400">{manga.author}</span></span>
		</div>
		{#if user && manga.total_chapters && manga.total_chapters > 0}
			<div class="mt-3">
				<span>
					تقدمك: <span class="font-bold text-green-400">{readCount} / {manga.total_chapters}</span>
					({Math.round((readCount / manga.total_chapters) * 100)}%)
				</span>
				<div class="mt-1 h-2.5 w-full max-w-sm rounded-full bg-gray-700">
					<div
						class="h-2.5 rounded-full bg-green-500"
						style="width: {Math.round((readCount / manga.total_chapters) * 100)}%"
					></div>
				</div>
			</div>
		{/if}
		<p class="mt-4 max-w-2xl text-base text-gray-200 md:text-lg">{manga.description}</p>

		{#if user}
			<div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
				{#if lastReadChapter}
					<a
						href="/manga/{manga.slug}/{lastReadChapter.chapter_number}?page={lastReadChapter.last_page_read}"
						class="inline-block rounded-lg bg-green-600 px-6 py-3 text-center font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
					>
						🚀 أكمل القراءة (فصل {lastReadChapter.chapter_number})
					</a>
					{#if firstUnreadChapter && firstUnreadChapter.id !== lastReadChapter.id}
						<a
							href="/manga/{manga.slug}/{firstUnreadChapter.chapter_number}"
							class="inline-block rounded-lg bg-blue-600 px-6 py-3 text-center font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
						>
							📖 تابع من (فصل {firstUnreadChapter.chapter_number})
						</a>
					{/if}
				{:else}
					<a
						href="/manga/{manga.slug}/{startChapterNumber}"
						class="inline-block rounded-lg bg-green-600 px-6 py-3 text-center font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
					>
						📖 ابدأ القراءة
					</a>
				{/if}

				<form
					method="POST"
					action="?/toggleFavorite"
					use:enhance={() => {
						isSubmitting = true;
						// تحديث الواجهة بشكل متفائل وفوري
						isFavorited = !isFavorited;

						// ✨ 2. تعديل ما يحدث بعد اكتمال العملية
						return async ({ update }) => {
							// هذه الدالة تعمل بعد استجابة الخادم
							await update({ reset: false });

							// ✅ الحل: نطلب تحديث كل بيانات الصفحة من الخادم
							await invalidateAll();

							isSubmitting = false;
						};
					}}
				>
					<input type="hidden" name="mangaId" value={manga.id} />
					<!-- ✅ الإصلاح: نرسل الحالة الحقيقية للمفضلة وقت الضغط على الزر -->
					<input type="hidden" name="isFavorited" value={isFavorited} />
					<button
						type="submit"
						disabled={isSubmitting}
						class="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-500 {isFavorited
							? 'bg-red-600 hover:bg-red-700'
							: 'bg-orange-600 hover:bg-orange-700'}"
					>
						{#if isSubmitting}
							<span>جاري...</span>
						{:else}
							<span class="transition-transform duration-300 {isFavorited ? 'scale-125' : ''}"
								>{isFavorited ? '❤️' : '🤍'}</span
							>
							<span>{isFavorited ? 'في المفضلة' : 'أضف للمفضلة'}</span>
						{/if}
					</button>
				</form>
			</div>
		{/if}
	</div>
</header>
