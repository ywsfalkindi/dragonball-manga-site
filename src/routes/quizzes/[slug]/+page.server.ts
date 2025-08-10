// src/routes/quizzes/[slug]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { grantXp } from '../../../hooks.server';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) throw redirect(303, '/login?redirect=/quizzes/' + params.slug);

	try {
		const quiz = await pb
			.collection('quizzes')
			.getFirstListItem(`slug = "${params.slug}" && published = true`, {
				expand: 'questions'
			});

		const questions = quiz.expand?.questions || [];

		questions.sort(() => Math.random() - 0.5);

		// ✨ إصلاح: إضافة النوع الصريح للمتغير 'q'
		questions.forEach((q: any) => {
			if (q.image) {
				q.imageUrl = pb.files.getURL(q, q.image);
			}
		});

		delete quiz.expand;

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
			const quiz = await pb.collection('quizzes').getFirstListItem(`slug = "${params.slug}"`, {
				expand: 'questions'
			});
			const correctQuestions = quiz.expand?.questions || [];

			// ✨ إصلاح: إضافة النوع الصريح للمتغير 'q'
			const correctAnswersMap = new Map(correctQuestions.map((q: any) => [q.id, q.correct_option]));
			let score = 0;
			const answerRecords = [];

			let streakCounter = 0;
			const timeLimit = quiz.time_limit || correctQuestions.length * 15;

			for (const userAnswer of userAnswers) {
				const correctAnswer = correctAnswersMap.get(userAnswer.questionId);
				if (correctAnswer !== undefined) {
					const isCorrect = correctAnswer === userAnswer.selectedOption;
					if (isCorrect) {
						streakCounter++;
						let questionScore = 100;

						const timePerQuestion = timeLimit / correctQuestions.length;
						const timeBonus = Math.max(
							0,
							Math.round(timePerQuestion - timeTaken / correctQuestions.length)
						);
						questionScore += timeBonus;

						const streakBonus = streakCounter * 10;
						questionScore += streakBonus;

						score += questionScore;
					} else {
						streakCounter = 0;
					}
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

			for (const record of answerRecords) {
				await pb.collection('quiz_user_answers').create({
					...record,
					attempt: attemptRecord.id,
					user: locals.user.id
				});
			}

			let totalXpGained = 50;
			totalXpGained += Math.floor(score / 20);
			await grantXp(locals.user.id, totalXpGained);

			return { success: true, attemptId: attemptRecord.id };
		} catch (err) {
			console.error('Quiz submission REAL error:', err);
			return fail(500, { error: 'حدث خطأ أثناء إرسال إجاباتك. حاول مرة أخرى.' });
		}
	}
};
