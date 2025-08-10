<script lang="ts">
	import type { RecordModel } from 'pocketbase';
	export let manga: RecordModel;
</script>

<a
	href="/manga/{manga.slug}"
	class="group flex transform flex-col overflow-hidden rounded-lg bg-gray-800 shadow-xl transition-all duration-300 hover:-translate-y-2"
>
	<div class="manga-card-image-container w-full overflow-hidden">
		<img
			src={manga.cover_image_url}
			alt="غلاف مانجا {manga.title}"
			class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
		/>
	</div>
	<div class="flex flex-grow flex-col p-4 md:p-6">
		<h3 class="mb-2 text-xl font-bold md:text-2xl">{manga.title}</h3>
		<p class="line-clamp-3 text-sm leading-relaxed text-gray-400 md:text-base">
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
