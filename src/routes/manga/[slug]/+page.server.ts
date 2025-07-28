import { pb } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const manga = await pb.collection('mangas').getFirstListItem(`slug = "${params.slug}"`);
	manga.cover_image_url = pb.getFileUrl(manga, manga.cover_image);

	const chapters = await pb.collection('chapters').getFullList({
		filter: `manga = "${manga.id}"`,
		sort: 'chapter_number'
	});

    let isFavorited = false;
    if (locals.user) {
        try {
            const favoriteRecord = await pb.collection('favorites').getFirstListItem(`user = "${locals.user.id}" && manga = "${manga.id}"`);
            isFavorited = !!favoriteRecord;
        } catch (err) {
            // Not favorited, do nothing
        }
    }

	return { manga, chapters, isFavorited };
};

// ... (ضع هذا الكود تحت دالة load في نفس الملف)
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    favorite: async ({ locals, params }) => {
        if (!locals.user) throw redirect(303, '/login');

        const manga = await pb.collection('mangas').getFirstListItem(`slug = "${params.slug}"`);
        await pb.collection('favorites').create({
            user: locals.user.id,
            manga: manga.id,
        });
    },
    unfavorite: async ({ locals, params }) => {
        if (!locals.user) throw redirect(303, '/login');

        const manga = await pb.collection('mangas').getFirstListItem(`slug = "${params.slug}"`);
        const record = await pb.collection('favorites').getFirstListItem(`user = "${locals.user.id}" && manga = "${manga.id}"`);
        await pb.collection('favorites').delete(record.id);
    }
};