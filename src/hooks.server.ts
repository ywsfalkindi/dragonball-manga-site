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
			event.locals.user = user.record;
			if (user.record?.isAdmin) {
				event.locals.admin = true;
			}

            // --- بداية منطق كرة التنين ---
            // فرصة 2% لظهور الكرة في أي صفحة
            if (Math.random() < 0.02 && event.locals.user) { 
                let userBallsRecord;
                try {
                    // 1. جلب الكرات التي جمعها المستخدم
                    userBallsRecord = await pb.collection('user_dragonballs').getFirstListItem(`user.id = "${event.locals.user.id}"`);
                } catch (err: any) {
                    if (err.status === 404) {
                        // إنشاء سجل جديد إذا لم يكن موجودًا
                        userBallsRecord = await pb.collection('user_dragonballs').create({ user: event.locals.user.id, collected_balls: [] });
                    }
                }
                
                if (userBallsRecord) { 
                    const collected: number[] = userBallsRecord.collected_balls || [];
                    
                    // 2. التحقق من أن المستخدم لم يجمع السبع كرات
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