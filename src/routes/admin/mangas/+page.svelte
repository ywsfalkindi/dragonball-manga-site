<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
</script>

<svelte:head>
	<title>إدارة المانجا</title>
</svelte:head>

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white">
	<a href="/admin" class="text-blue-400 hover:underline mb-8 block">&larr; العودة إلى لوحة التحكم</a>

	<div class="flex justify-between items-center mb-8">
		<h1 class="text-4xl font-bold">إدارة المانجا</h1>
		<a href="/admin/mangas/new" class="bg-green-600 py-2 px-6 rounded hover:bg-green-700">
			إضافة مانجا جديدة
		</a>
	</div>

	<div class="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
		<table class="w-full text-right">
			<thead class="bg-gray-700">
				<tr>
					<th class="p-4">العنوان</th>
					<th class="p-4">Slug</th>
					<th class="p-4">الحالة</th>
					<th class="p-4">إجراءات</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-700">
				{#each data.mangas as manga (manga.id)}
					<tr class="hover:bg-gray-700/50">
						<td class="p-4 font-semibold">{manga.title}</td>
						<td class="p-4 text-gray-400" dir="ltr">{manga.slug}</td>
						<td class="p-4 text-gray-400">{manga.status}</td>
						<td class="p-4 flex gap-2">
							<a href="/admin/mangas/{manga.id}" class="text-blue-400 hover:underline">تعديل</a>
							<form
								method="POST"
								action="?/deleteManga"
								use:enhance
								on:submit|preventDefault={(e) => {
									if (!confirm(`هل أنت متأكد من حذف مانجا "${manga.title}"؟`)) {
										e.preventDefault();
									}
								}}
							>
								<input type="hidden" name="mangaId" value={manga.id} />
								<button type="submit" class="text-red-400 hover:underline">حذف</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>