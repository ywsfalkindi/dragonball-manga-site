<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	let { question } = data;
	let questionType = question.type;
</script>

<svelte:head>
	<title>تعديل سؤال</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-8 font-[Tajawal] text-white">
	<a
		href={'/admin/quizzes/' + question.quiz}
		class="mb-6 block text-right text-orange-400 hover:underline">&larr; العودة إلى الاختبار</a
	>
	<h1 class="mb-8 text-right text-4xl font-bold">تعديل سؤال</h1>

	<form
		method="POST"
		action="?/updateQuestion"
		use:enhance
		class="space-y-6 rounded-lg bg-gray-800 p-6 shadow-lg"
	>
		<div>
			<label for="type" class="mb-2 block text-right">نوع السؤال</label>
			<select
				id="type"
				name="type"
				bind:value={questionType}
				class="w-full rounded bg-gray-700 p-2"
			>
				<option value="multiple_choice">اختيار من متعدد</option>
				<option value="true_false">صح أو خطأ</option>
			</select>
		</div>

		<div>
			<label for="text" class="mb-2 block text-right">نص السؤال</label>
			<input
				bind:value={question.text}
				type="text"
				id="text"
				name="text"
				required
				class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-right"
			/>
		</div>

		{#if questionType === 'multiple_choice'}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label for="option_1" class="mb-1 block text-right">الخيار 1</label>
					<input
						id="option_1"
						type="text"
						name="option_1"
						required
						class="w-full rounded bg-gray-700 p-2"
						bind:value={question.option_1}
					/>
				</div>
				<div>
					<label for="option_2" class="mb-1 block text-right">الخيار 2</label>
					<input
						id="option_2"
						type="text"
						name="option_2"
						required
						class="w-full rounded bg-gray-700 p-2"
						bind:value={question.option_2}
					/>
				</div>
				<div>
					<label for="option_3" class="mb-1 block text-right">الخيار 3</label>
					<input
						id="option_3"
						type="text"
						name="option_3"
						required
						class="w-full rounded bg-gray-700 p-2"
						bind:value={question.option_3}
					/>
				</div>
				<div>
					<label for="option_4" class="mb-1 block text-right">الخيار 4</label>
					<input
						id="option_4"
						type="text"
						name="option_4"
						required
						class="w-full rounded bg-gray-700 p-2"
						bind:value={question.option_4}
					/>
				</div>
			</div>
			<div>
				<label for="correct_option_mc" class="mb-2 block text-right">الإجابة الصحيحة</label>
				<select
					id="correct_option_mc"
					name="correct_option"
					required
					class="w-full rounded bg-gray-700 p-2"
					bind:value={question.correct_option}
				>
					<option value={1}>الخيار 1</option>
					<option value={2}>الخيار 2</option>
					<option value={3}>الخيار 3</option>
					<option value={4}>الخيار 4</option>
				</select>
			</div>
		{:else if questionType === 'true_false'}
			<div>
				<input type="hidden" name="option_1" value="صح" />
				<input type="hidden" name="option_2" value="خطأ" />
				<label for="correct_option_tf" class="mb-2 block text-right">الإجابة الصحيحة</label>
				<select
					id="correct_option_tf"
					name="correct_option"
					required
					class="w-full rounded bg-gray-700 p-2"
					bind:value={question.correct_option}
				>
					<option value={1}>صح</option>
					<option value={2}>خطأ</option>
				</select>
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label for="category" class="mb-2 block text-right">التصنيف</label>
				<select
					id="category"
					name="category"
					class="w-full rounded bg-gray-700 p-2"
					bind:value={question.category}
				>
					<option value="عام">عام</option>
					<option value="شخصيات">شخصيات</option>
					<option value="أحداث">أحداث</option>
					<option value="تقنيات">تقنيات</option>
				</select>
			</div>
			<div>
				<label for="difficulty" class="mb-2 block text-right">مستوى الصعوبة</label>
				<select
					id="difficulty"
					name="difficulty"
					class="w-full rounded bg-gray-700 p-2"
					bind:value={question.difficulty}
				>
					<option value="سهل">سهل</option>
					<option value="متوسط">متوسط</option>
					<option value="صعب">صعب</option>
					<option value="خبير">خبير</option>
				</select>
			</div>
		</div>

		<div>
			<label for="explanation" class="mb-2 block text-right">شرح الإجابة (اختياري)</label>
			<textarea
				id="explanation"
				name="explanation"
				rows="2"
				class="w-full rounded bg-gray-700 p-2"
				bind:value={question.explanation}
			></textarea>
		</div>

		{#if form?.error}
			<p class="text-center text-red-500">{form.error}</p>
		{/if}
		{#if form?.success}
			<p class="text-center text-green-500">{form.success}</p>
		{/if}

		<div class="flex justify-start">
			<button
				type="submit"
				class="rounded bg-blue-600 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-700"
			>
				حفظ التعديلات
			</button>
		</div>
	</form>
</div>
