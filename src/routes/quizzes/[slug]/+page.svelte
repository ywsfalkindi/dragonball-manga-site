<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount, onDestroy } from 'svelte';
	import { quizStore } from '$lib/stores/quiz';
	import type { PageData, ActionData } from './$types';
	import type { Question } from '$lib/stores/quiz';
	// --- بداية الإصلاح: استيراد دالة goto ---
	import { goto } from '$app/navigation';
	// --- نهاية الإصلاح ---

	export let data: PageData;
	export let form: ActionData;

	let timeLeft: number | null = data.quiz.time_limit || null;
	let timerInterval: any;
	let startTime: number;

	function formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
	}

	onMount(() => {
		quizStore.startQuiz(data.questions as unknown as Question[]);
		startTime = Date.now();

		if (timeLeft !== null) {
			timerInterval = setInterval(() => {
				const elapsed = Math.floor((Date.now() - startTime) / 1000);
				const remaining = data.quiz.time_limit - elapsed;
				if (remaining >= 0) {
					timeLeft = remaining;
				} else {
					timeLeft = 0;
					clearInterval(timerInterval);
					const submitForm = document.getElementById('submitQuizForm') as HTMLFormElement;
					if (submitForm) submitForm.requestSubmit();
				}
			}, 1000);
		}

		return () => {
			quizStore.reset();
			clearInterval(timerInterval);
		};
	});

	$: if ($quizStore.isCompleted && timerInterval) {
		clearInterval(timerInterval);
	}

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
				<form
					id="submitQuizForm"
					method="POST"
					action="?/submitQuiz"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success' && result.data?.success) {
								await goto(`/quizzes/result/${result.data.attemptId}`);
							}
						};
					}}
				>
					<input type="hidden" name="answers" value={JSON.stringify($quizStore.userAnswers)} />
					<input type="hidden" name="time_taken" value={Math.floor((Date.now() - startTime) / 1000)} />
					<button
						type="submit"
						class="w-full bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition-transform hover:scale-105"
					>
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
					<div class="flex justify-between items-center text-sm text-gray-400 mb-2">
    {#if timeLeft !== null}
        <span class="font-mono text-lg text-red-400">{formatTime(timeLeft)}</span>
    {:else}
        <!-- svelte-ignore element_invalid_self_closing_tag -->
        <div />
    {/if}
    <p class="text-right">
        السؤال {$quizStore.currentQuestionIndex + 1} / {$quizStore.questions.length}
    </p>
</div>
					<div class="w-full bg-gray-700 rounded-full h-2.5" dir="rtl">
						<div class="bg-orange-500 h-2.5 rounded-full" style="width: {progress}%"></div>
					</div>
				</div>

				{#if currentQuestion.imageUrl}
					<div class="mb-6 flex justify-center">
						<img
							src={currentQuestion.imageUrl}
							alt="توضيح للسؤال"
							class="max-h-60 rounded-lg shadow-lg"
						/>
					</div>
				{/if}

				<h2 class="text-2xl md:text-3xl font-bold text-center mb-8" dir="rtl">
					{currentQuestion.text}
				</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each [
						currentQuestion.option_1,
						currentQuestion.option_2,
						currentQuestion.option_3,
						currentQuestion.option_4
					] as option, i}
						<button
    on:click={() => handleAnswer(i + 1)}
    class="p-4 bg-gray-700 rounded-lg text-lg text-center hover:bg-orange-500 hover:text-white transition-colors duration-200"
>
							{option}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>