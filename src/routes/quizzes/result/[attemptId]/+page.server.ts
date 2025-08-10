// src/routes/quizzes/result/[attemptId]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const attempt = await pb.collection('quiz_attempts').getOne(params.attemptId, {
			expand: 'quiz,user'
		});

		// جلب إجابات المستخدم لمقارنتها وعرضها في قسم المراجعة
		const userAnswers = await pb.collection('quiz_user_answers').getFullList({
			filter: `attempt.id = "${params.attemptId}"`,
			sort: 'created',
			// ✨ التحسين: خاصية expand هنا تقوم بجلب كل بيانات السؤال تلقائيًا،
			// بما في ذلك حقل "explanation" الجديد الذي أضفته في الخطوات السابقة.
			// لذلك، لا حاجة لإجراء تعديلات منطقية هنا.
			expand: 'question'
		});

		return {
			attempt,
			userAnswers
		};
	} catch (err) {
		console.error('Result page error:', err);
		throw error(404, 'لم يتم العثور على نتيجة هذا الاختبار.');
	}
};
