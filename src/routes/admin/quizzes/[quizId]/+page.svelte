<script lang="ts">
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';
	import type { PageData, ActionData } from './$types';
	import { onMount } from 'svelte';
    import { page } from '$app/stores';

	export let data: PageData;
	export let form: ActionData;

    let showCreatedMessage = false;
    onMount(() => {
        if ($page.url.searchParams.get('created') === 'true') {
            showCreatedMessage = true;
            setTimeout(() => showCreatedMessage = false, 3000);
            // إزالة الباراميتر من الرابط لتجنب ظهوره مجدداً عند التحديث
            const url = new URL(window.location.href);
            url.searchParams.delete('created');
            window.history.replaceState({}, '', url);
        }
    });

	// متغير لتتبع الأسئلة في الواجهة
	let questions = data.questions || [];
	$: questions = data.questions;

	// متغير لإظهار وإخفاء فورم إضافة سؤال جديد
	let showAddQuestionForm = false;
</script>

<svelte:head><title>تعديل: {data.quiz.title}</title></svelte:head>

<div class="p-8 font-[Tajawal] text-white max-w-6xl mx-auto">
    {#if showCreatedMessage}
        <div class="bg-green-600 text-white text-center p-3 rounded-lg mb-6" transition:slide>
            تم إنشاء الاختبار بنجاح! يمكنك الآن إضافة الأسئلة.
        </div>
    {/if}

	<a href="/admin/quizzes" class="text-orange-400 hover:underline mb-6 block text-right">&larr; العودة إلى كل الاختبارات</a>
	<h1 class="text-4xl font-bold mb-2 text-right">تعديل الاختبار</h1>
	<p class="text-gray-400 mb-8 text-right">"{data.quiz.title}"</p>
	
	<div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-12">
		<h2 class="text-2xl font-bold mb-4 text-right">تفاصيل الاختبار</h2>
		{#if form?.type === 'details' && form?.message}
			<p class="mb-4 text-center text-sm p-2 rounded {form.success ? 'bg-green-500' : 'bg-red-500'}">{form.message}</p>
		{/if}
		<form method="POST" action="?/updateQuizDetails" use:enhance class="space-y-4 text-right">
			<button type="submit" class="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700">حفظ التغييرات</button>
		</form>
	</div>

	<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
		<div class="flex justify-between items-center mb-6">
			<button on:click={() => showAddQuestionForm = !showAddQuestionForm} class="bg-green-600 py-2 px-4 rounded hover:bg-green-700">
				{showAddQuestionForm ? 'إلغاء' : '+ إضافة سؤال جديد'}
			</button>
			<h2 class="text-2xl font-bold">الأسئلة ({questions.length})</h2>
		</div>

		{#if form?.type === 'question' && form?.message}
			<p class="mb-4 text-center text-sm p-2 rounded {form.success ? 'bg-green-500' : 'bg-red-500'}">{form.message}</p>
		{/if}
		
		{#if showAddQuestionForm}
			<div transition:slide class="bg-gray-700/50 p-4 rounded-lg mb-6">
				<h3 class="text-xl font-bold mb-4 text-right">سؤال جديد</h3>
				<form method="POST" action="?/addQuestion" use:enhance={() => {
                    showAddQuestionForm = false;
                    return async ({ update }) => {
                        await update();
                    };
                }} class="space-y-4 text-right">
					<div>
                        <label for="text" class="block mb-2">نص السؤال</label>
                        <input type="text" name="text" required class="w-full bg-gray-600 p-2 rounded">
                    </div>
                    <div>
                        <label for="correct_option" class="block mb-2">الإجابة الصحيحة</label>
                        <select name="correct_option" required class="w-full bg-gray-600 p-2 rounded">
                            <option value="1">الخيار 1</option>
                            <option value="2">الخيار 2</option>
                            <option value="3">الخيار 3</option>
                            <option value="4">الخيار 4</option>
                        </select>
                    </div>
					<button type="submit" class="bg-blue-600 font-bold py-2 px-6 rounded">حفظ السؤال</button>
				</form>
			</div>
		{/if}

		<div class="space-y-4">
    {#each questions as question (question.id)}
        <details class="bg-gray-700/50 p-4 rounded-lg">
            <summary class="cursor-pointer font-semibold text-right flex justify-between">
                <span>{question.text}</span>
                <span class="text-sm text-gray-400">الترتيب: {question.order}</span>
            </summary>
            <div class="mt-4 border-t border-gray-600 pt-4">
                <form method="POST" action="?/updateQuestion" use:enhance class="space-y-4 text-right">
                    <input type="hidden" name="questionId" value={question.id} />
                    
                    <div>
                        <label for="text-{question.id}" class="block mb-1 text-sm text-gray-300">نص السؤال</label>
                        <input type="text" id="text-{question.id}" name="text" value={question.text} class="w-full bg-gray-600 p-2 rounded text-right" />
                    </div>
                    <div class="flex justify-end items-center mt-4">
                        <button type="submit" class="bg-blue-600 text-sm py-1 px-3 rounded hover:bg-blue-700">حفظ التعديلات</button>
                    </div>
                </form>
                <div class="mt-2 text-left">
                    <form method="POST" action="?/deleteQuestion" use:enhance>
                        <input type="hidden" name="questionId" value={question.id} />
                        <button type="submit" class="text-red-400 hover:underline text-sm">حذف السؤال</button>
                    </form>
                </div>

            </div>
        </details>
    {:else}
        <p class="text-center text-gray-400 py-8">لم تتم إضافة أي أسئلة بعد.</p>
    {/each}
</div>
	</div>
</div>