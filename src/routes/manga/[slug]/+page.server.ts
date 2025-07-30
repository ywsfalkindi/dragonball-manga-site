import { pb } from '$lib/pocketbase';
import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params, url }) => {
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
			await pb.collection('favorites').getFirstListItem(`user = "${locals.user.id}" && manga = "${manga.id}"`);
			isFavorited = true;
		} catch (err) { /* Not favorited */ }

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
        const record = await pb.collection('favorites').getFirstListItem(`user = "${locals.user.id}" && manga = "${manga.id}"`);
        await pb.collection('favorites').delete(record.id);
    }
};