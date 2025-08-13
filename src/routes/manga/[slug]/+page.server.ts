// src/routes/manga/[slug]/+page.server.ts

import { pb } from '$lib/pocketbase';
import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type { Manga, Chapter } from '$lib/types'; // لنفترض وجود هذا الملف للممارسات الفضلى

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = 30; // زيادة الحد لدعم التمرير اللانهائي بشكل أفضل

	try {
		// أولاً، نحتاج للمانجا نفسها
		const manga = await pb.collection('mangas').getFirstListItem<Manga>(`slug = "${params.slug}"`);
		manga.cover_image_url = pb.files.getURL(manga, manga.cover_image);

		// الآن، يمكننا جلب بقية البيانات بالتوازي باستخدام Promise.all
		const [chaptersResult, isFavorited, historyRecords] = await Promise.all([
			// 1. جلب الفصول
			pb.collection('chapters').getList<Chapter>(page, limit, {
				filter: `manga = "${manga.id}"`,
				sort: 'chapter_number'
			}),
			// 2. التحقق من المفضلة (فقط إذا كان المستخدم مسجلاً)
			locals.user
				? pb
						.collection('favorites')
						.getFirstListItem(`user = "${locals.user.id}" && manga = "${manga.id}"`)
						.then(() => true)
						.catch(() => false)
				: Promise.resolve(false),
			// 3. جلب سجل القراءة (فقط إذا كان المستخدم مسجلاً)
			locals.user
				? pb.collection('read_history').getFullList({
						filter: `user = "${locals.user.id}" && manga = "${manga.id}"`,
						sort: '-updated',
						expand: 'chapter'
					})
				: Promise.resolve([])
		]);

		// معالجة البيانات بعد جلبها
		const readChapterIds = historyRecords.map((r: any) => r.chapter);
		let lastReadChapter = null;

		if (historyRecords.length > 0) {
			const lastRecord = historyRecords[0];
			if (lastRecord.expand && lastRecord.expand.chapter) {
				lastReadChapter = {
					...lastRecord.expand.chapter,
					last_page_read: lastRecord.last_page_read
				};
			}
		}

		// إعادة البيانات للواجهة الأمامية
		// ✨ تحسين: التأكد من أن كل البيانات متوافقة مع JSON
		return {
			user: locals.user || null,
			manga: JSON.parse(JSON.stringify(manga)),
			isFavorited,
			chaptersResult: JSON.parse(JSON.stringify(chaptersResult)),
			readChapterIds: JSON.parse(JSON.stringify(readChapterIds)),
			lastReadChapter: JSON.parse(JSON.stringify(lastReadChapter))
		};
	} catch (err: any) {
		if (err.status === 404) {
			throw error(404, 'المانجا المطلوبة غير موجودة');
		}
		console.error('Failed to load manga page:', err);
		throw error(500, 'حدث خطأ في الخادم أثناء تحميل صفحة المانجا.');
	}
};

export const actions: Actions = {
	// ✨ تحسين: دمج favorite و unfavorite في action واحد
	toggleFavorite: async ({ locals, request }) => {
		if (!locals.user) throw redirect(303, '/login');

		const formData = await request.formData();
		const mangaId = formData.get('mangaId') as string;
		const isFavorited = formData.get('isFavorited') === 'true';

		try {
			if (isFavorited) {
				// عملية الحذف (كانت unfavorite)
				const record = await pb
					.collection('favorites')
					.getFirstListItem(`user = "${locals.user.id}" && manga = "${mangaId}"`);
				await pb.collection('favorites').delete(record.id);
				return { success: true, message: 'تمت الإزالة من المفضلة' };
			} else {
				// عملية الإضافة (كانت favorite)
				await pb.collection('favorites').create({ user: locals.user.id, manga: mangaId });
				return { success: true, message: 'تمت الإضافة للمفضلة' };
			}
		} catch (err) {
			console.error('Toggle Favorite Action Error:', err);
			return { success: false, message: 'حدث خطأ ما، يرجى المحاولة مرة أخرى' };
		}
	}
};
