// src/lib/components/QuizCardSkeleton.svelte

<div class="flex animate-pulse flex-col overflow-hidden rounded-lg bg-gray-800 shadow-lg">
	<div class="h-48 w-full bg-gray-700"></div>
	<div class="flex flex-grow flex-col p-6 text-right">
		<div class="h-8 w-3/4 rounded bg-gray-700"></div>
		<div class="mt-4 h-4 w-full rounded bg-gray-700"></div>
		<div class="mt-2 h-4 w-5/6 rounded bg-gray-700"></div>
		<div class="mt-6 h-3 w-1/3 self-end rounded bg-gray-700"></div>
	</div>
</div>
