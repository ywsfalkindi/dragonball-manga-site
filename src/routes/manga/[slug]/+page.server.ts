import { pb } from '$lib/pocketbase';
import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type {
	Manga,
	Chapter,
	PaginatedResult,
	ReadHistoryRecord,
	LastReadChapterInfo
} from '$lib/types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const initialLimit = 30;

	try {
		const manga = await pb.collection('mangas').getFirstListItem<Manga>(`slug = "${params.slug}"`);
		manga.cover_image_url = pb.files.getURL(manga, manga.cover_image);

		// ✅ THE FIX IS HERE: We are combining the two chapter requests into one.
		const [chaptersResult, isFavorited, historyRecords] = await Promise.all([
			// 1. Get the first chapter page AND the total count in a single call.
			pb.collection('chapters').getList<Chapter>(1, initialLimit, {
				filter: `manga = "${manga.id}"`,
				sort: 'chapter_number',
				count: true // This key gives us totalItems without a separate request.
			}),
			// 2. Check for favorite status.
			locals.user
				? pb
						.collection('favorites')
						.getFirstListItem(`user = "${locals.user.id}" && manga = "${manga.id}"`)
						.then(() => true)
						.catch(() => false)
				: Promise.resolve(false),
			// 3. Get the user's read history.
			locals.user
				? pb.collection('read_history').getFullList<ReadHistoryRecord>({
						filter: `user = "${locals.user.id}" && manga = "${manga.id}"`,
						sort: '-updated',
						expand: 'chapter'
					})
				: Promise.resolve([])
		]);

		// Now, get the total chapter count from our single, successful API call.
		const totalChaptersCount = chaptersResult.totalItems;
		manga.total_chapters = totalChaptersCount;

		// --- The rest of the function remains the same ---

		const readChapterIds = new Set(historyRecords.map((r) => r.chapter));
		let lastReadChapter: LastReadChapterInfo | null = null;
		let firstUnreadChapter: Chapter | null = null;

		if (historyRecords.length > 0) {
			const lastRecord = historyRecords[0];
			if (lastRecord.expand && lastRecord.expand.chapter) {
				lastReadChapter = {
					...lastRecord.expand.chapter,
					last_page_read: lastRecord.last_page_read
				};
			}
		}

		// To find the first unread chapter, we still need the full list.
		// Note: This could be slow for manga with thousands of chapters.
		// A future optimization could be a dedicated API endpoint for this.
		const allChaptersSorted = await pb.collection('chapters').getFullList<Chapter>({
			filter: `manga = "${manga.id}"`,
			sort: 'chapter_number'
		});

		for (const chapter of allChaptersSorted) {
			if (!readChapterIds.has(chapter.id)) {
				firstUnreadChapter = chapter;
				break;
			}
		}

		return {
			user: locals.user || null,
			manga,
			isFavorited,
			chaptersResult: chaptersResult as PaginatedResult<Chapter>,
			readChapterIds: Array.from(readChapterIds),
			lastReadChapter,
			firstUnreadChapter,
			readCount: readChapterIds.size
		};
	} catch (err: any) {
		// The error was happening before this catch block.
		// It's still good to have for other potential errors.
		if (err.status === 404) {
			throw error(404, 'The requested manga does not exist.');
		}
		console.error('Failed to load manga page:', err);
		throw error(500, 'A server error occurred while loading the manga page.');
	}
};

export const actions: Actions = {
	toggleFavorite: async ({ locals, request }) => {
		if (!locals.user) {
			throw redirect(303, '/login');
		}

		const formData = await request.formData();
		const mangaId = formData.get('mangaId') as string;
		const currentIsFavorited = formData.get('isFavorited') === 'true';

		const filter = `user = "${locals.user.id}" && manga = "${mangaId}"`;

		try {
			if (currentIsFavorited) {
				// عملية الحذف (Unfavorite)
				// نبحث عن السجل أولاً لنتأكد من وجوده قبل الحذف
				const record = await pb.collection('favorites').getFirstListItem(filter);
				await pb.collection('favorites').delete(record.id);
				return { success: true, message: 'تمت الإزالة من المفضلة بنجاح' };
			} else {
				// ✅ الحل هنا: عملية الإضافة (Favorite)
				// قبل أن نحاول إنشاء سجل جديد، نتأكد أنه غير موجود بالفعل
				try {
					await pb.collection('favorites').getFirstListItem(filter);
					// إذا نجح هذا السطر، فهذا يعني أن السجل موجود بالفعل!
					// هذا لا يفترض أن يحدث إذا كانت الواجهة تعمل بشكل صحيح، لكنه حماية إضافية.
					return { success: false, message: 'هذه المانجا موجودة بالفعل في المفضلة.' };
				} catch (err: any) {
					// إذا كان الخطأ 404، فهذا يعني أن السجل غير موجود، وهذا هو ما نريده!
					if (err.status === 404) {
						// الآن يمكننا الإضافة بأمان
						await pb.collection('favorites').create({
							user: locals.user.id,
							manga: mangaId
						});
						return { success: true, message: 'تمت الإضافة للمفضلة بنجاح' };
					}
					// إذا كان الخطأ شيئاً آخر، نرسله للمعالجة
					throw err;
				}
			}
		} catch (err: any) {
			console.error('Toggle Favorite Action Error:', err);
			// إذا كان الخطأ بسبب قاعدة البيانات (مثلاً القيد الذي وضعناه)، ستظهر رسالة مناسبة
			if (err.data?.data?.name?.code === 'validation_not_unique') {
				return { success: false, message: 'هذه المانجا موجودة بالفعل في المفضلة.' };
			}
			return { success: false, message: 'فشل تحديث المفضلة. حاول مرة أخرى.' };
		}
	}
};
