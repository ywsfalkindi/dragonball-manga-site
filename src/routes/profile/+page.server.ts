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

// --- ✨ بداية الكود النهائي لمنطق شينرون ✨ ---

// قائمة الأمنيات المتاحة
const allWishes = [
	{ id: 'title_z_warrior', text: 'أريد لقب "محارب Z" الأسطوري!', action: { type: 'update_user', payload: { title: 'محارب Z' } } },
	{ id: 'title_super_saiyan', text: 'أريد الوصول إلى قوة "السوبر سايان"!', action: { type: 'update_user', payload: { title: 'سوبر سايان' } } },
	{ id: 'title_god_of_destruction', text: 'أريد الحصول على هيبة "حاكم دمار"!', action: { type: 'update_user', payload: { title: 'حاكم دمار' } } },
	{ id: 'cosmetic_gold_name', text: 'أريد أن يظهر اسمي باللون الذهبي!', action: { type: 'update_user', payload: { cosmetic_name_color: '#FFD700' } } },
	{ id: 'xp_boost', text: 'أتمنى الحصول على دفعة من نقاط الخبرة!', action: { type: 'update_user', payload: { 'xp+': 1000 } } }
];

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

	// 1. الإجراء الأول: استدعاء التنين وعرض الأمنيات
	summonShenron: async ({ locals }) => {
		if (!locals.user) throw redirect(303, '/login');

		const userBallsRecord = await pb
			.collection('user_dragonballs')
			.getFirstListItem(`user.id = "${locals.user.id}"`);

		if ((userBallsRecord.collected_balls || []).length < 7) {
			return fail(400, { error: 'يجب جمع الكرات السبع أولاً.' });
		}

		// اختيار 3 أمنيات عشوائية من القائمة
		const shuffled = allWishes.sort(() => 0.5 - Math.random());
		const selectedWishes = shuffled.slice(0, 3);

		return { wishes: selectedWishes };
	},

	// 2. الإجراء الثاني: تحقيق الأمنية المختارة
	grantWish: async ({ locals, request }) => {
		if (!locals.user) throw redirect(303, '/login');

		const formData = await request.formData();
		const wishId = formData.get('wishId') as string;

		const selectedWish = allWishes.find((w) => w.id === wishId);

		if (!selectedWish) {
			return fail(400, { error: 'هذه الأمنية غير صالحة.' });
		}

		const userBallsRecord = await pb
			.collection('user_dragonballs')
			.getFirstListItem(`user.id = "${locals.user.id}"`);

		// تطبيق تأثير الأمنية
		if (selectedWish.action.type === 'update_user') {
			await pb.collection('users').update(locals.user.id, selectedWish.action.payload);
		}

		// إعادة تعيين كرات التنين
		await pb.collection('user_dragonballs').update(userBallsRecord.id, {
			collected_balls: []
		});

		return { shenronWished: true, message: `تهانينا! لقد تحققت أمنيتك: "${selectedWish.text}"` };
	}
};

// --- ✨ نهاية الكود النهائي لمنطق شينرون ✨ ---