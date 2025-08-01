// src/routes/profile/+page.server.ts
import { pb } from '$lib/pocketbase';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');

	const [favorites, readHistory, userDragonBalls] = await Promise.all([
		pb.collection('favorites').getFullList({
			filter: `user.id = "${locals.user.id}"`,
			expand: 'manga'
		}),
		pb.collection('read_history').getFullList({
			filter: `user.id = "${locals.user.id}"`,
			fields: 'id'
		}),
		pb.collection('user_dragonballs').getFirstListItem(`user.id = "${locals.user.id}"`).catch(() => null)
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

	return { 
        user: locals.user, 
        favorites, 
        stats, 
        collectedBalls: userDragonBalls?.collected_balls || [] 
    };
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
	},
    summonShenron: async ({ locals }) => {
        if (!locals.user) throw redirect(303, '/login');

        const userBallsRecord = await pb.collection('user_dragonballs').getFirstListItem(`user.id = "${locals.user.id}"`);
        const collected: number[] = userBallsRecord.collected_balls || [];

        if (collected.length < 7) {
            return fail(400, { error: 'يجب جمع الكرات السبع أولاً.' });
        }

        await pb.collection('users').update(locals.user.id, {
            'title': 'محارب Z' 
        });

        await pb.collection('user_dragonballs').update(userBallsRecord.id, {
            collected_balls: []
        });

        return { shenronWished: true, message: 'تهانينا! لقد حصلت على لقب "محارب Z"!' };
    }
};