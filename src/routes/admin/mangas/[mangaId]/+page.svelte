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

<div class="min-h-screen bg-gray-900 p-8 font-[Tajawal] text-white">
	<a href="/admin/mangas" class="mb-8 block text-right text-blue-400 hover:underline"
		>&larr; العودة لإدارة المانجا</a
	>
	<h1 class="mb-8 text-right text-4xl font-bold">
		{data.manga ? 'تعديل مانجا' : 'إضافة مانجا جديدة'}
	</h1>

	<div class="flex flex-col-reverse justify-end gap-8 lg:flex-row-reverse">
		{#if data.manga}
			<div class="w-full lg:w-1/3">
				<h2 class="mb-4 text-right text-2xl font-bold">إدارة الفصول</h2>
				<div class="max-h-screen overflow-y-auto rounded-lg bg-gray-800 p-4 shadow-lg">
					<ul class="space-y-2">
						{#each data.chapters as chapter (chapter.id)}
							<li class="flex items-center justify-between rounded bg-gray-700 p-3">
								<span class="font-semibold">الفصل #{chapter.chapter_number}</span>
								<div class="flex gap-2">
									<a
										href="/admin/mangas/{data.manga.id}/chapters/{chapter.id}"
										class="text-sm text-blue-400 hover:underline"
									>
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
			class="w-full max-w-2xl space-y-6 rounded-lg bg-gray-800 p-8 text-right shadow-lg"
		>
			<div>
				<label for="title" class="mb-2 block text-gray-300">عنوان المانجا</label>
				<input
					type="text"
					name="title"
					id="title"
					bind:value={mangaData.title}
					class="w-full rounded bg-gray-700 p-2 text-white"
					required
				/>
			</div>
			<div>
				<label for="slug" class="mb-2 block text-gray-300">Slug (الرابط)</label>
				<input
					dir="ltr"
					type="text"
					name="slug"
					id="slug"
					bind:value={mangaData.slug}
					class="w-full rounded bg-gray-700 p-2 text-left text-white"
					required
				/>
				<p class="mt-1 text-xs text-gray-400">
					يستخدم في الرابط، مثال: "dragon-ball-super". يجب أن يكون فريداً.
				</p>
			</div>
			<div>
				<label for="description" class="mb-2 block text-gray-300">الوصف</label>
				<textarea
					name="description"
					id="description"
					rows="4"
					bind:value={mangaData.description}
					class="w-full rounded bg-gray-700 p-2 text-white"
				></textarea>
			</div>
			<div>
				<label for="status" class="mb-2 block text-gray-300">الحالة</label>
				<select
					name="status"
					id="status"
					bind:value={mangaData.status}
					class="w-full rounded bg-gray-700 p-2 text-right text-white"
				>
					<option value="ongoing">مستمرة</option>
					<option value="completed">مكتملة</option>
				</select>
			</div>
			<div class="border-t border-gray-700 pt-4">
				<h3 class="mb-2 text-lg font-bold text-orange-400">إعدادات الملفات (لأداة إضافة الفصول)</h3>
				<div>
					<label for="folder_name" class="mb-2 block text-gray-300">اسم المجلد</label>
					<input
						dir="ltr"
						type="text"
						name="folder_name"
						id="folder_name"
						bind:value={mangaData.folder_name}
						class="w-full rounded bg-gray-700 p-2 text-left text-white"
						required
					/>
					<p class="mt-1 text-xs text-gray-400">اسم المجلد الذي يحتوي فصول المانجا. مثال: "dbs".</p>
				</div>
				<div class="mt-4">
					<label for="file_prefix" class="mb-2 block text-gray-300">بادئة اسم الملف</label>
					<input
						dir="ltr"
						type="text"
						name="file_prefix"
						id="file_prefix"
						bind:value={mangaData.file_prefix}
						class="w-full rounded bg-gray-700 p-2 text-left text-white"
						required
					/>
					<p class="mt-1 text-xs text-gray-400">الجزء الثابت من اسم ملف الصفحة. مثال: "dbs".</p>
				</div>
			</div>

			{#if form?.error}
				<p class="text-center text-red-500">{form.error}</p>
			{/if}
			{#if form?.success}
				<p class="text-center text-green-500">{form.success}</p>
			{/if}

			<button
				type="submit"
				class="w-full rounded bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700"
			>
				حفظ المانجا
			</button>
		</form>
	</div>
</div>
