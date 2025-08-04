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
				response.headers.set('set-cookie', pb.authStore.exportToCookie({ httpOnly: true, secure: true, sameSite: 'lax' }));
				return response;
			}

			event.locals.user = user.record;
			if (user.record?.isAdmin) {
				event.locals.admin = true;
			}

            // --- بداية منطق كرة التنين ---
            if (Math.random() < 0.02 && event.locals.user) {
                let userBallsRecord;
                try {
                    userBallsRecord = await pb.collection('user_dragonballs').getFirstListItem(`user.id = "${event.locals.user.id}"`);
                } catch (err: any) {
                    if (err.status === 404) {
                        userBallsRecord = await pb.collection('user_dragonballs').create({ user: event.locals.user.id, collected_balls: [] });
                    }
                }

                if (userBallsRecord) {
                    const collected: number[] = userBallsRecord.collected_balls || [];

                    if (collected.length < 7) {
                        const availableBalls = [1, 2, 3, 4, 5, 6, 7].filter(b => !collected.includes(b));
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
	response.headers.set('set-cookie', pb.authStore.exportToCookie({ httpOnly: true, secure: true, sameSite: 'lax' }));
	return response;
};