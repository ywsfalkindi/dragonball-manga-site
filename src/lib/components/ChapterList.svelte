<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import type { EnrichedChapter, Manga } from '$lib/types';

	export let manga: Manga;
	// ✨ السر رقم 3: المكون الآن يستقبل مصفوفة الفصول الكاملة ويتفاعل معها
	export let chapters: EnrichedChapter[];
	export let totalPages: number;
	export let lastReadChapterId: string | null;

	const dispatch = createEventDispatcher();

	let searchTerm = '';
	let sortOrder: 'asc' | 'desc' = 'asc';
	// ✨ ميزة جديدة: حالة فلتر القراءة
	let readFilter: 'all' | 'read' | 'unread' = 'all';

	let filteredChapters: EnrichedChapter[] = [];
	let endOfPage: HTMLElement;
	let isLoadingMore = false;
	let currentPage = 1;

	// $: تفاعلية Svelte الخارقة
	$: {
		let tempChapters = [...chapters];

		// 1. تطبيق فلتر القراءة أولاً
		if (readFilter === 'read') {
			tempChapters = tempChapters.filter((c) => c.isRead);
		} else if (readFilter === 'unread') {
			tempChapters = tempChapters.filter((c) => !c.isRead);
		}

		// 2. تطبيق فلتر البحث
		if (searchTerm) {
			tempChapters = tempChapters.filter((c) => c.chapter_number.toString().includes(searchTerm));
		}

		// 3. تطبيق الترتيب أخيراً
		if (sortOrder === 'desc') {
			// reverse() يغير المصفوفة الأصلية، لذا نعمل على نسخة
			tempChapters.reverse();
		}

		filteredChapters = tempChapters;
	}

	// هذه الدالة ستبقى مهمتها إعلام الأب بأننا وصلنا للنهاية
	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && currentPage < totalPages && !isLoadingMore) {
					isLoadingMore = true;
					// نزيد رقم الصفحة محلياً ونرسله للأب ليجلب البيانات
					currentPage++;
					dispatch('loadMore', { page: currentPage });
				}
			},
			{ rootMargin: '200px' } // ابدأ التحميل قبل 200 بكسل من الوصول للنهاية
		);

		if (endOfPage) observer.observe(endOfPage);
		return () => {
			if (endOfPage) observer.unobserve(endOfPage);
		};
	});

	// ✨ السر رقم 3: لم نعد بحاجة لدالة `chaptersLoaded`!
	// بدلاً من ذلك، نُعلم الأب أن عملية التحميل انتهت ليقوم هو بتحديث البيانات
	export function loadFinished() {
		isLoadingMore = false;
	}
</script>

<main class="container mx-auto px-4 py-12" dir="rtl">
	<div class="mb-6 flex flex-col gap-4">
		<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
			<h2 class="text-3xl font-bold text-orange-500">
				قائمة الفصول ({manga.total_chapters || chapters.length})
			</h2>

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
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
							></path></svg
						>
					{:else}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 4h13M3 8h9m-9 4h6m4 0l4 4m0 0l-4 4m4-4V4"
							></path></svg
						>
					{/if}
				</button>
			</div>
		</div>

		<div class="flex justify-center gap-2 rounded-lg bg-gray-800 p-1">
			<button
				class="flex-1 rounded-md p-2 text-sm transition {readFilter === 'all'
					? 'bg-orange-600 font-bold'
					: 'hover:bg-gray-700'}"
				on:click={() => (readFilter = 'all')}>الكل</button
			>
			<button
				class="flex-1 rounded-md p-2 text-sm transition {readFilter === 'read'
					? 'bg-orange-600 font-bold'
					: 'hover:bg-gray-700'}"
				on:click={() => (readFilter = 'read')}>المقروءة</button
			>
			<button
				class="flex-1 rounded-md p-2 text-sm transition {readFilter === 'unread'
					? 'bg-orange-600 font-bold'
					: 'hover:bg-gray-700'}"
				on:click={() => (readFilter = 'unread')}>غير المقروءة</button
			>
		</div>
	</div>

	<div class="rounded-lg bg-gray-800 shadow-lg">
		<ul class="divide-y divide-gray-700">
			{#each filteredChapters as chapter (chapter.id)}
				<li class={lastReadChapterId === chapter.id ? 'bg-blue-900/30' : ''}>
					<a
						href="/manga/{manga.slug}/{chapter.chapter_number}"
						class="flex items-center justify-between p-4 transition-colors duration-200 hover:bg-gray-700/50"
					>
						<div class="flex items-center gap-x-3">
							<span class="text-lg font-semibold">الفصل {chapter.chapter_number}</span>
							{#if chapter.isRead}
								<span class="rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">مقروء</span>
							{/if}
							{#if lastReadChapterId === chapter.id}
								<span class="rounded-full bg-green-500 px-2 py-0.5 text-xs text-white"
									>آخر قراءة</span
								>
							{/if}
						</div>

						{#if !chapter.isRead}
							<span class="rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white"
								>اقرأ الآن</span
							>
						{/if}
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

		<div bind:this={endOfPage} class="h-1"></div>
	</div>
</main>
