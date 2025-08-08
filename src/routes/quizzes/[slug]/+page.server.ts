// src/routes/quizzes/[slug]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) throw redirect(303, '/login?redirect=/quizzes/' + params.slug);

	try {
		const quiz = await pb
			.collection('quizzes')
			.getFirstListItem(`slug = "${params.slug}" && published = true`, {
				fields: 'id,collectionId,title,slug,time_limit'
			});

		const questions = await pb.collection('questions').getFullList({
			filter: `quiz.id = "${quiz.id}"`,
			sort: '@random',
			fields: 'id,text,option_1,option_2,option_3,option_4,order,image'
		});

		questions.forEach((q) => {
			if (q.image) {
				q.imageUrl = pb.files.getURL(q, q.image);
			}
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
		const timeTaken = parseInt(formData.get('time_taken') as string, 10);

		try {
			const quiz = await pb.collection('quizzes').getFirstListItem(`slug = "${params.slug}"`);
			const correctQuestions = await pb.collection('questions').getFullList({
				filter: `quiz.id = "${quiz.id}"`,
				fields: 'id,correct_option'
			});

			const correctAnswersMap = new Map(correctQuestions.map((q) => [q.id, q.correct_option]));
			let score = 0;
			const answerRecords = [];

			for (const userAnswer of userAnswers) {
				const correctAnswer = correctAnswersMap.get(userAnswer.questionId);
				if (correctAnswer !== undefined) {
					const isCorrect = correctAnswer === userAnswer.selectedOption;
					if (isCorrect) score++;
					answerRecords.push({
						question: userAnswer.questionId,
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
				completed_at: new Date().toISOString(),
				time_taken: isNaN(timeTaken) ? null : timeTaken
			});

			// --- بداية الإصلاح: استخدام حلقة متسلسلة بدلاً من متزامنة ---
			for (const record of answerRecords) {
				await pb.collection('quiz_user_answers').create({
					...record,
					attempt: attemptRecord.id,
					user: locals.user.id
				});
			}
			// --- نهاية الإصلاح ---

			return { success: true, attemptId: attemptRecord.id };
		} catch (err) {
			console.error('Quiz submission REAL error:', err);
			return fail(500, { error: 'حدث خطأ أثناء إرسال إجاباتك. حاول مرة أخرى.' });
		}
	}
};