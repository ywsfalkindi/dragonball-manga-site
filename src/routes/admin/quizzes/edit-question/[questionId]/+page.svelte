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

<div class="p-8 font-[Tajawal] text-white max-w-4xl mx-auto">
	<a href={'/admin/quizzes/' + question.quiz} class="text-orange-400 hover:underline mb-6 block text-right"
		>&larr; العودة إلى الاختبار</a
	>
	<h1 class="text-4xl font-bold mb-8 text-right">تعديل سؤال</h1>

	<form
		method="POST"
        action="?/updateQuestion"
		use:enhance
		class="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6"
	>
        <div>
            <label for="type" class="block mb-2 text-right">نوع السؤال</label>
            <select id="type" name="type" bind:value={questionType} class="w-full bg-gray-700 p-2 rounded">
                <option value="multiple_choice">اختيار من متعدد</option>
                <option value="true_false">صح أو خطأ</option>
            </select>
        </div>

		<div>
			<label for="text" class="block mb-2 text-right">نص السؤال</label>
			<input
				bind:value={question.text}
				type="text"
				id="text"
				name="text"
				required
				class="w-full bg-gray-700 p-2 rounded border border-gray-600 text-right"
			/>
		</div>

        {#if questionType === 'multiple_choice'}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="option_1" class="block mb-1 text-right">الخيار 1</label>
                    <input id="option_1" type="text" name="option_1" required class="w-full bg-gray-700 p-2 rounded" bind:value={question.option_1} />
                </div>
                <div>
                    <label for="option_2" class="block mb-1 text-right">الخيار 2</label>
                    <input id="option_2" type="text" name="option_2" required class="w-full bg-gray-700 p-2 rounded" bind:value={question.option_2} />
                </div>
                <div>
                    <label for="option_3" class="block mb-1 text-right">الخيار 3</label>
                    <input id="option_3" type="text" name="option_3" required class="w-full bg-gray-700 p-2 rounded" bind:value={question.option_3} />
                </div>
                <div>
                    <label for="option_4" class="block mb-1 text-right">الخيار 4</label>
                    <input id="option_4" type="text" name="option_4" required class="w-full bg-gray-700 p-2 rounded" bind:value={question.option_4} />
                </div>
            </div>
            <div>
                <label for="correct_option_mc" class="block mb-2 text-right">الإجابة الصحيحة</label>
                <select id="correct_option_mc" name="correct_option" required class="w-full bg-gray-700 p-2 rounded" bind:value={question.correct_option}>
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
                <label for="correct_option_tf" class="block mb-2 text-right">الإجابة الصحيحة</label>
                <select id="correct_option_tf" name="correct_option" required class="w-full bg-gray-700 p-2 rounded" bind:value={question.correct_option}>
                    <option value={1}>صح</option>
                    <option value={2}>خطأ</option>
                </select>
            </div>
        {/if}
		
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label for="category" class="block mb-2 text-right">التصنيف</label>
                <select id="category" name="category" class="w-full bg-gray-700 p-2 rounded" bind:value={question.category}>
                    <option value="عام">عام</option>
                    <option value="شخصيات">شخصيات</option>
                    <option value="أحداث">أحداث</option>
                    <option value="تقنيات">تقنيات</option>
                </select>
            </div>
            <div>
                <label for="difficulty" class="block mb-2 text-right">مستوى الصعوبة</label>
                <select id="difficulty" name="difficulty" class="w-full bg-gray-700 p-2 rounded" bind:value={question.difficulty}>
                    <option value="سهل">سهل</option>
                    <option value="متوسط">متوسط</option>
                    <option value="صعب">صعب</option>
                    <option value="خبير">خبير</option>
                </select>
            </div>
        </div>

        <div>
            <label for="explanation" class="block mb-2 text-right">شرح الإجابة (اختياري)</label>
            <textarea id="explanation" name="explanation" rows="2" class="w-full bg-gray-700 p-2 rounded" bind:value={question.explanation}></textarea>
        </div>

		{#if form?.error}
			<p class="text-red-500 text-center">{form.error}</p>
		{/if}
        {#if form?.success}
            <p class="text-green-500 text-center">{form.success}</p>
        {/if}

		<div class="flex justify-start">
			<button
				type="submit"
				class="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition-colors"
			>
				حفظ التعديلات
			</button>
		</div>
	</form>
</div>