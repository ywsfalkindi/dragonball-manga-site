<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
</script>

<svelte:head>
	<title>إدارة المانجا</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 p-8 font-[Tajawal] text-white">
	<a href="/admin" class="mb-8 block text-right text-blue-400 hover:underline">
		&larr; العودة إلى لوحة التحكم
	</a>

	<div class="mb-8 flex flex-row-reverse items-center justify-between">
		<h1 class="text-4xl font-bold">إدارة المانجا</h1>
		<a href="/admin/mangas/new" class="rounded bg-green-600 px-6 py-2 hover:bg-green-700">
			إضافة مانجا جديدة
		</a>
	</div>

	<div class="overflow-x-auto rounded-lg bg-gray-800 shadow-lg">
		<table class="w-full text-right">
			<thead class="bg-gray-700">
				<tr>
					<th class="p-4">العنوان</th>
					<th class="p-4">Slug (الرابط)</th>
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
						<td class="flex justify-end gap-2 p-4">
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
