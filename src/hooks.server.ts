// src/hooks.server.ts

import { pb } from '$lib/pocketbase';
import type { Handle } from '@sveltejs/kit';
import { DRAGON_BALL_SECRET } from '$env/static/private';

// =================================================================
// ✨ Helper Functions (No changes needed here) ✨
// الدوال المساعدة تبقى كما هي
// =================================================================

async function createFindToken(userId: string, ballNumber: number): Promise<string> {
	const data = new TextEncoder().encode(`${userId}-${ballNumber}-${DRAGON_BALL_SECRET}`);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function grantXp(userId: string, amount: number) {
	if (!userId || amount <= 0) return;

	try {
		const user = await pb.collection('users').getOne(userId);
		const newXp = (user.xp || 0) + amount;
		let newLevel = user.power_level || 1;
		let xpToNext = user.xp_to_next_level || 100;

		if (newXp >= xpToNext) {
			newLevel++;
			const remainingXp = newXp - xpToNext;
			xpToNext = newLevel * 100;
			await pb.collection('users').update(userId, {
				xp: remainingXp,
				power_level: newLevel,
				xp_to_next_level: xpToNext
			});
		} else {
			await pb.collection('users').update(userId, { 'xp+': amount });
		}
	} catch (err) {
		console.error('Failed to grant XP:', err);
	}
}

// =================================================================
// ✨ The Main Handle Function (Restructured for Stability) ✨
// دالة handle الرئيسية - أعيد تنظيمها لضمان الاستقرار
// =================================================================

export const handle: Handle = async ({ event, resolve }) => {
	// 1. تحميل حالة المصادقة من الكوكيز أولاً
	pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	// 2. محاولة تحديث التوكن إذا كان صالحاً
	if (pb.authStore.isValid) {
		try {
			await pb.collection('users').authRefresh();

			// التحقق من الحظر: إذا كان المستخدم محظوراً، امسح المصادقة
			if (pb.authStore.model?.banned) {
				pb.authStore.clear();
			}
		} catch (_) {
			// إذا فشل التحديث، امسح المصادقة
			pb.authStore.clear();
		}
	}

	// 3. تعيين locals بناءً على حالة المصادقة النهائية
	if (pb.authStore.isValid && pb.authStore.model) {
		// استخدام structuredClone لنسخة آمنة من بيانات المستخدم
		event.locals.user = structuredClone(pb.authStore.model);
		event.locals.admin = event.locals.user.isAdmin || false;

		// --- كل منطق المستخدم المسجل دخوله يأتي هنا ---
		const user = event.locals.user;
		const now = new Date();
		const lastLogin = new Date(user.last_login_xp || 0);
		const oneDay = 24 * 60 * 60 * 1000;

		// منطق منح الخبرة اليومية
		if (now.getTime() - lastLogin.getTime() > oneDay) {
			await grantXp(user.id, 15);
			await pb.collection('users').update(user.id, { last_login_xp: now.toISOString() });
		}

		// منطق كرة التنين
		if (Math.random() < 0.02) {
			let userBallsRecord;
			try {
				userBallsRecord = await pb
					.collection('user_dragonballs')
					.getFirstListItem(`user.id = "${user.id}"`);
			} catch (err: any) {
				if (err.status === 404) {
					userBallsRecord = await pb
						.collection('user_dragonballs')
						.create({ user: user.id, collected_balls: [] });
				}
			}
			if (userBallsRecord) {
				const collected: number[] = userBallsRecord.collected_balls || [];
				if (collected.length < 7) {
					const availableBalls = [1, 2, 3, 4, 5, 6, 7].filter((b) => !collected.includes(b));
					if (availableBalls.length > 0) {
						const ballToFind = availableBalls[Math.floor(Math.random() * availableBalls.length)];
						event.locals.dragonBall = {
							ball_number: ballToFind,
							find_token: await createFindToken(user.id, ballToFind)
						};
					}
				}
			}
		}
	} else {
		// إذا لم يكن المستخدم مسجل دخوله، تأكد من أن locals فارغة
		event.locals.user = null;
		event.locals.admin = false;
	}

	// 4. تنفيذ الطلب (load أو action)
	const response = await resolve(event);

	// 5. تحديث الكوكيز في النهاية دائماً
	response.headers.set(
		'set-cookie',
		pb.authStore.exportToCookie({
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax'
		})
	);

	return response;
};
