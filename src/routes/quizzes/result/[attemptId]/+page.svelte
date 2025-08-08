<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { PageData } from './$types';
	export let data: PageData;

	$: attempt = data.attempt;
	$: correctAnswersCount = data.userAnswers.filter(answer => answer.is_correct).length;
	$: percentage = attempt.total_questions > 0 ? (correctAnswersCount / attempt.total_questions) * 100 : 0;
	let showReview = false;

	function getOptionText(question: any, optionNumber: number) {
		switch (optionNumber) {
			case 1:
				return question.option_1;
			case 2:
				return question.option_2;
			case 3:
				return question.option_3;
			case 4:
				return question.option_4;
			default:
				return '';
		}
	}

	function formatTime(seconds: number | null): string {
		if (seconds === null || isNaN(seconds)) {
			return 'غير محدد';
		}
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		if (minutes > 0) {
			return `${minutes} دقيقة و ${remainingSeconds} ثانية`;
		}
		return `${remainingSeconds} ثانية`;
	}
</script>

<svelte:head>
	<title>نتيجتك في اختبار: {attempt.expand?.quiz.title}</title>
</svelte:head>

<div
	class="min-h-screen flex flex-col items-center justify-center p-4 font-[Tajawal] bg-gray-900 text-white"
>
	<div
		class="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8 text-center transform transition-all mb-8"
	>
		<h1 class="text-2xl text-gray-300 mb-2">نتيجتك في اختبار</h1>
		<h2 class="text-4xl font-bold text-orange-400 mb-8">{attempt.expand?.quiz.title}</h2>

		<div class="mb-8">
			<p class="text-lg text-gray-400">لقد حصلت على</p>
			<p class="text-7xl font-bold my-4">
				<span class="text-green-400">{attempt.score}</span>
			</p>
			<p class="text-lg text-gray-400">نقطة</p>
		</div>

		<div class="w-full bg-gray-700 rounded-full h-4 mb-4">
			<div
				class="bg-green-500 h-4 rounded-full"
				style="width: {percentage}%"
				title="دقتك: {percentage.toFixed(1)}%"
			></div>
		</div>

		{#if attempt.time_taken}
			<p class="text-sm text-gray-400 mb-8">الوقت المستغرق: {formatTime(attempt.time_taken)}</p>
		{/if}

		<div class="flex justify-center gap-4 mt-12 flex-wrap">
			<a
				href="/quizzes/{attempt.expand?.quiz.slug}"
				class="bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition-transform hover:scale-105"
			>
				إعادة الاختبار
			</a>
			<a
				href="/quizzes/leaderboard/{attempt.expand?.quiz.slug}"
				class="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-transform hover:scale-105"
			>
				لوحة الصدارة
			</a>
			<a
				href="/quizzes"
				class="bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-transform hover:scale-105"
			>
				كل الاختبارات
			</a>
			<button
				on:click={() => (showReview = !showReview)}
				class="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-transform hover:scale-105"
			>
				{showReview ? 'إخفاء المراجعة' : 'مراجعة الإجابات'}
			</button>
		</div>
	</div>

	{#if showReview}
		<div
			class="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8 text-right space-y-6"
			transition:slide
		>
			<h2 class="text-3xl font-bold text-center text-orange-400 mb-6">مراجعة إجاباتك</h2>
			{#each data.userAnswers as userAnswer (userAnswer.id)}
				{@const question = userAnswer.expand?.question}
				{#if question}
					<div class="bg-gray-700/50 p-4 rounded-lg" dir="rtl">
						<p class="text-lg font-semibold mb-4" dir="rtl" >{question.text}</p>
						<div class="space-y-2">
							{#each [1, 2, 3, 4] as optionNum}
								{@const isUserAnswer = userAnswer.selected_option === optionNum}
								{@const isCorrectAnswer = question.correct_option === optionNum}
								<div
									class="p-3 rounded border-2 {isUserAnswer && isCorrectAnswer
										? 'bg-green-500/30 border-green-500'
										: ''} {isUserAnswer && !isCorrectAnswer
										? 'bg-red-500/30 border-red-500'
										: ''} {!isUserAnswer && isCorrectAnswer
										? 'border-yellow-400 text-yellow-300'
										: ''} {!isUserAnswer && !isCorrectAnswer ? 'border-transparent' : ''}"
								>
									{getOptionText(question, optionNum)}
									{#if isUserAnswer && isCorrectAnswer}
										<span class="text-xs mr-2">(إجابتك الصحيحة)</span>
									{:else if isUserAnswer && !isCorrectAnswer}
										<span class="text-xs mr-2">(إجابتك الخاطئة)</span>
									{:else if isCorrectAnswer}
										<span class="text-xs mr-2">(الإجابة الصحيحة)</span>
									{/if}
								</div>
							{/each}
						</div>
						{#if question.explanation}
    <div class="mt-4 pt-4 border-t border-gray-600">
        <p class="text-sm text-cyan-300 font-semibold" dir="rtl" >توضيح :</p>
        <p class="text-sm text-gray-300 leading-relaxed" dir="rtl">{question.explanation}</p>
    </div>
{/if}
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>