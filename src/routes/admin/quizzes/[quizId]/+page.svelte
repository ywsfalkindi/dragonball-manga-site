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

<div class="mx-auto max-w-7xl p-8 font-[Tajawal] text-white">
	{#if showCreatedMessage}
		<div class="mb-6 rounded-lg bg-green-600 p-3 text-center text-white" transition:slide>
			تم إنشاء الاختبار بنجاح! يمكنك الآن إضافة الأسئلة.
		</div>
	{/if}

	<a href="/admin/quizzes" class="mb-6 block text-right text-orange-400 hover:underline"
		>&larr; العودة إلى كل الاختبارات</a
	>
	<h1 class="mb-2 text-right text-4xl font-bold">تعديل الاختبار</h1>
	<p class="mb-8 text-right text-gray-400">"{quiz.title}"</p>

	<div class="mb-12 rounded-lg bg-gray-800 p-6 shadow-lg">
		<h2 class="mb-4 text-right text-2xl font-bold">تفاصيل الاختبار</h2>
		{#if detailsMessage}
			<p class="mb-4 rounded bg-green-500 p-2 text-center text-sm" transition:slide>
				{detailsMessage}
			</p>
		{/if}
		<form method="POST" action="?/updateQuizDetails" use:enhance class="space-y-4 text-right">
			<div>
				<label for="quiz-title" class="mb-2 block">عنوان الاختبار</label>
				<input
					type="text"
					id="quiz-title"
					name="title"
					bind:value={quiz.title}
					required
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-right"
				/>
			</div>
			<div>
				<label for="quiz-slug" class="mb-2 block">الرابط (Slug)</label>
				<input
					type="text"
					id="quiz-slug"
					name="slug"
					bind:value={quiz.slug}
					required
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-left"
					dir="ltr"
				/>
			</div>
			<div>
				<label for="quiz-description" class="mb-2 block">الوصف</label>
				<textarea
					id="quiz-description"
					name="description"
					bind:value={quiz.description}
					rows="3"
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-right"
				></textarea>
			</div>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<label for="category" class="mb-2 block">التصنيف</label>
					<select
						id="category"
						name="category"
						bind:value={quiz.category}
						class="w-full rounded border border-gray-600 bg-gray-700 p-2"
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
					<label for="difficulty" class="mb-2 block">مستوى الصعوبة</label>
					<select
						id="difficulty"
						name="difficulty"
						bind:value={quiz.difficulty}
						class="w-full rounded border border-gray-600 bg-gray-700 p-2"
					>
						<option value="سهل">سهل</option>
						<option value="متوسط">متوسط</option>
						<option value="صعب">صعب</option>
						<option value="خبير">خبير</option>
					</select>
				</div>
				<div>
					<label for="quiz_mode" class="mb-2 block">وضع الاختبار</label>
					<select
						id="quiz_mode"
						name="quiz_mode"
						bind:value={quiz.quiz_mode}
						class="w-full rounded border border-gray-600 bg-gray-700 p-2"
					>
						<option value="normal">عادي</option>
						<option value="daily_challenge">تحدي اليوم</option>
					</select>
				</div>
			</div>
			<div>
				<label for="time_limit" class="mb-2 block">مدة الاختبار (بالثواني)</label>
				<input
					type="number"
					id="time_limit"
					name="time_limit"
					bind:value={quiz.time_limit}
					class="w-full rounded border border-gray-600 bg-gray-700 p-2"
					placeholder="مثال: 120 (لـ دقيقتين). اتركه فارغاً لاختبار بلا وقت."
				/>
			</div>
			<div>
				<label class="flex cursor-pointer items-center justify-end gap-2">
					<input
						type="checkbox"
						name="published"
						value="true"
						bind:checked={quiz.published}
						class="form-checkbox h-5 w-5 rounded border-gray-600 bg-gray-700 text-orange-600 focus:ring-orange-500"
					/>
					<span>منشور؟</span>
				</label>
			</div>
			<div class="flex justify-start">
				<button
					type="submit"
					class="rounded bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-700"
					>حفظ التغييرات</button
				>
			</div>
		</form>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2" dir="rtl">
		<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
			<h2 class="mb-4 text-2xl font-bold">أسئلة الاختبار الحالية ({quizQuestions.length})</h2>
			<div class="max-h-[600px] space-y-3 overflow-y-auto pr-2">
				{#each quizQuestions as question (question.id)}
					<div class="flex items-center justify-between rounded-lg bg-gray-700/50 p-3">
						<p class="text-gray-200">{question.text}</p>
						<form method="POST" action="?/unlinkQuestion" use:enhance={handleUpdate}>
							<input type="hidden" name="questionId" value={question.id} />
							<button
								type="submit"
								class="text-sm text-red-400 hover:text-red-300"
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

		<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-2xl font-bold">بنك الأسئلة</h2>
				<button
					on:click={() => (showAddQuestionForm = !showAddQuestionForm)}
					class="rounded bg-green-600 px-4 py-2 text-sm hover:bg-green-700"
				>
					{showAddQuestionForm ? 'إلغاء' : '+ سؤال جديد للبنك'}
				</button>
			</div>

			{#if showAddQuestionForm}
				<div transition:slide class="mb-6 rounded-lg bg-gray-700/50 p-4">
					<h3 class="mb-4 text-right text-xl font-bold">سؤال جديد للبنك</h3>
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
							<label for="new_type" class="mb-2 block">نوع السؤال</label>
							<select
								id="new_type"
								name="type"
								bind:value={newQuestionType}
								class="w-full rounded bg-gray-600 p-2"
							>
								<option value="multiple_choice">اختيار من متعدد</option>
								<option value="true_false">صح أو خطأ</option>
							</select>
						</div>

						<div>
							<label for="new_text" class="mb-2 block">نص السؤال</label>
							<input
								id="new_text"
								type="text"
								name="text"
								required
								class="w-full rounded bg-gray-600 p-2"
								dir="rtl"
							/>
						</div>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<label for="new_category" class="mb-2 block">التصنيف</label>
								<select id="new_category" name="category" class="w-full rounded bg-gray-600 p-2">
									<option value="عام">عام</option>
									<option value="شخصيات">شخصيات</option>
									<option value="أحداث">أحداث</option>
									<option value="تقنيات">تقنيات</option>
								</select>
							</div>
							<div>
								<label for="new_difficulty" class="mb-2 block">مستوى الصعوبة</label>
								<select
									id="new_difficulty"
									name="difficulty"
									class="w-full rounded bg-gray-600 p-2"
								>
									<option value="سهل">سهل</option>
									<option value="متوسط">متوسط</option>
									<option value="صعب">صعب</option>
									<option value="خبير">خبير</option>
								</select>
							</div>
						</div>

						{#if newQuestionType === 'multiple_choice'}
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<label for="new_option_1" class="mb-1 block">الخيار 1</label>
									<input
										id="new_option_1"
										type="text"
										name="option_1"
										required
										class="w-full rounded bg-gray-600 p-2"
									/>
								</div>
								<div>
									<label for="new_option_2" class="mb-1 block">الخيار 2</label>
									<input
										id="new_option_2"
										type="text"
										name="option_2"
										required
										class="w-full rounded bg-gray-600 p-2"
									/>
								</div>
								<div>
									<label for="new_option_3" class="mb-1 block">الخيار 3</label>
									<input
										id="new_option_3"
										type="text"
										name="option_3"
										required
										class="w-full rounded bg-gray-600 p-2"
									/>
								</div>
								<div>
									<label for="new_option_4" class="mb-1 block">الخيار 4</label>
									<input
										id="new_option_4"
										type="text"
										name="option_4"
										required
										class="w-full rounded bg-gray-600 p-2"
									/>
								</div>
							</div>
							<div>
								<label for="new_correct_option_mc" class="mb-2 block">الإجابة الصحيحة</label>
								<select
									id="new_correct_option_mc"
									name="correct_option"
									required
									class="w-full rounded bg-gray-600 p-2"
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
								<label for="new_correct_option_tf" class="mb-2 block">الإجابة الصحيحة</label>
								<select
									id="new_correct_option_tf"
									name="correct_option"
									required
									class="w-full rounded bg-gray-600 p-2"
								>
									<option value="1">صح</option>
									<option value="2">خطأ</option>
								</select>
							</div>
						{/if}

						<div>
							<label for="new_explanation" class="mb-2 block">شرح الإجابة (اختياري)</label>
							<textarea
								id="new_explanation"
								name="explanation"
								rows="2"
								class="w-full rounded bg-gray-600 p-2"
							></textarea>
						</div>

						<button type="submit" class="rounded bg-blue-600 px-6 py-2 font-bold"
							>حفظ السؤال في البنك</button
						>
					</form>
				</div>
			{/if}

			<form method="POST" action="?/linkQuestions" use:enhance={handleUpdate}>
				<div class="mb-4 flex items-center justify-between">
					<button
						type="submit"
						class="rounded bg-cyan-600 px-4 py-2 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-gray-600"
						disabled={selectedBankQuestions.size === 0}
					>
						إضافة المحدد للاختبار ({selectedBankQuestions.size})
					</button>
					<div class="flex gap-2">
						<input
							type="search"
							bind:value={bankSearchTerm}
							placeholder="ابحث في البنك..."
							class="rounded bg-gray-700 p-2 text-sm"
						/>
					</div>
				</div>

				<div class="max-h-[500px] space-y-3 overflow-y-auto pr-2">
					{#each filteredQuestionBank as question (question.id)}
						<div
							class="flex items-center gap-4 rounded-lg bg-gray-700/50 p-3 transition-colors"
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
								class="form-checkbox h-5 w-5 shrink-0 rounded border-gray-500 bg-gray-600 text-cyan-500 focus:ring-cyan-400"
							/>
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="flex-grow cursor-pointer text-gray-200">{question.text}</label>
							<div class="flex flex-shrink-0 gap-x-4">
								<a
									href="/admin/quizzes/edit-question/{question.id}"
									class="text-xs text-blue-400 hover:underline">تعديل</a
								>
								<!-- svelte-ignore node_invalid_placement_ssr -->
								<form
									method="POST"
									action="?/deleteQuestion"
									use:enhance={handleUpdate}
									on:submit|preventDefault={(e) => {
										if (!confirm('هل أنت متأكد من حذف هذا السؤال نهائياً من بنك الأسئلة؟')) {
											e.preventDefault();
										}
									}}
								>
									<input type="hidden" name="questionId" value={question.id} />
									<button type="submit" class="text-xs text-red-400 hover:underline">حذف</button>
								</form>
							</div>
						</div>
					{:else}
						<p class="text-center text-gray-400 py-8">لا توجد أسئلة أخرى في البنك أو تطابق بحثك.</p>
					{/each}
				</div>
			</form>
		</div>
	</div>
</div>
