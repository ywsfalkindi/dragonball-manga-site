// src/routes/quizzes/result/[attemptId]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login?redirect=/quizzes/result/' + params.attemptId);
	}

	try {
		const attempt = await pb.collection('quiz_attempts').getOne(params.attemptId, {
			expand: 'user,quiz'
		});

		// --- بداية الإصلاح الأمني ---
		// تحقق مما إذا كان المستخدم الحالي هو صاحب هذه المحاولة
		if (attempt.user !== locals.user.id) {
			// إذا لم يكن كذلك، امنعه من الوصول
			throw error(403, 'غير مصرح لك بعرض هذه النتيجة.');
		}
		// --- نهاية الإصلاح الأمني ---

		const userAnswersRecords = await pb.collection('quiz_user_answers').getFullList({
			filter: `attempt.id = "${params.attemptId}"`,
			expand: 'question'
		});

		const userAnswers = userAnswersRecords.map((a) => ({
			questionId: a.question,
			selectedOption: a.selected_option,
			isCorrect: a.is_correct
		}));

		const quizId = attempt.expand?.quiz.id;
		const questions = await pb.collection('questions').getFullList({
			filter: `quiz.id = "${quizId}"`
		});

		const correctAnswersMap = new Map(questions.map((q) => [q.id, q.correct_option]));

		return { attempt, userAnswers, correctAnswersMap, questions };
	} catch (err: any) {
		// التعامل مع الأخطاء بشكل أفضل
		if (err.status === 403) {
			throw err; // أعد إرسال خطأ "غير مصرح به"
		}
		console.error('Result page error:', err);
		throw error(404, 'لم يتم العثور على هذه المحاولة أو حدث خطأ ما.');
	}
};
