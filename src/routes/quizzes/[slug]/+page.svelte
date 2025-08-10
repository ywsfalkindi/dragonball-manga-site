<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount, onDestroy } from 'svelte';
	import { quizStore } from '$lib/stores/quiz';
	import type { PageData, ActionData } from './$types';
	import type { Question } from '$lib/stores/quiz';
	import { goto } from '$app/navigation';

	export let data: PageData;
	export let form: ActionData;

	let timeLeft: number | null = data.quiz.time_limit || null;
	let timerInterval: any;
	let startTime: number;
	// ✨ تحسين: متغير لتتبع الإجابات المتتالية الصحيحة
	let correctStreak = 0;

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

<div
	class="flex min-h-screen items-center justify-center bg-gray-900 p-4 font-[Tajawal] text-white"
>
	<div class="w-full max-w-2xl transform rounded-2xl bg-gray-800 p-8 shadow-2xl transition-all">
		{#if $quizStore.isCompleted}
			<div class="text-center">
				<h2 class="mb-4 text-3xl font-bold text-green-400">أكملت التحدي!</h2>
				<p class="mb-8 text-gray-300">أنت على وشك معرفة نتيجتك. هل أنت مستعد؟</p>
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
					<input
						type="hidden"
						name="time_taken"
						value={Math.floor((Date.now() - startTime) / 1000)}
					/>
					<button
						type="submit"
						class="w-full rounded-lg bg-orange-600 px-6 py-3 font-bold text-white transition-transform hover:scale-105 hover:bg-orange-700"
					>
						عرض نتيجتي الآن!
					</button>
				</form>
				{#if form?.error}
					<p class="mt-4 text-red-500">{form.error}</p>
				{/if}
			</div>
		{:else if currentQuestion}
			<div>
				<div class="mb-6">
					<div class="mb-2 flex items-center justify-between text-sm text-gray-400">
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
					<div class="h-2.5 w-full rounded-full bg-gray-700" dir="rtl">
						<!-- svelte-ignore element_invalid_self_closing_tag -->
						<div class="h-2.5 rounded-full bg-orange-500" style="width: {progress}%" />
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

				<h2 class="mb-8 text-center text-2xl font-bold md:text-3xl" dir="rtl">
					{currentQuestion.text}
				</h2>

				{#if currentQuestion.type === 'true_false'}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<button
							on:click={() => handleAnswer(1)}
							class="rounded-lg bg-gray-700 p-4 text-center text-lg transition-colors duration-200 hover:bg-green-500 hover:text-white"
						>
							{currentQuestion.option_1}
						</button>
						<button
							on:click={() => handleAnswer(2)}
							class="rounded-lg bg-gray-700 p-4 text-center text-lg transition-colors duration-200 hover:bg-red-500 hover:text-white"
						>
							{currentQuestion.option_2}
						</button>
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each [currentQuestion.option_1, currentQuestion.option_2, currentQuestion.option_3, currentQuestion.option_4] as option, i}
							<button
								on:click={() => handleAnswer(i + 1)}
								class="rounded-lg bg-gray-700 p-4 text-center text-lg transition-colors duration-200 hover:bg-orange-500 hover:text-white"
							>
								{option}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
