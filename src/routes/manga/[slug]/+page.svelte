<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { invalidateAll } from '$app/navigation'; // لاستخدامه في المستقبل إذا أردت تحديث كل البيانات
	import MangaHeader from '$lib/components/MangaHeader.svelte';
	import ChapterList from '$lib/components/ChapterList.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import type { Chapter, EnrichedChapter, PaginatedResult } from '$lib/types';

	export let data: PageData;
	export let form: ActionData;

	// $: التفاعلية تجعل الواجهة تتحدث تلقائياً كلما تغيرت `data`
	$: ({ manga, isFavorited, readCount, lastReadChapter, firstUnreadChapter, user } = data);

	// ✨ السر رقم 3: إدارة قائمة الفصول الكاملة هنا في المكون الأب
	// نقوم بإثراء الفصول الأولية بمعلومات القراءة
	let chapters: EnrichedChapter[] = data.chaptersResult.items.map((c: Chapter) => ({
		...c,
		isRead: data.readChapterIds.includes(c.id)
	}));
	let totalPages = data.chaptersResult.totalPages;

	let isTogglingFavorite = false; // متغير لحالة انتظار زر المفضلة
	let showToast = false;
	let toastMessage = '';
	let toastType: 'success' | 'error' = 'success';
	let chapterListComponent: ChapterList;

	// مراقبة نتيجة الـ form لإظهار رسالة التنبيه
	$: if (form?.message) {
		toastMessage = form.message;
		toastType = form.success ? 'success' : 'error';
		showToast = true;
		setTimeout(() => (showToast = false), 3000);
		// في حالة فشل تحديث المفضلة، نعكس التغيير المتفائل الذي قمنا به
		if (form.success === false) {
			isFavorited = !isFavorited;
		}
		form = null; // إعادة تعيين الفورم لتجنب ظهوره مرة أخرى
	}

	// ✨ السر رقم 2: الدالة الجديدة والمحسّنة لتحميل المزيد من الفصول
	async function handleLoadMore(event: CustomEvent<{ page: number }>) {
		const nextPage = event.detail.page;
		// بناء الرابط لنقطة النهاية المخصصة
		const url = `/api/manga/${manga.slug}/chapters?page=${nextPage.toString()}`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`فشل جلب الفصول: ${response.statusText}`);
			}

			const newChaptersResult = (await response.json()) as PaginatedResult<Chapter>;

			// إثراء الفصول الجديدة بمعلومات القراءة
			const newEnrichedChapters: EnrichedChapter[] = newChaptersResult.items.map((c) => ({
				...c,
				isRead: data.readChapterIds.includes(c.id)
			}));

			// ✨ السر رقم 3: تحديث مصفوفة الفصول ببساطة، وSvelte سيتكفل بالباقي
			chapters = [...chapters, ...newEnrichedChapters];
			totalPages = newChaptersResult.totalPages;
		} catch (err) {
			console.error('Could not load more chapters:', err);
			// يمكنك إظهار رسالة خطأ للمستخدم هنا أيضاً
		} finally {
			// إعلام المكون الابن أن التحميل انتهى (سواء نجح أو فشل)
			if (chapterListComponent) {
				chapterListComponent.loadFinished();
			}
		}
	}
</script>

<svelte:head>
	<title>قراءة مانجا {manga.title} - جميع الفصول</title>
	<meta name="description" content={manga.description} />
	<meta property="og:title" content={manga.title} />
	<meta property="og:description" content={manga.description} />
	<meta property="og:image" content={manga.cover_image_url} />
	<meta property="og:type" content="books.book" />
</svelte:head>

{#if showToast}
	<Toast message={toastMessage} type={toastType} />
{/if}

<div class="font-tajawal min-h-screen bg-gray-900 text-white">
	<MangaHeader
		{manga}
		{user}
		{lastReadChapter}
		{firstUnreadChapter}
		bind:isFavorited
		bind:isSubmitting={isTogglingFavorite}
	/>

	<ChapterList
		bind:this={chapterListComponent}
		{manga}
		{chapters}
		{totalPages}
		lastReadChapterId={lastReadChapter?.id || null}
		on:loadMore={handleLoadMore}
	/>
</div>

<style>
	/* خط جميل للقراءة باللغة العربية */
	@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap');
	.font-tajawal {
		font-family: 'Tajawal', sans-serif;
	}
</style>
