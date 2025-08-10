<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { PageData } from './$types';
	// ✨ تحسين: استيراد page store للوصول إلى رابط الصفحة الحالي
	import { page } from '$app/stores';

	export let data: PageData;
	$: attempt = data.attempt;
	$: correctAnswersCount = data.userAnswers.filter((answer) => answer.is_correct).length;
	$: percentage =
		attempt.total_questions > 0 ? (correctAnswersCount / attempt.total_questions) * 100 : 0;
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

	// ✨ تحسين: إعداد نص ورابط المشاركة
	$: shareText = `لقد حصلت على ${attempt.score} نقطة في اختبار "${attempt.expand?.quiz.title}"! هل يمكنك تحقيق نتيجة أفضل؟`;
	$: shareUrl = $page.url.href;
</script>

<svelte:head>
	<title>نتيجتك في اختبار: {attempt.expand?.quiz.title}</title>
</svelte:head>

<div
	class="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 font-[Tajawal] text-white"
>
	<div
		class="mb-8 w-full max-w-2xl transform rounded-2xl bg-gray-800 p-8 text-center shadow-2xl transition-all"
	>
		<h1 class="mb-2 text-2xl text-gray-300">نتيجتك في اختبار</h1>
		<h2 class="mb-8 text-4xl font-bold text-orange-400">{attempt.expand?.quiz.title}</h2>

		<div class="mb-8">
			<p class="text-lg text-gray-400">لقد حصلت على</p>
			<p class="my-4 text-7xl font-bold">
				<span class="text-green-400">{attempt.score}</span>
			</p>
			<p class="text-lg text-gray-400">نقطة</p>
		</div>

		<div class="mb-4 h-4 w-full rounded-full bg-gray-700">
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<div
				class="h-4 rounded-full bg-green-500"
				style="width: {percentage}%"
				title="دقتك: {percentage.toFixed(1)}%"
			/>
		</div>

		{#if attempt.time_taken}
			<p class="mb-8 text-sm text-gray-400">الوقت المستغرق: {formatTime(attempt.time_taken)}</p>
		{/if}

		<div class="mt-10 border-t border-gray-700 pt-6">
			<h3 class="mb-4 text-lg font-semibold text-gray-300">شارك نتيجتك مع أصدقائك!</h3>
			<div class="flex items-center justify-center gap-4">
				<a
					href="https://twitter.com/intent/tweet?text={encodeURIComponent(
						shareText
					)}&url={encodeURIComponent(shareUrl)}"
					target="_blank"
					rel="noopener noreferrer"
					class="flex h-12 w-12 items-center justify-center rounded-full bg-[#1DA1F2] transition-colors hover:bg-[#1a91da]"
					aria-label="شارك على تويتر"
				>
					<svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.39.106-.803.163-1.227.163-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"
						/>
					</svg>
				</a>
				<a
					href="https://api.whatsapp.com/send?text={encodeURIComponent(shareText + ' ' + shareUrl)}"
					target="_blank"
					rel="noopener noreferrer"
					class="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] transition-colors hover:bg-[#20b859]"
					aria-label="شارك على واتساب"
				>
					<svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.46 3.48 1.32 4.94L2 22l5.25-1.38c1.41.79 3.02 1.21 4.71 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.3c-1.55 0-3.03-.4-4.32-1.15l-.31-.18-3.22.84.86-3.14-.2-.33c-.83-1.35-1.27-2.91-1.27-4.53 0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.24 8.24zm4.52-6.2c-.25-.12-1.47-.72-1.7-.81-.23-.09-.39-.12-.56.12-.17.25-.64.81-.79.97-.15.17-.29.19-.54.06-.25-.12-1.06-.39-2.02-1.25-.75-.66-1.25-1.48-1.4-1.73-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.55-.42h-.48c-.15 0-.39.06-.6.31-.2.25-.79.76-.79 1.85s.81 2.15.93 2.3.79 1.24 1.9 1.78c1.11.54 1.89.86 2.54 1.1.86.33 1.37.28 1.88.17.59-.13 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.11-.22-.18-.47-.3z"
						/>
					</svg>
				</a>
			</div>
		</div>

		<div class="mt-8 flex flex-wrap justify-center gap-4">
			<a
				href="/quizzes/{attempt.expand?.quiz.slug}"
				class="rounded-lg bg-orange-600 px-6 py-3 font-bold text-white transition-transform hover:scale-105 hover:bg-orange-700"
			>
				إعادة الاختبار
			</a>
			<a
				href="/quizzes/leaderboard/{attempt.expand?.quiz.slug}"
				class="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition-transform hover:scale-105 hover:bg-blue-700"
			>
				لوحة الصدارة
			</a>
			<a
				href="/quizzes"
				class="rounded-lg bg-gray-700 px-6 py-3 font-bold text-white transition-transform hover:scale-105 hover:bg-gray-600"
			>
				كل الاختبارات
			</a>
			<button
				on:click={() => (showReview = !showReview)}
				class="rounded-lg bg-purple-600 px-6 py-3 font-bold text-white transition-transform hover:scale-105 hover:bg-purple-700"
			>
				{showReview ? 'إخفاء المراجعة' : 'مراجعة الإجابات'}
			</button>
		</div>
	</div>

	{#if showReview}
		<div
			class="w-full max-w-2xl space-y-6 rounded-2xl bg-gray-800 p-8 text-right shadow-2xl"
			transition:slide
		>
			<h2 class="mb-6 text-center text-3xl font-bold text-orange-400">مراجعة إجاباتك</h2>
			{#each data.userAnswers as userAnswer (userAnswer.id)}
				{@const question = userAnswer.expand?.question}
				{#if question}
					{@const optionsToShow = question.type === 'true_false' ? [1, 2] : [1, 2, 3, 4]}
					<div class="rounded-lg bg-gray-700/50 p-4" dir="rtl">
						<p class="mb-4 text-lg font-semibold" dir="rtl">{question.text}</p>

						<div class="space-y-2">
							{#each optionsToShow as optionNum}
								{@const isUserAnswer = userAnswer.selected_option === optionNum}
								{@const isCorrectAnswer = question.correct_option === optionNum}
								<div
									class="rounded border-2 p-3 {isUserAnswer && isCorrectAnswer
										? 'border-green-500 bg-green-500/30'
										: ''} {isUserAnswer && !isCorrectAnswer
										? 'border-red-500 bg-red-500/30'
										: ''} {!isUserAnswer && isCorrectAnswer
										? 'border-yellow-400 text-yellow-300'
										: ''} {!isUserAnswer && !isCorrectAnswer ? 'border-transparent' : ''}"
								>
									{getOptionText(question, optionNum)}
									{#if isUserAnswer && isCorrectAnswer}
										<span class="mr-2 text-xs">(إجابتك الصحيحة)</span>
									{:else if isUserAnswer && !isCorrectAnswer}
										<span class="mr-2 text-xs">(إجابتك الخاطئة)</span>
									{:else if isCorrectAnswer}
										<span class="mr-2 text-xs">(الإجابة الصحيحة)</span>
									{/if}
								</div>
							{/each}
						</div>
						{#if question.explanation}
							<div class="mt-4 border-t border-gray-600 pt-4">
								<p class="text-sm font-semibold text-cyan-300" dir="rtl">توضيح :</p>
								<p class="text-sm leading-relaxed text-gray-300" dir="rtl">
									{question.explanation}
								</p>
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
