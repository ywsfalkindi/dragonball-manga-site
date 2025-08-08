<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let title = '';
	let slug = '';

	// دالة لتوليد الـ Slug تلقائياً من العنوان
	function generateSlug(text: string) {
		return text
			.toLowerCase()
			.replace(/ /g, '-')
			.replace(/[^\w-]+/g, '');
	}

	$: slug = generateSlug(title);
</script>

<svelte:head><title>إنشاء اختبار جديد</title></svelte:head>

<div class="p-8 font-[Tajawal] text-white max-w-4xl mx-auto">
	<h1 class="text-4xl font-bold mb-8 text-right">إنشاء اختبار جديد</h1>

	<form method="POST" action="?/createQuiz" enctype="multipart/form-data" use:enhance class="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
		<div>
			<label for="title" class="block mb-2 text-right">عنوان الاختبار</label>
			<input bind:value={title} type="text" id="title" name="title" required class="w-full bg-gray-700 p-2 rounded border border-gray-600 text-right" />
		</div>
		<div>
			<label for="slug" class="block mb-2 text-right">الرابط (Slug)</label>
			<input bind:value={slug} type="text" id="slug" name="slug" required class="w-full bg-gray-700 p-2 rounded border border-gray-600 text-left" dir="ltr" />
		</div>
		<div>
			<label for="description" class="block mb-2 text-right">الوصف</label>
			<textarea id="description" name="description" rows="4" class="w-full bg-gray-700 p-2 rounded border border-gray-600 text-right"></textarea>
		</div>
		<div>
			<label for="cover_image" class="block mb-2 text-right">صورة الغلاف</label>
			<input type="file" id="cover_image" name="cover_image" class="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"/>
		</div>
		<div>
			<label class="flex items-center justify-end gap-2 cursor-pointer">
				<input type="checkbox" name="published" value="true" class="form-checkbox h-5 w-5 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500" />
				<span>نشر الاختبار فوراً؟</span>
			</label>
		</div>
		
		{#if form?.error}
			<p class="text-red-500 text-center">{form.error}</p>
		{/if}

		<div class="flex justify-start">
			<button type="submit" class="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition-colors">
				إنشاء والمتابعة لإضافة الأسئلة
			</button>
		</div>
	</form>
</div>