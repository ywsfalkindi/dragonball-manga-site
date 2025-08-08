// src/routes/quizzes/[slug]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) throw redirect(303, '/login?redirect=/quizzes/' + params.slug);

	try {
		const quiz = await pb.collection('quizzes').getFirstListItem(`slug = "${params.slug}" && published = true`);
		
		// جلب الأسئلة بدون الإجابات الصحيحة للواجهة الأمامية
		const questions = await pb.collection('questions').getFullList({
			filter: `quiz.id = "${quiz.id}"`,
			sort: 'order',
			fields: 'id,text,option_1,option_2,option_3,option_4,order' // لا نرسل `correct_option`
		});

		return { quiz, questions };
	} catch (err) {
		throw error(404, 'هذا الاختبار غير موجود أو غير متاح.');
	}
};

export const actions: Actions = {
	submitQuiz: async ({ request, locals, params }) => {
		if (!locals.user) throw redirect(303, '/login');

		const formData = await request.formData();
		const userAnswers: { questionId: string; selectedOption: number }[] = JSON.parse(
			formData.get('answers') as string
		);

		let attemptRecordId: string; // ✨ 1. عرف متغيرًا هنا

		try {
			const quiz = await pb.collection('quizzes').getFirstListItem(`slug = "${params.slug}"`);
			const correctQuestions = await pb.collection('questions').getFullList({
				filter: `quiz.id = "${quiz.id}"`
			});

			let score = 0;
			const answerRecords = [];

			for (const userAnswer of userAnswers) {
				const question = correctQuestions.find((q) => q.id === userAnswer.questionId);
				if (question) {
					const isCorrect = question.correct_option === userAnswer.selectedOption;
					if (isCorrect) {
						score++;
					}
					answerRecords.push({
						question: question.id,
						selected_option: userAnswer.selectedOption,
						is_correct: isCorrect
					});
				}
			}

			const attemptRecord = await pb.collection('quiz_attempts').create({
				user: locals.user.id,
				quiz: quiz.id,
				score: score,
				total_questions: correctQuestions.length,
				completed_at: new Date().toISOString()
			});

			attemptRecordId = attemptRecord.id; // ✨ 2. احفظ الـ ID هنا

			for (const record of answerRecords) {
				await pb.collection('quiz_user_answers').create({
					...record,
					attempt: attemptRecord.id
				});
			}

            // ✨ 3. أزل أمر إعادة التوجيه من هنا
			
		} catch (err) {
			// الآن هذا الجزء سيلتقط الأخطاء الحقيقية فقط
			console.error('Quiz submission REAL error:', err);
			return fail(500, { error: 'حدث خطأ أثناء إرسال إجاباتك. حاول مرة أخرى.' });
		}

		// ✨ 4. ضع أمر إعادة التوجيه هنا، خارج الـ try...catch
		throw redirect(303, `/quizzes/result/${attemptRecordId}`);
	}
};