<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
</script>

<svelte:head>
	<title
		>إدارة صفحات الفصل #{data.chapter.chapter_number} - {data.chapter.expand?.manga.title}</title
	>
</svelte:head>

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white">
	<a
		href="/admin/mangas/{data.chapter.expand?.manga.id}"
		class="text-blue-400 hover:underline mb-8 block text-right"
	>
		&larr; العودة إلى تعديل المانجا
	</a>
	<h1 class="text-4xl font-bold mb-2 text-right">
		إدارة صفحات: {data.chapter.expand?.manga.title}
	</h1>
	<p class="text-xl text-orange-400 mb-8 text-right">الفصل #{data.chapter.chapter_number}</p>

	<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
		<h2 class="text-2xl font-bold mb-6 text-right">
			قائمة الصفحات ({data.pages.length} صفحة)
		</h2>

		{#if data.pages.length > 0}
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{#each data.pages as page (page.id)}
					<div class="relative group border-2 border-gray-700 rounded-lg overflow-hidden">
						<img
							src={page.imageUrl}
							alt="صفحة رقم {page.page_number}"
							class="w-full h-auto aspect-[2/3] object-cover"
						/>
						<div
							class="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-center text-sm font-semibold"
						>
							صفحة {page.page_number}
						</div>
						<div
							class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
						>
							<form
								method="POST"
								action="?/deletePage"
								use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'success') {
											// تحديث الواجهة فورًا عند الحذف
											data.pages = data.pages.filter((p) => p.id !== page.id);
										}
									};
								}}
								on:submit|preventDefault={(e) => {
									if (!confirm(`هل أنت متأكد من حذف الصفحة رقم ${page.page_number}؟`)) {
										e.preventDefault();
									}
								}}
							>
								<input type="hidden" name="pageId" value={page.id} />
								<button class="text-red-500 hover:text-red-400 font-bold">حذف</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-gray-400 text-center py-8">لا توجد صفحات لعرضها في هذا الفصل.</p>
		{/if}
	</div>
</div>