<script lang="ts">
	import { enhance } from '$app/forms';
	// ✨ تم حذف استيراد ActionData لأنه لم يعد مستخدماً هنا

	// تعريف البيانات التي يستقبلها المكون
	export let manga: any;
	export let user: any;
	export let lastReadChapter: any;
	export let isFavorited: boolean;
	export let isSubmitting: boolean;
	// ✨ تم حذف خاصية "form" غير المستخدمة

	// لتحديد الفصل الأول في حال لم يبدأ المستخدم القراءة بعد
	const firstChapterNumber = manga.expand?.['chapters(manga)']?.[0]?.chapter_number || 1;
</script>

<header
	class="relative flex h-[60vh] items-end bg-cover bg-fixed bg-center p-8"
	style="--bg-image-url: url({manga.cover_image_url}); background-image: var(--bg-image-url);"
>
	<div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
	<div class="relative z-10 w-full">
		<h1 class="text-5xl font-extrabold">{manga.title}</h1>
		<div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-300">
			{#if manga.status}
				<span>الحالة: <span class="font-bold text-orange-400">{manga.status}</span></span>
			{/if}
			{#if manga.author}
				<span>المؤلف: <span class="font-bold text-orange-400">{manga.author}</span></span>
			{/if}
		</div>
		<p class="mt-4 max-w-2xl text-lg text-gray-300">{manga.description}</p>

		{#if user}
			<div class="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
				{#if lastReadChapter}
					<a
						href="/manga/{manga.slug}/{lastReadChapter.chapter_number}?page={lastReadChapter.last_page_read}"
						class="inline-block rounded-lg bg-green-600 px-6 py-3 text-center font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
					>
						🚀 أكمل القراءة (الفصل {lastReadChapter.chapter_number})
					</a>
				{:else}
					<a
						href="/manga/{manga.slug}/{firstChapterNumber}"
						class="inline-block rounded-lg bg-green-600 px-6 py-3 text-center font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
					>
						📖 ابدأ القراءة (الفصل {firstChapterNumber})
					</a>
				{/if}

				<form
					method="POST"
					action="?/toggleFavorite"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
						};
					}}
				>
					<input type="hidden" name="mangaId" value={manga.id} />
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
							<span>{isFavorited ? '❤️' : '🤍'}</span>
							<span>{isFavorited ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}</span>
						{/if}
					</button>
				</form>
			</div>
		{/if}
	</div>
</header>
