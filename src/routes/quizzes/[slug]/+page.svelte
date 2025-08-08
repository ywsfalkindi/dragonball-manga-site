<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { quizStore } from '$lib/stores/quiz';
	import type { PageData, ActionData } from './$types';
	import type { Question } from '$lib/stores/quiz';
	
	export let data: PageData;
	export let form: ActionData;

	onMount(() => {
		// --- التعديل النهائي هنا ---
		// نخبر TypeScript: "أنا متأكد تمامًا، حوّل هذا النوع إلى 'غير معروف' أولاً ثم إلى النوع الذي أريده"
		quizStore.startQuiz(data.questions as unknown as Question[]);
		return () => quizStore.reset();
	});

	$: currentQuestion = $quizStore.questions[$quizStore.currentQuestionIndex];
	$: progress = (($quizStore.currentQuestionIndex + 1) / $quizStore.questions.length) * 100;

	function handleAnswer(optionIndex: number) {
		if ($quizStore.isCompleted) return;
		quizStore.answerQuestion(currentQuestion.id, optionIndex);
	}
</script>

<svelte:head>
	<title>تحدي: {data.quiz.title}</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4 font-[Tajawal] bg-gray-900 text-white">
	<div class="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8 transform transition-all">
		{#if $quizStore.isCompleted}
            <div class="text-center">
				<h2 class="text-3xl font-bold text-green-400 mb-4">أكملت التحدي!</h2>
				<p class="text-gray-300 mb-8">أنت على وشك معرفة نتيجتك. هل أنت مستعد؟</p>
				<form method="POST" action="?/submitQuiz" use:enhance>
                    <input type="hidden" name="answers" value={JSON.stringify($quizStore.userAnswers)} />
					<button type="submit" class="w-full bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition-transform hover:scale-105">
						عرض نتيجتي الآن!
					</button>
				</form>
                {#if form?.error}
                    <p class="text-red-500 mt-4">{form.error}</p>
                {/if}
			</div>
		{:else if currentQuestion}
            <div>
				<div class="mb-6">
					<p class="text-right text-sm text-gray-400 mb-2">السؤال {$quizStore.currentQuestionIndex + 1} / {$quizStore.questions.length}</p>
					<div class="w-full bg-gray-700 rounded-full h-2.5">
						<div class="bg-orange-500 h-2.5 rounded-full" style="width: {progress}%"></div>
					</div>
				</div>

				<h2 class="text-2xl md:text-3xl font-bold text-center mb-8" dir="rtl">{currentQuestion.text}</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each [currentQuestion.option_1, currentQuestion.option_2, currentQuestion.option_3, currentQuestion.option_4] as option, i}
						<button on:click={() => handleAnswer(i + 1)} class="p-4 bg-gray-700 rounded-lg text-lg text-right hover:bg-orange-500 hover:text-white transition-colors duration-200">
							{option}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>