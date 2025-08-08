// src/routes/quizzes/leaderboard/[slug]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const quiz = await pb
			.collection('quizzes')
			.getFirstListItem(`slug = "${params.slug}" && published = true`);

		// --- بداية الإصلاح: فلترة النتائج لعرض أفضل محاولة فقط ---

		// 1. جلب كل المحاولات مرتبة حسب النتيجة
		const allAttempts = await pb.collection('quiz_attempts').getFullList({
			filter: `quiz = "${quiz.id}"`,
			sort: '-score, +time_taken',
			expand: 'user'
		});

		// 2. استخدام Map لضمان وجود كل مستخدم مرة واحدة فقط بأفضل نتيجة
		const bestAttempts = new Map();
		for (const attempt of allAttempts) {
			const userId = attempt.expand?.user?.id || 'anonymous';
			// بما أن المحاولات مرتبة بالفعل من الأعلى للأقل، فإن أول محاولة نجدها لأي مستخدم هي الأفضل
			if (!bestAttempts.has(userId)) {
				bestAttempts.set(userId, attempt);
			}
		}

		// 3. تحويل الـ Map مرة أخرى إلى مصفوفة وأخذ أفضل 10
		const leaderboardEntries = Array.from(bestAttempts.values()).slice(0, 10);

		// --- نهاية الإصلاح ---

		return {
			quiz,
			leaderboard: leaderboardEntries
		};
	} catch (err) {
		console.error('Leaderboard page error:', err);
		throw error(404, 'لم يتم العثور على لوحة الصدارة لهذا الاختبار.');
	}
};