import { pb } from '$lib/pocketbase';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');

	const favorites = await pb.collection('favorites').getFullList({
		filter: `user.id = "${locals.user.id}"`,
		expand: 'manga'
	});

	favorites.forEach((fav) => {
		if (fav.expand && fav.expand.manga) {
			fav.expand.manga.cover_image_url = pb.files.getURL(
				fav.expand.manga,
				fav.expand.manga.cover_image
			);
		}
	});

	return { favorites };
};

export const actions: Actions = {
	logout: ({ cookies, locals }) => {
		// 1. مسح تذكرة الدخول من ذاكرة الخادم
		pb.authStore.clear();
		locals.user = null;
        locals.admin = false;

		// 2. مسح تذكرة الدخول من المتصفح
		cookies.set('pb_auth', '', {
			path: '/',
			expires: new Date(0)
		});

		// 3. إعادة التوجيه للصفحة الرئيسية
		throw redirect(303, '/');
	}
};