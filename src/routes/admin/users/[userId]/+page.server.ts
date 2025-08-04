// src/routes/admin/users/[userId]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const user = await pb.collection('users').getOne(params.userId);

		// جلب بيانات مرتبطة بالمستخدم
		const [favorites, readHistory, comments, userDragonBalls] = await Promise.all([
			pb
				.collection('favorites')
				.getFullList({
					filter: `user.id = "${params.userId}"`,
					expand: 'manga',
					sort: '-created'
				}),
			pb.collection('read_history').getList(1, 10, {
				filter: `user.id = "${params.userId}"`,
				sort: '-created',
				expand: 'chapter,manga'
			}),
			// جلب آخر 10 تعليقات للمستخدم
			pb.collection('comments').getList(1, 10, {
				filter: `user.id = "${params.userId}"`,
				sort: '-created',
				expand: 'chapter'
			}),
			pb.collection('user_dragonballs').getFirstListItem(`user.id = "${params.userId}"`).catch(() => null)
		]);

		return {
			userDetails: user,
			stats: {
				totalFavorites: favorites.length,
				totalComments: comments.totalItems, // استخدام العدد الإجمالي من الاستجابة
				totalChaptersRead: readHistory.totalItems
			},
			favorites,
			latestReadHistory: readHistory.items,
			latestComments: comments.items, // إضافة التعليقات
			collectedBalls: userDragonBalls?.collected_balls || []
		};
	} catch (err) {
		throw error(404, 'المستخدم غير موجود');
	}
};

export const actions: Actions = {
	updateUser: async ({ request, params }) => {
		const formData = await request.formData();
		const username = formData.get('username') as string;
		const title = formData.get('title') as string;

		try {
			await pb.collection('users').update(params.userId, { username, title });
		} catch (err: any) {
			return fail(400, {
				updateError: 'فشل تحديث المستخدم. قد يكون اسم المستخدم محجوزًا.'
			});
		}
		return { updateSuccess: 'تم تحديث بيانات المستخدم بنجاح.' };
	},

	requestPasswordReset: async ({ params }) => {
		try {
			const user = await pb.collection('users').getOne(params.userId);
			await pb.collection('users').requestPasswordReset(user.email);
		} catch (err) {
			return fail(500, {
				resetError: 'فشل إرسال بريد إعادة تعيين كلمة المرور.'
			});
		}
		return { resetSuccess: 'تم إرسال رابط إعادة التعيين إلى بريد المستخدم.' };
	}
};