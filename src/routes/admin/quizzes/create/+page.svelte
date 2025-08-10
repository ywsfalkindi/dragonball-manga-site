<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
	let title = '';
	let slug = '';
	let isSubmitting = false; // هذا المتغير موجود وصحيح

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

<div class="mx-auto max-w-4xl p-8 font-[Tajawal] text-white">
	<h1 class="mb-8 text-right text-4xl font-bold">إنشاء اختبار جديد</h1>

	<form
		method="POST"
		action="?/createQuiz"
		enctype="multipart/form-data"
		use:enhance={() => {
			isSubmitting = true; // عطّل الزر فورًا عند الإرسال
			return async ({ update }) => {
				isSubmitting = false; // أعد تفعيل الزر بعد وصول الرد
				await update();
			};
		}}
		class="space-y-6 rounded-lg bg-gray-800 p-6 shadow-lg"
	>
		<div>
			<label for="title" class="mb-2 block text-right">عنوان الاختبار</label>
			<input
				bind:value={title}
				type="text"
				id="title"
				name="title"
				required
				class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-right"
			/>
		</div>
		<div>
			<label for="slug" class="mb-2 block text-right">الرابط (Slug)</label>
			<input
				bind:value={slug}
				type="text"
				id="slug"
				name="slug"
				required
				class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-left"
				dir="ltr"
			/>
		</div>
		<div>
			<label for="description" class="mb-2 block text-right">الوصف</label>
			<textarea
				id="description"
				name="description"
				rows="4"
				class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-right"
			></textarea>
		</div>
		<div>
			<label for="cover_image" class="mb-2 block text-right">صورة الغلاف</label>
			<input
				type="file"
				id="cover_image"
				name="cover_image"
				class="w-full file:mr-4 file:rounded-full file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-orange-600"
			/>
		</div>
		<div>
			<label class="flex cursor-pointer items-center justify-end gap-2">
				<input
					type="checkbox"
					name="published"
					value="true"
					class="form-checkbox h-5 w-5 rounded border-gray-600 bg-gray-700 text-orange-600 focus:ring-orange-500"
				/>
				<span>نشر الاختبار فوراً؟</span>
			</label>
		</div>

		{#if form?.error}
			<p class="text-center text-red-500">{form.error}</p>
		{/if}

		<div class="flex justify-start">
			<button
				type="submit"
				class="rounded bg-blue-600 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-500"
				disabled={isSubmitting}
			>
				{#if isSubmitting}
					جاري الإنشاء...
				{:else}
					إنشاء والمتابعة لإضافة الأسئلة
				{/if}
			</button>
		</div>
	</form>
</div>
