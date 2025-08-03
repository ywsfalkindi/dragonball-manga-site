import { pb } from '$lib/pocketbase';
import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit'; // Import the error helper

export const load: PageServerLoad = async ({ locals, params, url }) => {
	try {
		const manga = await pb.collection('mangas').getFirstListItem(`slug = "${params.slug}"`);
		manga.cover_image_url = pb.files.getURL(manga, manga.cover_image);

		const page = Number(url.searchParams.get('page')) || 1;
		const chaptersResult = await pb.collection('chapters').getList(page, 20, {
			filter: `manga = "${manga.id}"`,
			sort: 'chapter_number'
		});

		let isFavorited = false;
		let readChapterIds = new Set();
		let lastReadChapter = null;

		if (locals.user) {
			try {
				await pb
					.collection('favorites')
					.getFirstListItem(`user = "${locals.user.id}" && manga = "${manga.id}"`);
				isFavorited = true;
			} catch (err) {
				/* Not favorited */
			}

			const historyRecords = await pb.collection('read_history').getFullList({
				filter: `user = "${locals.user.id}" && manga = "${manga.id}"`,
				sort: 'created',
				expand: 'chapter'
			});

			readChapterIds = new Set(historyRecords.map((r) => r.chapter));

			if (historyRecords.length > 0) {
				const lastRecord = historyRecords[historyRecords.length - 1];
				if (lastRecord.expand && lastRecord.expand.chapter) {
					lastReadChapter = lastRecord.expand.chapter;
				}
			}
		}

		return {
			user: locals.user || null,
			manga,
			isFavorited,
			chaptersResult,
			readChapterIds,
			lastReadChapter
		};
	} catch (err: any) {
		// If the error status is 404, it means the manga was not found.
		// We then throw a SvelteKit 404 error to show a proper "Not Found" page.
		if (err.status === 404) {
			throw error(404, 'المانجا المطلوبة غير موجودة');
		}
		// For any other errors, log them and show a generic server error page.
		console.error('Failed to load manga page:', err);
		throw error(500, 'حدث خطأ في الخادم أثناء تحميل صفحة المانجا.');
	}
};

export const actions: Actions = {
	favorite: async ({ locals, params }) => {
		if (!locals.user) throw redirect(303, '/login');
		const manga = await pb.collection('mangas').getFirstListItem(`slug = "${params.slug}"`);
		await pb.collection('favorites').create({ user: locals.user.id, manga: manga.id });
	},
	unfavorite: async ({ locals, params }) => {
		if (!locals.user) throw redirect(303, '/login');
		const manga = await pb.collection('mangas').getFirstListItem(`slug = "${params.slug}"`);
		const record = await pb
			.collection('favorites')
			.getFirstListItem(`user = "${locals.user.id}" && manga = "${manga.id}"`);
		await pb.collection('favorites').delete(record.id);
	}
};