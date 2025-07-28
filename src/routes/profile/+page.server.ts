import { pb } from '$lib/pocketbase';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(303, '/login');

    const favorites = await pb.collection('favorites').getFullList({
        filter: `user = "${locals.user.id}"`,
        expand: 'manga' // لجلب بيانات المانجا كاملة
    });

    favorites.forEach(fav => {
    // نتأكد أولاً من وجود expand، ثم نتأكد من وجود manga بداخلها
    if (fav.expand && fav.expand.manga) {
        fav.expand.manga.cover_image_url = pb.getFileUrl(fav.expand.manga, fav.expand.manga.cover_image);
    }
});

    return { favorites };
};

export const actions: Actions = {
    logout: async ({ cookies }) => {
        cookies.set('pb_auth', '', { path: '/', expires: new Date(0) });
        throw redirect(303, '/');
    }
};