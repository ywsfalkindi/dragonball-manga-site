<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { page } from '$app/stores';
	import type { Chapter } from '$lib/types'; // للتأكد من أننا نستخدم الأنواع الصحيحة

	// ✨ استيراد المكونات الجديدة
	import MangaHeader from '$lib/components/MangaHeader.svelte';
	import ChapterList from '$lib/components/ChapterList.svelte';
	import Toast from '$lib/components/Toast.svelte';

	export let data: PageData;
	export let form: ActionData;

	// ✨ استخدام التفاعلية الكاملة لجعل الواجهة تتحدث تلقائياً
	$: ({ manga, isFavorited, chaptersResult, readChapterIds, lastReadChapter, user } = data);

	// متغير للتحكم في حالة انتظار زر المفضلة
	let isSubmitting = false;

	// متغيرات خاصة برسالة التنبيه (Toast)
	let showToast = false;
	let toastMessage = '';
	let toastType: 'success' | 'error' = 'success';

	// متغير للوصول إلى مكون قائمة الفصول برمجياً
	let chapterListComponent: ChapterList;

	// ✨ مراقبة نتيجة الـ form لإظهار رسالة التنبيه
	$: if (form?.message) {
		toastMessage = form.message;
		toastType = form.success ? 'success' : 'error';
		showToast = true;
		setTimeout(() => (showToast = false), 3000);
		// إعادة تعيين الفورم لتجنب ظهوره مرة أخرى عند التنقل
		form = null;
	}

	// ✨ دالة تحميل المزيد من الفصول، سيتم استدعاؤها من مكون ChapterList
	async function handleLoadMore(event: CustomEvent<{ page: number }>) {
		const nextPage = event.detail.page;
		const url = new URL($page.url);
		url.searchParams.set('page', nextPage.toString());

		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error('Failed to fetch next page');

			// For a seamless infinite scroll, a dedicated API endpoint is best.
			// This basic example re-fetches the page data. A better way involves `invalidate`.
			// Let's assume the basic fetch for now.
			const nextData = (await response.json()) as PageData;
			const newChapters = nextData.chaptersResult.items;

			if (chapterListComponent && newChapters) {
				// We must cast the type here as well, because JSON does not carry type info.
				chapterListComponent.chaptersLoaded(newChapters as Chapter[], nextPage);
			}
		} catch (err) {
			console.error('Could not load more chapters:', err);
		}
	}
</script>

<svelte:head>
	<title>قراءة مانجا {manga.title} - جميع الفصول</title>
	<meta name="description" content={manga.description} />
</svelte:head>

{#if showToast}
	<Toast message={toastMessage} type={toastType} />
{/if}

<div class="min-h-screen bg-gray-900 font-[Tajawal] text-white">
	<MangaHeader {manga} {user} {lastReadChapter} {isFavorited} bind:isSubmitting />

	<ChapterList
		bind:this={chapterListComponent}
		{manga}
		initialChapters={chaptersResult.items as Chapter[]}
		totalPages={chaptersResult.totalPages}
		readChapterIds={readChapterIds as string[]}
		{lastReadChapter}
		on:loadMore={handleLoadMore}
	/>
</div>
