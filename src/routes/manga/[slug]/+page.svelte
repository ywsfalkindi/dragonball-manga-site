<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { fly } from 'svelte/transition';
	export let data: PageData;

	const { manga, isFavorited, chaptersResult, readChapterIds, lastReadChapter, user } = data;
	const chapters = chaptersResult.items || [];
	const latestChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;

	let showToast = false;
	let toastMessage = '';
</script>

{#if showToast}
	<div
		in:fly={{ y: -20, duration: 300 }}
		out:fly={{ y: -20, duration: 300 }}
		class="fixed top-20 right-1/2 z-[9999] translate-x-1/2 rounded-lg bg-green-600 px-6 py-2 text-white shadow-lg"
	>
		{toastMessage}
	</div>
{/if}

<svelte:head>
	<title>قراءة مانجا {manga.title} - جميع الفصول</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 font-[Tajawal] text-white">
	<header
		class="relative flex h-[60vh] items-end bg-cover bg-fixed bg-center p-8"
		style="background-image: url({manga.cover_image_url})"
	>
		<!-- svelte-ignore element_invalid_self_closing_tag -->
		<div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
		<div class="relative z-10">
			<h1 class="text-5xl font-extrabold">{manga.title}</h1>
			<p class="mt-4 max-w-2xl text-lg text-gray-300">{manga.description}</p>

			{#if user}
				<div
					class="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
					dir="rtl"
				>
					{#if lastReadChapter}
						<a
							href="/manga/{manga.slug}/{lastReadChapter.chapter_number}?page={lastReadChapter.last_page_read}"
							class="inline-block w-full rounded-lg bg-green-600 px-6 py-3 text-center font-bold text-white shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none sm:w-auto"
						>
							🚀 أكمل القراءة (الفصل {lastReadChapter.chapter_number})
						</a>
					{:else}
						<a
							href="/manga/{manga.slug}/1"
							class="inline-block w-full rounded-lg bg-green-600 px-6 py-3 text-center font-bold text-white shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none sm:w-auto"
						>
							📖 ابدأ القراءة (الفصل 1)
						</a>
					{/if}

					<div class="flex w-full flex-row-reverse gap-3 sm:w-auto">
						<form
							class="flex-grow"
							method="POST"
							action="?/{isFavorited ? 'unfavorite' : 'favorite'}"
							use:enhance={() => {
								toastMessage = isFavorited
									? 'تمت الإزالة من المفضلة بنجاح'
									: 'تمت الإضافة إلى المفضلة بنجاح';
								return async ({ update }) => {
									showToast = true;
									setTimeout(() => {
										showToast = false;
									}, 3000);
								};
							}}
						>
							<button
								type="submit"
								class="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-bold whitespace-nowrap text-white shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none {isFavorited
									? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
									: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'}"
							>
								<span>{isFavorited ? '❤️' : '🤍'}</span>
								<span>{isFavorited ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}</span>
							</button>
						</form>

						{#if latestChapter}
							<a
								href="/manga/{manga.slug}/{latestChapter.chapter_number}"
								aria-label="الانتقال إلى آخر فصل"
								class="flex flex-grow items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-bold whitespace-nowrap text-white shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-105 hover:bg-indigo-700 hover:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									stroke-linejoin="round"><path d="m13 17 5-5-5-5" /><path d="m6 17 5-5-5-5" /></svg
								>
								<span>آخر فصل</span>
							</a>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</header>

	<main class="container mx-auto px-4 py-12" dir="rtl">
		<h2 class="mb-6 text-3xl font-bold text-orange-500">قائمة الفصول</h2>
		<div class="rounded-lg bg-gray-800 shadow-lg">
			<ul class="divide-y divide-gray-700">
				{#each chapters as chapter (chapter.id)}
					<li class={lastReadChapter?.id === chapter.id ? 'bg-blue-900/30' : ''}>
						<a
							href="/manga/{manga.slug}/{chapter.chapter_number}"
							class="flex items-center justify-between p-4 transition-colors duration-200 hover:bg-gray-700/50"
						>
							<div class="flex items-center gap-x-2 space-x-3 rtl:space-x-reverse">
								<span class="text-xl font-semibold">الفصل {chapter.chapter_number}</span>
								{#if readChapterIds.has(chapter.id)}
									<span class="rounded-full bg-blue-500 px-2 py-1 text-xs text-white">مقروء</span>
								{/if}
								{#if lastReadChapter?.id === chapter.id}
									<span class="rounded-full bg-green-500 px-2 py-1 text-xs text-white"
										>آخر قراءة</span
									>
								{/if}
							</div>
							<span class="rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white"
								>اقرأ الآن</span
							>
						</a>
					</li>
				{:else}
					<li class="p-6 text-center text-gray-400">لم تتم إضافة أي فصول لهذه المانجا بعد.</li>
				{/each}
			</ul>
			<div class="mt-8 flex items-center justify-center space-x-4 pb-6 text-white">
				<a
					href="?page={chaptersResult.page - 1}"
					class="rounded bg-gray-700 px-4 py-2 {chaptersResult.page === 1
						? 'pointer-events-none opacity-50'
						: 'hover:bg-orange-600'}"
				>
					&laquo; السابق
				</a>
				<span> صفحة {chaptersResult.page} من {chaptersResult.totalPages} </span>
				<a
					href="?page={chaptersResult.page + 1}"
					class="rounded bg-gray-700 px-4 py-2 {chaptersResult.page === chaptersResult.totalPages
						? 'pointer-events-none opacity-50'
						: 'hover:bg-orange-600'}"
				>
					التالي &raquo;
				</a>
			</div>
		</div>
	</main>
</div>