// src/hooks.server.ts

import { pb } from '$lib/pocketbase';
import type { Handle } from '@sveltejs/kit';
import { DRAGON_BALL_SECRET } from '$env/static/private';

async function createFindToken(userId: string, ballNumber: number): Promise<string> {
	const data = new TextEncoder().encode(`${userId}-${ballNumber}-${DRAGON_BALL_SECRET}`);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function grantXp(userId: string, amount: number) {
	if (!userId || amount <= 0) return;

	try {
		const user = await pb.collection('users').getOne(userId);

		const newXp = (user.xp || 0) + amount;
		let newLevel = user.power_level || 1;
		let xpToNext = user.xp_to_next_level || 100;

		// التحقق من رفع المستوى
		if (newXp >= xpToNext) {
			newLevel++;
			const remainingXp = newXp - xpToNext;
			xpToNext = newLevel * 100; // المعادلة

			// يمكنك هنا إضافة منطق إرسال إشعار للمستخدم بأنه رفع مستواه

			await pb.collection('users').update(userId, {
				xp: remainingXp, // إعادة تعيين نقاط الخبرة مع الاحتفاظ بالباقي
				power_level: newLevel,
				xp_to_next_level: xpToNext
			});
		} else {
			await pb.collection('users').update(userId, {
				'xp+': amount
			});
		}
	} catch (err) {
		console.error('Failed to grant XP:', err);
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	if (pb.authStore.isValid) {
		try {
			const user = await pb.collection('users').authRefresh();

			// ✨ التحسين: التحقق من حظر المستخدم ✨
			if (user.record?.banned) {
				pb.authStore.clear();
				event.locals.user = null;
				event.locals.admin = false;
				const response = await resolve(event);
				response.headers.set(
					'set-cookie',
					pb.authStore.exportToCookie({ httpOnly: true, secure: true, sameSite: 'lax' })
				);
				return response;
			}

			event.locals.user = user.record;
			if (user.record?.isAdmin) {
				event.locals.admin = true;
			}

			const lastLogin = new Date(user.record?.last_login_xp || 0);
			const now = new Date();
			const oneDay = 24 * 60 * 60 * 1000;

			if (now.getTime() - lastLogin.getTime() > oneDay) {
				await grantXp(user.record.id, 15); // 15 XP
				await pb.collection('users').update(user.record.id, { last_login_xp: now.toISOString() });
			}

			// --- بداية منطق كرة التنين ---
			if (Math.random() < 0.02 && event.locals.user) {
				let userBallsRecord;
				try {
					userBallsRecord = await pb
						.collection('user_dragonballs')
						.getFirstListItem(`user.id = "${event.locals.user.id}"`);
				} catch (err: any) {
					if (err.status === 404) {
						userBallsRecord = await pb
							.collection('user_dragonballs')
							.create({ user: event.locals.user.id, collected_balls: [] });
					}
				}

				if (userBallsRecord) {
					const collected: number[] = userBallsRecord.collected_balls || [];

					if (collected.length < 7) {
						const availableBalls = [1, 2, 3, 4, 5, 6, 7].filter((b) => !collected.includes(b));
						if (availableBalls.length > 0) {
							const ballToFind = availableBalls[Math.floor(Math.random() * availableBalls.length)];
							const findToken = await createFindToken(event.locals.user.id, ballToFind);

							event.locals.dragonBall = {
								ball_number: ballToFind,
								find_token: findToken
							};
						}
					}
				}
			}
			// --- نهاية منطق كرة التنين ---
		} catch (_) {
			pb.authStore.clear();
			event.locals.user = null;
			event.locals.admin = false;
		}
	}

	const response = await resolve(event);
	response.headers.set(
		'set-cookie',
		pb.authStore.exportToCookie({ httpOnly: true, secure: true, sameSite: 'lax' })
	);
	return response;
};

export { grantXp };
