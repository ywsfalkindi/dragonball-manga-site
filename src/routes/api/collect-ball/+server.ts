// src/routes/api/collect-ball/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';
import { DRAGON_BALL_SECRET } from '$env/static/private';

async function createFindToken(userId: string, ballNumber: number): Promise<string> {
    const data = new TextEncoder().encode(`${userId}-${ballNumber}-${DRAGON_BALL_SECRET}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'يجب تسجيل الدخول أولاً.');
    }

    const formData = await request.formData();
    const ballNumber = Number(formData.get('ball_number'));
    const receivedToken = formData.get('find_token') as string;

    const expectedToken = await createFindToken(locals.user.id, ballNumber);
    if (receivedToken !== expectedToken) {
        throw error(400, 'محاولة غير صالحة. التوكن غير متطابق.');
    }

    try {
        let userBallsRecord;
        try {
            userBallsRecord = await pb.collection('user_dragonballs').getFirstListItem(`user.id = "${locals.user.id}"`);
        } catch (err: any) {
            if (err.status === 404) {
                userBallsRecord = await pb.collection('user_dragonballs').create({ 
                    user: locals.user.id, 
                    collected_balls: [] 
                });
            } else {
                throw err;
            }
        }

        const collected: number[] = userBallsRecord.collected_balls || [];

        if (collected.includes(ballNumber)) {
            return json({ success: true });
        }

        const updatedBalls = [...collected, ballNumber].sort((a, b) => a - b);
        await pb.collection('user_dragonballs').update(userBallsRecord.id, {
            collected_balls: updatedBalls
        });

        return json({ success: true, newBall: ballNumber });
    } catch (err) {
        console.error("API Error:", err);
        throw error(500, 'حدث خطأ أثناء حفظ الكرة في قاعدة البيانات.');
    }
};