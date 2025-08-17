<script lang="ts">
	import type { PageData, ActionData } from './$types';
	export let data: PageData;
	export let form: ActionData;
</script>

<svelte:head><title>إضافة فصل جديد</title></svelte:head>

<div class="min-h-screen bg-gray-900 p-8 font-[Tajawal] text-white">
	<a href="/admin" class="mb-8 block text-right text-blue-400 hover:underline">
		&larr; العودة إلى لوحة التحكم
	</a>
	<h1 class="mb-8 text-right text-4xl font-bold">أداة إضافة فصل جديد</h1>

	<div class="flex justify-end">
		<form
			method="POST"
			class="w-full max-w-xl space-y-6 rounded-lg bg-gray-800 p-8 text-right shadow-lg"
		>
			<div>
				<label for="manga" class="mb-2 block text-gray-300">اختر المانجا</label>
				<select
					name="mangaId"
					id="manga"
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-right text-white"
					required
				>
					{#each data.mangas as manga}
						<option value={manga.id}>{manga.title}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="chapterNumber" class="mb-2 block text-gray-300">رقم الفصل</label>
				<input
					type="number"
					name="chapterNumber"
					id="chapterNumber"
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
					required
				/>
			</div>
			<div>
				<label for="totalPages" class="mb-2 block text-gray-300">إجمالي عدد الصفحات</label>
				<input
					type="number"
					name="totalPages"
					id="totalPages"
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
					required
				/>
			</div>
			<p class="mt-1 text-xs text-gray-400" dir="rtl">
				ملاحظة: سيتم إنشاء أسماء الملفات تلقائيًا بالتنسيق التالي:
				`manga-slug/chapterX/manga-slug-chXX-pX.webp`.
			</p>

			{#if form?.error}
				<p class="text-center text-red-500">{form.error}</p>
			{/if}
			{#if form?.success}
				<p class="text-center text-green-500">{form.success}</p>
			{/if}

			<button
				type="submit"
				class="w-full rounded bg-green-600 px-4 py-3 font-bold text-white transition-colors hover:bg-green-700"
			>
				بدء الإضافة
			</button>
		</form>
	</div>
</div>
