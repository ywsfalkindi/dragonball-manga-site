import { pb } from '$lib/pocketbase';
import type { Handle, HandleServerError } from '@sveltejs/kit'; // تم استيراد HandleServerError
import { DRAGON_BALL_SECRET } from '$env/static/private';

// =================================================================
// ✨ Helper Functions (No changes needed here) ✨
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
			await pb.collection('users').update(userId, { xp: newXp });
		}
	} catch (err) {
		console.error('Error granting XP:', err);
	}
}

// =================================================================
// ✨ Main Handle Function (No changes needed here) ✨
// =================================================================
export const handle: Handle = async ({ event, resolve }) => {
	pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	if (pb.authStore.isValid) {
		try {
			await pb.collection('users').authRefresh();
			event.locals.user = structuredClone(pb.authStore.model);
		} catch (_) {
			pb.authStore.clear();
			event.locals.user = null;
		}
	}

	const user = event.locals.user;

	if (user) {
		const now = new Date();
		const lastLogin = new Date(user.last_login_xp || 0);
		const oneDay = 24 * 60 * 60 * 1000;

		if (now.getTime() - lastLogin.getTime() > oneDay) {
			await grantXp(user.id, 15);
			await pb.collection('users').update(user.id, { last_login_xp: now.toISOString() });
		}

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
		event.locals.user = null;
	}

	const response = await resolve(event);
	response.headers.set('set-cookie', pb.authStore.exportToCookie({ httpOnly: true, secure: true }));
	return response;
};

// ======================= الاضافة تبدأ هنا =======================
/** @type {import('@sveltejs/kit').HandleServerError} */
export const handleError: HandleServerError = async ({ error, event }) => {
	// تسجيل الخطأ الكامل في الخادم (يمكنك استخدام خدمة متخصصة مثل Sentry)
	console.error('An unexpected error occurred:', error);

	// إرسال بيانات مبسطة وغير حساسة إلى المستخدم
	return {
		message: 'حدث خطأ غير متوقع في الخادم، الرجاء المحاولة مرة أخرى.',
		code: 'UNEXPECTED_ERROR'
	};
};
// ======================= الاضافة تنتهي هنا =======================