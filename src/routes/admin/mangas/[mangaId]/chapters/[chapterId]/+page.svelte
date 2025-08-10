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

<div class="min-h-screen bg-gray-900 p-8 font-[Tajawal] text-white">
	<a
		href="/admin/mangas/{data.chapter.expand?.manga.id}"
		class="mb-8 block text-right text-blue-400 hover:underline"
	>
		&larr; العودة إلى تعديل المانجا
	</a>
	<h1 class="mb-2 text-right text-4xl font-bold">
		إدارة صفحات: {data.chapter.expand?.manga.title}
	</h1>
	<p class="mb-8 text-right text-xl text-orange-400">الفصل #{data.chapter.chapter_number}</p>

	<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
		<h2 class="mb-6 text-right text-2xl font-bold">
			قائمة الصفحات ({data.pages.length} صفحة)
		</h2>

		{#if data.pages.length > 0}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				{#each data.pages as page (page.id)}
					<div class="group relative overflow-hidden rounded-lg border-2 border-gray-700">
						<img
							src={page.imageUrl}
							alt="صفحة رقم {page.page_number}"
							class="aspect-[2/3] h-auto w-full object-cover"
						/>
						<div
							class="absolute right-0 bottom-0 left-0 bg-black/70 p-2 text-center text-sm font-semibold"
						>
							صفحة {page.page_number}
						</div>
						<div
							class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
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
								<button class="font-bold text-red-500 hover:text-red-400">حذف</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="py-8 text-center text-gray-400">لا توجد صفحات لعرضها في هذا الفصل.</p>
		{/if}
	</div>
</div>
