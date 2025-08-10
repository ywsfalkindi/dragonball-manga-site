<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { fly } from 'svelte/transition';
	export let data: PageData;

	const { manga, isFavorited, chaptersResult, readChapterIds, lastReadChapter, user } = data;
	const chapters = chaptersResult.items || [];

	let showToast = false;
	let toastMessage = '';
</script>

{#if showToast}
	<div
		in:fly={{ y: -20, duration: 300 }}
		out:fly={{ y: -20, duration: 300 }}
		class="fixed top-20 right-1/2 translate-x-1/2 z-[9999] bg-green-600 text-white py-2 px-6 rounded-lg shadow-lg"
	>
		{toastMessage}
	</div>
{/if}

<svelte:head>
	<title>قراءة مانجا {manga.title} - جميع الفصول</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white font-[Tajawal]">
	<header
		class="relative h-[60vh] flex items-end p-8 bg-cover bg-center bg-fixed"
		style="background-image: url({manga.cover_image_url})"
	>
		<!-- svelte-ignore element_invalid_self_closing_tag -->
		<div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
		<div class="relative z-10">
			<h1 class="text-5xl font-extrabold">{manga.title}</h1>
			<p class="mt-4 text-lg max-w-2xl text-gray-300">{manga.description}</p>

			{#if user}
				<div class="mt-6 flex items-center space-x-4 flex-wrap gap-y-4">
					<form
						method="POST"
						action="?/{isFavorited ? 'unfavorite' : 'favorite'}"
						use:enhance={() => {
							// This code runs just before the form is submitted.
							// We set the message that will be displayed in the toast.
							toastMessage = isFavorited ?
'تمت الإزالة من المفضلة بنجاح' : 'تمت الإضافة إلى المفضلة بنجاح';
							return async ({ update }) => {
								// This code runs after the server action is complete.
								// SvelteKit automatically updates the `data` prop, so `isFavorited` changes.
								// We just need to show the toast.
								showToast = true;
								// Hide the toast after 3 seconds.
								setTimeout(() => {
									showToast = false;
								}, 3000);
							};
						}}
					>
						<button
							type="submit"
							class="bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-orange-500 flex items-center gap-2"
						>
							<span>{isFavorited ? '❤️' : '🤍'}</span>
							<span>{isFavorited ?
'إزالة من المفضلة' : 'إضافة إلى المفضلة'}</span>
						</button>
					</form>
					{#if lastReadChapter}
						<a
							href="/manga/{manga.slug}/{lastReadChapter.chapter_number}?page={lastReadChapter.last_page_read}"
							class="inline-block bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-green-500"
						>
							🚀 أكمل القراءة (الفصل {lastReadChapter.chapter_number})
						</a>
					{/if}
				</div>
			{/if}
		</div>
	</header>

	<main class="container mx-auto px-4 py-12" dir="rtl">
		<h2 class="text-3xl font-bold mb-6 text-orange-500">قائمة الفصول</h2>
		<div class="bg-gray-800 rounded-lg shadow-lg">
			<ul class="divide-y divide-gray-700">
				{#each chapters as chapter (chapter.id)}
					<li class={lastReadChapter?.id === chapter.id ?
'bg-blue-900/30' : ''}>
						<a
							href="/manga/{manga.slug}/{chapter.chapter_number}"
							class="p-4 hover:bg-gray-700/50 transition-colors duration-200 flex items-center justify-between"
						>
							<div class="flex items-center space-x-3 rtl:space-x-reverse gap-x-2">
								<span class="text-xl font-semibold">الفصل {chapter.chapter_number}</span>
								{#if readChapterIds.has(chapter.id)}
									<span class="text-xs bg-blue-500 text-white py-1 px-2 rounded-full">مقروء</span
									>
								{/if}
								{#if lastReadChapter?.id === chapter.id}
									<span class="text-xs bg-green-500 text-white py-1 px-2 rounded-full"
										>آخر قراءة</span
									>
								{/if}
							</div>
							<span
								class="bg-orange-500 text-white text-sm font-bold py-1 px-3 rounded-full"
								>اقرأ الآن</span
							>
						</a>
					</li>
				{:else}
					<li class="p-6 text-center text-gray-400">لم تتم إضافة أي فصول لهذه المانجا بعد.</li>
				{/each}
			</ul>
			<div class="flex justify-center items-center space-x-4 mt-8 pb-6 text-white">
				<a
					href="?page={chaptersResult.page - 1}"
					class="py-2 px-4 bg-gray-700 rounded {chaptersResult.page === 1
						?
'opacity-50 pointer-events-none'
						: 'hover:bg-orange-600'}"
				>
					&laquo; السابق
				</a>
				<span> صفحة {chaptersResult.page} من {chaptersResult.totalPages} </span>
				<a
					href="?page={chaptersResult.page + 1}"
					class="py-2 px-4 bg-gray-700 rounded {chaptersResult.page ===
					chaptersResult.totalPages
						? 'opacity-50 pointer-events-none'
						: 'hover:bg-orange-600'}"
				>
					التالي &raquo;
				</a>
			</div>
		</div>
	</main>
</div>