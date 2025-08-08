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

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white">
	<div class="container mx-auto">
		<a href="/quizzes" class="text-blue-400 hover:underline mb-8 block">&larr; العودة إلى الاختبارات</a>
		<h1 class="text-4xl font-bold mb-2 text-center text-orange-400">لوحة الصدارة لاختبار</h1>
		<h2 class="text-2xl text-center text-gray-300 mb-12">"{data.quiz.title}"</h2>

		<div class="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
			{#if data.leaderboard.length > 0}
				<ul class="divide-y divide-gray-700">
					{#each data.leaderboard as entry, i}
						{@const rank = i + 1}
						{@const rankColorClass = getRankTextColor(rank)}
						<li class="p-4 flex items-center gap-4 transition-colors {getRankBgClass(rank)}">
							<div
								class="flex-shrink-0 w-12 h-12 flex items-center justify-center text-xl font-bold rounded-full {rankColorClass}"
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
								<p class="font-bold text-lg">{entry.expand?.user?.username || 'لاعب مجهول'}</p>
								<p class="text-sm text-gray-400">
									اكتمل في: {new Date(entry.completed_at).toLocaleDateString('ar')}
								</p>
							</div>
							<div class="text-left">
								<p class="font-bold text-green-400 text-xl">
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
				<div class="p-16 text-center" dir="rtl" >
					<p class="text-2xl text-gray-400">لوحة الصدارة فارغة حالياً</p>
					<p class="text-gray-500 mt-2">كن أول من ينهي هذا التحدي ويسجل اسمه هنا !</p>
					<a
						href="/quizzes/{data.quiz.slug}"
						class="mt-6 inline-block bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-orange-500"
					>
						ابدأ التحدي الآن
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>