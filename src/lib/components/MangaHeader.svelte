<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { Manga, LastReadChapterInfo, Chapter } from '$lib/types';
	import { fly, fade } from 'svelte/transition';

	export let manga: Manga;
	export let user: any;
	export let lastReadChapter: LastReadChapterInfo | null;
	export let firstUnreadChapter: Chapter | null;
	export let isFavorited: boolean;
	export let isSubmitting: boolean;
	

	const startChapterNumber = firstUnreadChapter?.chapter_number || 1;

	let isActionsMenuOpen = false;

	function closeMenu() {
		isActionsMenuOpen = false;
	}
</script>

<svelte:body on:click={() => (isActionsMenuOpen = false)} />

<header
	class="relative flex min-h-[60vh] items-end bg-cover bg-fixed bg-center p-4 md:p-8"
	style="background-image: url({manga.cover_image_url});"
>
	<div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
	<div class="relative z-10 w-full">
		<h1 class="text-4xl font-extrabold text-white md:text-5xl" dir="rtl">{manga.title}</h1>
		<div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-300" dir="rtl">
			<span>الحالة: <span class="font-bold text-orange-400">{manga.status}</span></span>
			<span>المؤلف: <span class="font-bold text-orange-400">{manga.author}</span></span>
		</div>
		
		<p class="mt-4 max-w-2xl text-base text-gray-200 md:text-lg" dir="rtl">{manga.description}</p>

		{#if user}
			<div class="mt-6" dir="rtl">
				<div class="relative inline-block text-left">
					<div>
						<button
							on:click|stopPropagation={() => (isActionsMenuOpen = !isActionsMenuOpen)}
							type="button"
							class="inline-flex transform items-center justify-center gap-x-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
							id="menu-button"
							aria-expanded={isActionsMenuOpen}
							aria-haspopup="true"
						>
							إجراءات
							<svg
								class="h-5 w-5 text-gray-200 transition-transform duration-300 {isActionsMenuOpen
									? 'rotate-180'
									: ''}"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fill-rule="evenodd"
									d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</div>

					{#if isActionsMenuOpen}
						<div
							in:fly={{ x: 10, duration: 200 }}
							out:fade={{ duration: 150 }}
							on:click|stopPropagation
							on:keydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') closeMenu(); }}
							tabindex="0"
							class="absolute z-20 top-0 right-full mr-2 w-60 origin-right rounded-xl bg-gray-800/80 shadow-2xl ring-1 ring-black ring-opacity-5 backdrop-blur-sm focus:outline-none"
							role="menu"
							aria-orientation="vertical"
							aria-labelledby="menu-button"
						>
							<div class="p-1" role="none">
								{#if lastReadChapter}
									<a
										href="/manga/{manga.slug}/{lastReadChapter.chapter_number}?page={lastReadChapter.last_page_read}"
										class="group flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm text-gray-200 transition-colors duration-200 hover:bg-indigo-500/30 hover:text-white"
										role="menuitem"
										on:click={closeMenu}
									>
										<span>أكمل القراءة (فصل {lastReadChapter.chapter_number})</span>
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 text-gray-400 group-hover:text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
									</a>
									{#if firstUnreadChapter && firstUnreadChapter.id !== lastReadChapter.id}
										<a
											href="/manga/{manga.slug}/{firstUnreadChapter.chapter_number}"
											class="group flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm text-gray-200 transition-colors duration-200 hover:bg-indigo-500/30 hover:text-white"
											role="menuitem"
											on:click={closeMenu}
										>
										<span>تابع من (فصل {firstUnreadChapter.chapter_number})</span>
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 text-gray-400 group-hover:text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691V5.25a3.375 3.375 0 00-3.375-3.375H8.25a3.375 3.375 0 00-3.375 3.375v5.25m5.9-4.875A.75.75 0 0115.75 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" /></svg>
										</a>
									{/if}
								{:else}
									<a
										href="/manga/{manga.slug}/{startChapterNumber}"
										class="group flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm text-gray-200 transition-colors duration-200 hover:bg-indigo-500/30 hover:text-white"
										role="menuitem"
										on:click={closeMenu}
									>
									    <span>ابدأ القراءة</span>
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 text-gray-400 group-hover:text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
									</a>
								{/if}

								<form
									method="POST"
									action="?/toggleFavorite"
									use:enhance={() => {
										isSubmitting = true;
										isFavorited = !isFavorited;
										return async ({ update }) => {
											await update({ reset: false });
											await invalidateAll();
											isSubmitting = false;
											closeMenu();
										};
									}}
								>
									<input type="hidden" name="mangaId" value={manga.id} />
									<input type="hidden" name="isFavorited" value={isFavorited} />
									<button
										type="submit"
										disabled={isSubmitting}
										class="group flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm text-gray-200 transition-colors duration-200 hover:bg-indigo-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
									>
										{#if isSubmitting}
											<span>جاري...</span>
										{:else}
                                            <span>{isFavorited ? 'إزالة من المفضلة' : 'أضف للمفضلة'}</span>
											<svg xmlns="http://www.w3.org/2000/svg" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 {isFavorited ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'} transition-all duration-300 group-hover:scale-110"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
										{/if}
									</button>
								</form>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</header>