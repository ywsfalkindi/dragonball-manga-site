<script lang="ts">
	import type { PageData, ActionData } from './$types';
	export let data: PageData;
	export let form: ActionData;
	let mangaData = data.manga || {
		title: '',
		slug: '',
		description: '',
		status: 'ongoing',
		folder_name: '',
		file_prefix: ''
	};

	$: if (form?.manga) {
		mangaData = form.manga;
	}
</script>

<svelte:head>
	<title>{data.manga ? `تعديل: ${data.manga.title}` : 'إضافة مانجا جديدة'}</title>
</svelte:head>

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white">
	<a href="/admin/mangas" class="text-blue-400 hover:underline mb-8 block text-right"
		>&larr; العودة لإدارة المانجا</a
	>
	<h1 class="text-4xl font-bold mb-8 text-right">
		{data.manga ? 'تعديل مانجا' : 'إضافة مانجا جديدة'}
	</h1>

	<div class="flex flex-col-reverse lg:flex-row-reverse gap-8 justify-end">
		{#if data.manga}
			<div class="lg:w-1/3 w-full">
				<h2 class="text-2xl font-bold mb-4 text-right">إدارة الفصول</h2>
				<div class="bg-gray-800 p-4 rounded-lg shadow-lg max-h-screen overflow-y-auto">
					<ul class="space-y-2">
						{#each data.chapters as chapter (chapter.id)}
							<li class="bg-gray-700 p-3 rounded flex justify-between items-center">
								<span class="font-semibold">الفصل #{chapter.chapter_number}</span>
								<div class="flex gap-2">
									<a href="/admin/mangas/{data.manga.id}/chapters/{chapter.id}" class="text-sm text-blue-400 hover:underline">
    إدارة الصفحات
</a>
								</div>
							</li>
						{:else}
							<p class="text-gray-400 text-center">لا توجد فصول لهذه المانجا بعد.</p>
						{/each}
					</ul>
				</div>
			</div>
		{/if}

		<form
			method="POST"
			action="?/save"
			class="max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg space-y-6 text-right w-full"
		>
			<div>
				<label for="title" class="block text-gray-300 mb-2">عنوان المانجا</label>
				<input
					type="text"
					name="title"
					id="title"
					bind:value={mangaData.title}
					class="w-full bg-gray-700 text-white rounded p-2"
					required
				/>
			</div>
			<div>
				<label for="slug" class="block text-gray-300 mb-2">Slug (الرابط)</label>
				<input
					dir="ltr"
					type="text"
					name="slug"
					id="slug"
					bind:value={mangaData.slug}
					class="w-full bg-gray-700 text-white rounded p-2 text-left"
					required
				/>
				<p class="text-xs text-gray-400 mt-1">
					يستخدم في الرابط، مثال: "dragon-ball-super". يجب أن يكون فريداً.
				</p>
			</div>
			<div>
				<label for="description" class="block text-gray-300 mb-2">الوصف</label>
				<textarea
					name="description"
					id="description"
					rows="4"
					bind:value={mangaData.description}
					class="w-full bg-gray-700 text-white rounded p-2"
				></textarea>
			</div>
			<div>
				<label for="status" class="block text-gray-300 mb-2">الحالة</label>
				<select
					name="status"
					id="status"
					bind:value={mangaData.status}
					class="w-full bg-gray-700 text-white rounded p-2 text-right"
				>
					<option value="ongoing">مستمرة</option>
					<option value="completed">مكتملة</option>
				</select>
			</div>
			<div class="pt-4 border-t border-gray-700">
				<h3 class="font-bold text-lg mb-2 text-orange-400">إعدادات الملفات (لأداة إضافة الفصول)</h3>
				<div>
					<label for="folder_name" class="block text-gray-300 mb-2">اسم المجلد</label>
					<input
						dir="ltr"
						type="text"
						name="folder_name"
						id="folder_name"
						bind:value={mangaData.folder_name}
						class="w-full bg-gray-700 text-white rounded p-2 text-left"
						required
					/>
					<p class="text-xs text-gray-400 mt-1">اسم المجلد الذي يحتوي فصول المانجا. مثال: "dbs".</p>
				</div>
				<div class="mt-4">
					<label for="file_prefix" class="block text-gray-300 mb-2">بادئة اسم الملف</label>
					<input
						dir="ltr"
						type="text"
						name="file_prefix"
						id="file_prefix"
						bind:value={mangaData.file_prefix}
						class="w-full bg-gray-700 text-white rounded p-2 text-left"
						required
					/>
					<p class="text-xs text-gray-400 mt-1">الجزء الثابت من اسم ملف الصفحة. مثال: "dbs".</p>
				</div>
			</div>

			{#if form?.error}
				<p class="text-red-500 text-center">{form.error}</p>
			{/if}
			{#if form?.success}
				<p class="text-green-500 text-center">{form.success}</p>
			{/if}

			<button type="submit" class="w-full bg-green-600 text-white font-bold py-3 px-4 rounded hover:bg-green-700">
				حفظ المانجا
			</button>
		</form>
	</div>
</div>