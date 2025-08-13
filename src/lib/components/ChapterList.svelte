<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import type { Chapter } from '$lib/types'; // ✨ استيراد النوع المخصص من ملف الأنواع

	// تعريف البيانات باستخدام الأنواع المحددة
	export let manga: any; // يمكن أيضاً إنشاء نوع خاص بالمانجا
	export let initialChapters: Chapter[]; // ✨ استخدام النوع المخصص
	export let totalPages: number;
	export let readChapterIds: string[];
	export let lastReadChapter: Chapter | null; // ✨ استخدام النوع المخصص

	const dispatch = createEventDispatcher();

	// حالات محلية للمكون مع تحديد الأنواع
	let chapters: Chapter[] = initialChapters; // ✨ استخدام النوع المخصص
	let searchTerm = '';
	let sortOrder: 'asc' | 'desc' = 'asc';
	let filteredChapters: Chapter[] = []; // ✨ استخدام النوع المخصص
	let endOfPage: HTMLElement;
	let isLoadingMore = false;
	let currentPage = 1;

	// تحديث الفصول عند تغير البيانات الأولية
	$: chapters = initialChapters;

	// فلترة وفرز الفصول
	$: {
		let tempChapters = [...chapters];
		if (sortOrder === 'desc') {
			tempChapters.reverse();
		}
		if (searchTerm) {
			filteredChapters = tempChapters.filter((c) =>
				c.chapter_number.toString().includes(searchTerm)
			);
		} else {
			filteredChapters = tempChapters;
		}
	}

	// مراقبة الوصول لنهاية الصفحة
	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && currentPage < totalPages && !isLoadingMore) {
					isLoadingMore = true;
					dispatch('loadMore', { page: currentPage + 1 });
				}
			},
			{ rootMargin: '200px' }
		);

		if (endOfPage) observer.observe(endOfPage);
		return () => {
			if (endOfPage) observer.unobserve(endOfPage);
		};
	});

	// دالة عامة لتحديث الحالة عند تحميل المزيد من الفصول
	// ✨ استخدام النوع المخصص في البارامترات
	export function chaptersLoaded(newChapters: Chapter[], newPage: number) {
		chapters = [...chapters, ...newChapters];
		currentPage = newPage;
		isLoadingMore = false;
	}
</script>

<main class="container mx-auto px-4 py-12" dir="rtl">
	<div class="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
		<h2 class="text-3xl font-bold text-orange-500">قائمة الفصول</h2>

		<div class="flex w-full items-center gap-2 md:w-auto">
			<input
				type="search"
				bind:value={searchTerm}
				placeholder="ابحث عن فصل..."
				class="w-full rounded-lg border-2 border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 transition focus:border-orange-500 focus:ring-0 focus:outline-none"
			/>
			<button
				on:click={() => (sortOrder = sortOrder === 'asc' ? 'desc' : 'asc')}
				class="flex-shrink-0 rounded-lg bg-gray-700 p-2 text-white transition hover:bg-orange-600"
				aria-label="تغيير ترتيب الفصول"
			>
				{#if sortOrder === 'asc'}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"
						></polyline></svg
					>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"
						></polyline></svg
					>
				{/if}
			</button>
		</div>
	</div>

	<div class="rounded-lg bg-gray-800 shadow-lg">
		<ul class="divide-y divide-gray-700">
			{#each filteredChapters as chapter (chapter.id)}
				<li class={lastReadChapter?.id === chapter.id ? 'bg-blue-900/30' : ''}>
					<a
						href="/manga/{manga.slug}/{chapter.chapter_number}"
						class="flex items-center justify-between p-4 transition-colors duration-200 hover:bg-gray-700/50"
					>
						<div class="flex items-center gap-x-2 space-x-3 rtl:space-x-reverse">
							<span class="text-xl font-semibold">الفصل {chapter.chapter_number}</span>
							{#if readChapterIds.includes(chapter.id)}
								<span class="rounded-full bg-blue-500 px-2 py-1 text-xs text-white">مقروء</span>
							{/if}
							{#if lastReadChapter?.id === chapter.id}
								<span class="rounded-full bg-green-500 px-2 py-1 text-xs text-white">آخر قراءة</span
								>
							{/if}
						</div>
						<span class="rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white"
							>اقرأ الآن</span
						>
					</a>
				</li>
			{:else}
				<li class="p-6 text-center text-gray-400">
					{#if chapters.length > 0}
						لا توجد فصول تطابق بحثك.
					{:else}
						لم تتم إضافة أي فصول لهذه المانجا بعد.
					{/if}
				</li>
			{/each}
		</ul>

		{#if isLoadingMore}
			<div class="p-4 text-center text-gray-400">جاري تحميل المزيد...</div>
		{/if}

		<div bind:this={endOfPage}></div>
	</div>
</main>
