<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	$: attempt = data.attempt;
	$: percentage = (attempt.score / attempt.total_questions) * 100;
</script>

<svelte:head>
	<title>نتيجتك في اختبار: {attempt.expand?.quiz.title}</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4 font-[Tajawal] bg-gray-900 text-white">
	<div class="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8 text-center transform transition-all">
		<h1 class="text-2xl text-gray-300 mb-2">نتيجتك في اختبار</h1>
		<h2 class="text-4xl font-bold text-orange-400 mb-8">{attempt.expand?.quiz.title}</h2>

		<div class="mb-8">
			<p class="text-lg text-gray-400">لقد أجبت بشكل صحيح على</p>
			<p class="text-7xl font-bold my-4">
				<span class="text-green-400">{attempt.score}</span>
				<span class="text-gray-500">/</span>
				<span class="text-gray-400">{attempt.total_questions}</span>
			</p>
			<p class="text-lg text-gray-400">أسئلة</p>
		</div>

		<div class="w-full bg-gray-700 rounded-full h-4 mb-8">
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<div
				class="bg-green-500 h-4 rounded-full"
				style="width: {percentage}%"
				title="دقتك: {percentage.toFixed(1)}%"
			/>
		</div>

		<div class="flex justify-center gap-4 mt-12">
			<a
				href="/quizzes/{attempt.expand?.quiz.slug}"
				class="bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition-transform hover:scale-105"
			>
				إعادة الاختبار
			</a>
			<a
				href="/quizzes"
				class="bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-transform hover:scale-105"
			>
				العودة لكل الاختبارات
			</a>
		</div>
	</div>
</div>