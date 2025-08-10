<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	function formatTime(seconds: number | null): string {
		if (seconds === null || isNaN(seconds)) {
			return '-';
		}
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		if (minutes > 0) {
			return `${minutes}د ${remainingSeconds}ث`;
		}
		return `${remainingSeconds}ث`;
	}

	function getRankBgClass(rank: number): string {
		if (rank === 1) return 'bg-yellow-500/10';
		if (rank === 2) return 'bg-gray-400/10';
		if (rank === 3) return 'bg-orange-700/10';
		return '';
	}

	function getRankTextColor(rank: number): string {
		if (rank === 1) return 'text-yellow-400';
		if (rank === 2) return 'text-gray-300';
		if (rank === 3) return 'text-orange-500';
		return 'text-gray-400';
	}
</script>

<svelte:head>
	<title>لوحة الصدارة: {data.quiz.title}</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 p-8 font-[Tajawal] text-white">
	<div class="container mx-auto">
		<a href="/quizzes" class="mb-8 block text-blue-400 hover:underline"
			>&larr; العودة إلى الاختبارات</a
		>
		<h1 class="mb-2 text-center text-4xl font-bold text-orange-400">لوحة الصدارة لاختبار</h1>
		<h2 class="mb-12 text-center text-2xl text-gray-300">"{data.quiz.title}"</h2>

		<div class="mx-auto max-w-3xl overflow-hidden rounded-lg bg-gray-800 shadow-2xl">
			{#if data.leaderboard.length > 0}
				<ul class="divide-y divide-gray-700">
					{#each data.leaderboard as entry, i}
						{@const rank = i + 1}
						{@const rankColorClass = getRankTextColor(rank)}
						<li class="flex items-center gap-4 p-4 transition-colors {getRankBgClass(rank)}">
							<div
								class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold {rankColorClass}"
							>
								{#if rank === 1}
									<span>🥇</span>
								{:else if rank === 2}
									<span>🥈</span>
								{:else if rank === 3}
									<span>🥉</span>
								{:else}
									<span>{rank}</span>
								{/if}
							</div>
							<div class="flex-grow">
								<p class="text-lg font-bold">{entry.expand?.user?.username || 'لاعب مجهول'}</p>
								<p class="text-sm text-gray-400">
									اكتمل في: {new Date(entry.completed_at).toLocaleDateString('ar')}
								</p>
							</div>
							<div class="text-left">
								<p class="text-xl font-bold text-green-400">
									{entry.score}
									<span class="text-sm text-gray-500">/{entry.total_questions}</span>
								</p>
								<p class="text-xs text-gray-400">
									الزمن: {formatTime(entry.time_taken)}
								</p>
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="p-16 text-center" dir="rtl">
					<p class="text-2xl text-gray-400">لوحة الصدارة فارغة حالياً</p>
					<p class="mt-2 text-gray-500">كن أول من ينهي هذا التحدي ويسجل اسمه هنا !</p>
					<a
						href="/quizzes/{data.quiz.slug}"
						class="mt-6 inline-block rounded-lg bg-orange-600 px-6 py-2 font-bold text-white transition-colors hover:bg-orange-500"
					>
						ابدأ التحدي الآن
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>
