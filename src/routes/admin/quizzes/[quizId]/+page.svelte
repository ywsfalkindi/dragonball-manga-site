<script lang="ts">
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';
	import type { PageData, ActionData, SubmitFunction } from './$types';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { pb } from '$lib/pocketbase';

	export let data: PageData;
	export let form: ActionData;

	// ✨ تحديث: استخدام المتغيرات الجديدة من دالة load
	$: ({ quiz, quizQuestions, questionBank } = data);

	let showCreatedMessage = false;
	onMount(() => {
		if ($page.url.searchParams.get('created') === 'true') {
			showCreatedMessage = true;
			setTimeout(() => (showCreatedMessage = false), 3000);
			const url = new URL(window.location.href);
			url.searchParams.delete('created');
			window.history.replaceState({}, '', url);
		}
	});

	let showAddQuestionForm = false;
	let detailsMessage = '';
	let questionMessage = '';

	$: if (form?.success) {
		if (form.type === 'details') {
			detailsMessage = form.message || 'تم التحديث بنجاح!';
			setTimeout(() => (detailsMessage = ''), 3000);
		}
		if (form.type === 'question') {
			questionMessage = form.message || 'تم التحديث بنجاح!';
			setTimeout(() => (questionMessage = ''), 3000);
		}
	}

	// ✨ تحسين: متغيرات لإدارة بنك الأسئلة
	let newQuestionType: 'multiple_choice' | 'true_false' = 'multiple_choice';
	let selectedBankQuestions = new Set<string>();
	let bankSearchTerm = '';

	// ✨ تحسين: فلترة بنك الأسئلة بناءً على بحث المستخدم وإخفاء الأسئلة المضافة بالفعل
	$: filteredQuestionBank = questionBank.filter((q: any) => {
		const inQuiz = quizQuestions.some((quizQ: any) => quizQ.id === q.id);
		if (inQuiz) return false;
		return !bankSearchTerm || q.text.toLowerCase().includes(bankSearchTerm.toLowerCase());
	});

	// دالة للتعامل مع التحديثات البصرية بعد إجراءات النماذج
	const handleUpdate: SubmitFunction = () => {
		return async ({ update }) => {
			await update({ reset: false });
			selectedBankQuestions.clear();
		};
	};
</script>

<svelte:head><title>تعديل: {quiz.title}</title></svelte:head>

<div class="p-8 font-[Tajawal] text-white max-w-7xl mx-auto">
	{#if showCreatedMessage}
		<div class="bg-green-600 text-white text-center p-3 rounded-lg mb-6" transition:slide>
			تم إنشاء الاختبار بنجاح! يمكنك الآن إضافة الأسئلة.
		</div>
	{/if}

	<a href="/admin/quizzes" class="text-orange-400 hover:underline mb-6 block text-right"
		>&larr; العودة إلى كل الاختبارات</a
	>
	<h1 class="text-4xl font-bold mb-2 text-right">تعديل الاختبار</h1>
	<p class="text-gray-400 mb-8 text-right">"{quiz.title}"</p>

	<div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-12">
		<h2 class="text-2xl font-bold mb-4 text-right">تفاصيل الاختبار</h2>
		{#if detailsMessage}
			<p class="mb-4 text-center text-sm p-2 rounded bg-green-500" transition:slide>
				{detailsMessage}
			</p>
		{/if}
		<form method="POST" action="?/updateQuizDetails" use:enhance class="space-y-4 text-right">
			<div>
				<label for="quiz-title" class="block mb-2">عنوان الاختبار</label>
				<input
					type="text"
					id="quiz-title"
					name="title"
					bind:value={quiz.title}
					required
					class="w-full bg-gray-700 p-2 rounded border border-gray-600 text-right"
				/>
			</div>
			<div>
				<label for="quiz-slug" class="block mb-2">الرابط (Slug)</label>
				<input
					type="text"
					id="quiz-slug"
					name="slug"
					bind:value={quiz.slug}
					required
					class="w-full bg-gray-700 p-2 rounded border border-gray-600 text-left"
					dir="ltr"
				/>
			</div>
			<div>
				<label for="quiz-description" class="block mb-2">الوصف</label>
				<textarea
					id="quiz-description"
					name="description"
					bind:value={quiz.description}
					rows="3"
					class="w-full bg-gray-700 p-2 rounded border border-gray-600 text-right"
				></textarea>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<label for="category" class="block mb-2">التصنيف</label>
					<select
						id="category"
						name="category"
						bind:value={quiz.category}
						class="w-full bg-gray-700 p-2 rounded border border-gray-600"
					>
						<option value="عام">عام</option>
						<option value="شخصيات">شخصيات</option>
						<option value="أحداث">أحداث</option>
						<option value="تقنيات">تقنيات</option>
						<option value="دراغون بول">دراغون بول</option>
						<option value="دراغون بول Z">دراغون بول Z</option>
						<option value="دراغون بول Super">دراغون بول Super</option>
					</select>
				</div>
				<div>
					<label for="difficulty" class="block mb-2">مستوى الصعوبة</label>
					<select
						id="difficulty"
						name="difficulty"
						bind:value={quiz.difficulty}
						class="w-full bg-gray-700 p-2 rounded border border-gray-600"
					>
						<option value="سهل">سهل</option>
						<option value="متوسط">متوسط</option>
						<option value="صعب">صعب</option>
						<option value="خبير">خبير</option>
					</select>
				</div>
				<div>
					<label for="quiz_mode" class="block mb-2">وضع الاختبار</label>
					<select
						id="quiz_mode"
						name="quiz_mode"
						bind:value={quiz.quiz_mode}
						class="w-full bg-gray-700 p-2 rounded border border-gray-600"
					>
						<option value="normal">عادي</option>
						<option value="daily_challenge">تحدي اليوم</option>
					</select>
				</div>
			</div>
			<div>
				<label for="time_limit" class="block mb-2">مدة الاختبار (بالثواني)</label>
				<input
					type="number"
					id="time_limit"
					name="time_limit"
					bind:value={quiz.time_limit}
					class="w-full bg-gray-700 p-2 rounded border border-gray-600"
					placeholder="مثال: 120 (لـ دقيقتين). اتركه فارغاً لاختبار بلا وقت."
				/>
			</div>
			<div>
				<label class="flex items-center justify-end gap-2 cursor-pointer">
					<input
						type="checkbox"
						name="published"
						value="true"
						bind:checked={quiz.published}
						class="form-checkbox h-5 w-5 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
					/>
					<span>منشور؟</span>
				</label>
			</div>
			<div class="flex justify-start">
				<button type="submit" class="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700"
					>حفظ التغييرات</button
				>
			</div>
		</form>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8" dir="rtl">
		<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
			<h2 class="text-2xl font-bold mb-4">أسئلة الاختبار الحالية ({quizQuestions.length})</h2>
			<div class="space-y-3 max-h-[600px] overflow-y-auto pr-2">
				{#each quizQuestions as question (question.id)}
					<div class="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
						<p class="text-gray-200">{question.text}</p>
						<form method="POST" action="?/unlinkQuestion" use:enhance={handleUpdate}>
							<input type="hidden" name="questionId" value={question.id} />
							<button
								type="submit"
								class="text-red-400 hover:text-red-300 text-sm"
								title="إزالة من الاختبار (لن يتم حذف السؤال من البنك)">إزالة</button
							>
						</form>
					</div>
				{:else}
					<p class="text-center text-gray-400 py-8">
						هذا الاختبار لا يحتوي على أسئلة بعد. أضف أسئلة من البنك.
					</p>
				{/each}
			</div>
		</div>

		<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-2xl font-bold">بنك الأسئلة</h2>
				<button
					on:click={() => (showAddQuestionForm = !showAddQuestionForm)}
					class="bg-green-600 py-2 px-4 rounded hover:bg-green-700 text-sm"
				>
					{showAddQuestionForm ? 'إلغاء' : '+ سؤال جديد للبنك'}
				</button>
			</div>
			
			{#if showAddQuestionForm}
				<div transition:slide class="bg-gray-700/50 p-4 rounded-lg mb-6">
					<h3 class="text-xl font-bold mb-4 text-right">سؤال جديد للبنك</h3>
					<form
						method="POST"
						action="?/addQuestion"
						enctype="multipart/form-data"
						use:enhance={() => {
							showAddQuestionForm = false;
							return async ({ update }) => {
								await update({ reset: false });
							};
						}}
						class="space-y-4 text-right"
					>
						<div>
							<label for="new_type" class="block mb-2">نوع السؤال</label>
							<select
								id="new_type"
								name="type"
								bind:value={newQuestionType}
								class="w-full bg-gray-600 p-2 rounded"
							>
								<option value="multiple_choice">اختيار من متعدد</option>
								<option value="true_false">صح أو خطأ</option>
							</select>
						</div>

						<div>
							<label for="new_text" class="block mb-2">نص السؤال</label>
							<input
								id="new_text"
								type="text"
								name="text"
								required
								class="w-full bg-gray-600 p-2 rounded"
								dir="rtl"
							/>
						</div>
						
						{#if newQuestionType === 'multiple_choice'}
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label for="new_option_1" class="block mb-1">الخيار 1</label>
									<input id="new_option_1" type="text" name="option_1" required class="w-full bg-gray-600 p-2 rounded" />
								</div>
								<div>
									<label for="new_option_2" class="block mb-1">الخيار 2</label>
									<input id="new_option_2" type="text" name="option_2" required class="w-full bg-gray-600 p-2 rounded" />
								</div>
								<div>
									<label for="new_option_3" class="block mb-1">الخيار 3</label>
									<input id="new_option_3" type="text" name="option_3" required class="w-full bg-gray-600 p-2 rounded" />
								</div>
								<div>
									<label for="new_option_4" class="block mb-1">الخيار 4</label>
									<input id="new_option_4" type="text" name="option_4" required class="w-full bg-gray-600 p-2 rounded" />
								</div>
							</div>
							<div>
								<label for="new_correct_option_mc" class="block mb-2">الإجابة الصحيحة</label>
								<select
									id="new_correct_option_mc"
									name="correct_option"
									required
									class="w-full bg-gray-600 p-2 rounded"
								>
									<option value="1">الخيار 1</option>
									<option value="2">الخيار 2</option>
									<option value="3">الخيار 3</option>
									<option value="4">الخيار 4</option>
								</select>
							</div>
						{:else if newQuestionType === 'true_false'}
							<div>
								<input type="hidden" name="option_1" value="صح" />
								<input type="hidden" name="option_2" value="خطأ" />
								<label for="new_correct_option_tf" class="block mb-2">الإجابة الصحيحة</label>
								<select
									id="new_correct_option_tf"
									name="correct_option"
									required
									class="w-full bg-gray-600 p-2 rounded"
								>
									<option value="1">صح</option>
									<option value="2">خطأ</option>
								</select>
							</div>
						{/if}

						<button type="submit" class="bg-blue-600 font-bold py-2 px-6 rounded">حفظ السؤال في البنك</button>
					</form>
				</div>
			{/if}

			<form method="POST" action="?/linkQuestions" use:enhance={handleUpdate}>
				<div class="flex justify-between items-center mb-4">
					<button
						type="submit"
						class="bg-cyan-600 py-2 px-4 rounded hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
						disabled={selectedBankQuestions.size === 0}
					>
						إضافة المحدد للاختبار ({selectedBankQuestions.size})
					</button>
					<div class="flex gap-2">
						<input type="search" bind:value={bankSearchTerm} placeholder="ابحث في البنك..." class="bg-gray-700 text-sm p-2 rounded">
					</div>
				</div>

				<div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
					{#each filteredQuestionBank as question (question.id)}
						<div
							class="bg-gray-700/50 p-3 rounded-lg flex items-center gap-4 transition-colors"
							class:bg-cyan-900={selectedBankQuestions.has(question.id)}
						>
							<input
								type="checkbox"
								name="questionIds"
								value={question.id}
								on:change={() => {
									if (selectedBankQuestions.has(question.id)) {
										selectedBankQuestions.delete(question.id);
									} else {
										selectedBankQuestions.add(question.id);
									}
									selectedBankQuestions = selectedBankQuestions;
								}}
								class="form-checkbox h-5 w-5 text-cyan-500 bg-gray-600 border-gray-500 rounded focus:ring-cyan-400 shrink-0"
							/>
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="flex-grow text-gray-200 cursor-pointer">{question.text}</label>
						</div>
					{:else}
						<p class="text-center text-gray-400 py-8">
							لا توجد أسئلة أخرى في البنك أو تطابق بحثك.
						</p>
					{/each}
				</div>
			</form>
		</div>
	</div>
</div>