<script lang="ts">
	import type { PageData, ActionData } from './$types';
	export let data: PageData;
	export let form: ActionData;
</script>

<svelte:head><title>إضافة فصل جديد</title></svelte:head>

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white">
	<a href="/admin" class="text-blue-400 hover:underline mb-8 block text-right">
		&larr; العودة إلى لوحة التحكم
	</a>
	<h1 class="text-4xl font-bold mb-8 text-right">أداة إضافة فصل جديد</h1>

	<div class="flex justify-end">
		<form
			method="POST"
			class="max-w-xl bg-gray-800 p-8 rounded-lg shadow-lg space-y-6 text-right w-full"
		>
			<div>
				<label for="manga" class="block text-gray-300 mb-2">اختر المانجا</label>
				<select
					name="mangaId"
					id="manga"
					class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 text-right"
					required
				>
					{#each data.mangas as manga}
						<option value={manga.id}>{manga.title}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="chapterNumber" class="block text-gray-300 mb-2">رقم الفصل</label>
				<input
					type="number"
					name="chapterNumber"
					id="chapterNumber"
					class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
					required
				/>
			</div>
			<div>
				<label for="totalPages" class="block text-gray-300 mb-2">إجمالي عدد الصفحات</label>
				<input
					type="number"
					name="totalPages"
					id="totalPages"
					class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
					required
				/>
			</div>
			<p class="text-xs text-gray-400 mt-1">
				ملاحظة: سيتم إنشاء أسماء الملفات تلقائيًا بالتنسيق التالي: `manga-slug/chapterX/manga-slug-chXX-pX.jpg`.
			</p>

			{#if form?.error}
				<p class="text-red-500 text-center">{form.error}</p>
			{/if}
			{#if form?.success}
				<p class="text-green-500 text-center">{form.success}</p>
			{/if}

			<button
				type="submit"
				class="w-full bg-green-600 text-white font-bold py-3 px-4 rounded hover:bg-green-700 transition-colors"
			>
				بدء الإضافة
			</button>
		</form>
	</div>
</div>