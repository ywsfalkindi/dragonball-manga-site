import { pb } from '$lib/pocketbase';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');

	const [favorites, readHistory] = await Promise.all([
		pb.collection('favorites').getFullList({
			filter: `user.id = "${locals.user.id}"`,
			expand: 'manga'
		}),
		pb.collection('read_history').getFullList({
			filter: `user.id = "${locals.user.id}"`,
			fields: 'id'
		})
	]);

	favorites.forEach((fav) => {
		if (fav.expand && fav.expand.manga) {
			fav.expand.manga.cover_image_url = pb.files.getURL(
				fav.expand.manga,
				fav.expand.manga.cover_image
			);
		}
	});

	const stats = {
		totalFavorites: favorites.length,
		totalChaptersRead: readHistory.length
	};

	return { user: locals.user, favorites, stats };
};

export const actions: Actions = {
	logout: ({ cookies, locals }) => {
		pb.authStore.clear();
		locals.user = null;
        locals.admin = false;

		cookies.set('pb_auth', '', {
			path: '/',
			expires: new Date(0)
		});

		throw redirect(303, '/');
	}
};