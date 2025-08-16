<script lang="ts">
	import type { RecordModel } from 'pocketbase';

	// نستقبل كل البيانات الجديدة هنا
	export let manga: RecordModel;
	// svelte-ignore export_let_unused
	export let isNew: boolean = false;
	// svelte-ignore export_let_unused
	export let isTrending: boolean = false;
	// svelte-ignore export_let_unused
	export let chapters_count: number | null = null;
</script>

<a
	href="/manga/{manga.slug}"
	class="group flex transform flex-col overflow-hidden rounded-lg bg-gray-800 shadow-xl transition-all duration-300 hover:-translate-y-2"
>
	<div class="manga-card-image-container relative w-full overflow-hidden">
		<div class="absolute top-2 right-2 z-10 flex flex-row-reverse flex-wrap items-center gap-2">
			{#if manga.status === 'مستمرة'}
				<span class="rounded-full bg-blue-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
					مستمرة
				</span>
			{:else if manga.status === 'مكتملة'}
				<span class="rounded-full bg-green-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
					مكتملة
				</span>
			{:else if manga.status === 'متوقفة'}
				<span class="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
					متوقفة
				</span>
			{/if}

			{#if manga.isNew}
				<span class="rounded-full bg-yellow-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
					فصل جديد
				</span>
			{/if}

			{#if manga.isTrending}
				<span
					class="rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 px-2.5 py-1 text-xs font-bold text-white shadow-md"
				>
					رائج
				</span>
			{/if}

			{#if manga.chapters_count && manga.chapters_count > 0}
				<span
					class="flex items-center gap-1 rounded-full bg-gray-900/70 px-2.5 py-1 text-xs font-bold text-white shadow-md backdrop-blur-sm"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-3.5 w-3.5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M9 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM6 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
						/>
					</svg>
					{manga.chapters_count}
				</span>
			{/if}
		</div>

		<img
			src={manga.cover_image_url}
			alt="غلاف مانجا {manga.title}"
			class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
			loading="lazy"
		/>
	</div>
	<div class="flex flex-grow flex-col p-4 md:p-6">
		<h3 class="mb-2 text-xl font-bold md:text-2xl" dir="rtl">{manga.title}</h3>
		<p class="line-clamp-3 text-sm leading-relaxed text-gray-400 md:text-base" dir="rtl">
			{manga.description}
		</p>
	</div>
</a>

<style>
	.line-clamp-3 {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
	}
</style>
