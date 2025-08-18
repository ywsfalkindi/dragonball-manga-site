// src/routes/quizzes/[slug]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { grantXp } from '../../../hooks.server';

export const load: PageServerLoad = async ({ params, locals, cookies }) => {
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

		cookies.set(`quiz_start_time_${quiz.id}`, Date.now().toString(), {
			path: `/quizzes/${params.slug}`,
			httpOnly: true, // مهم للأمان
			maxAge: 60 * 60 // صلاحية لمدة ساعة
		});

		return { quiz, questions };
	} catch (err) {
		throw error(404, 'هذا الاختبار غير موجود أو غير متاح.');
	}
};

export const actions: Actions = {
	submitQuiz: async ({ request, locals, params, cookies }) => {
		if (!locals.user) throw redirect(303, '/login');

		const formData = await request.formData();
		const userAnswers: { questionId: string; selectedOption: number }[] = JSON.parse(
			formData.get('answers') as string
		);
		// const timeTaken = parseInt(formData.get('time_taken') as string, 10); // <-- سنحذف هذا السطر أو نجعله تعليقًا

		// --- بداية التعديل: حساب الوقت من الخادم ---
		const quizId = (
			await pb.collection('quizzes').getFirstListItem(`slug = "${params.slug}"`, { fields: 'id' })
		).id;
		const startTimeCookie = cookies.get(`quiz_start_time_${quizId}`);
		const startTime = startTimeCookie ? parseInt(startTimeCookie, 10) : 0;

		let timeTaken = 0;
		if (startTime > 0) {
			timeTaken = Math.round((Date.now() - startTime) / 1000);
			// حذف الكوكي بعد استخدامه
			cookies.delete(`quiz_start_time_${quizId}`, { path: `/quizzes/${params.slug}` });
		}
		// --- نهاية التعديل ---

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

			const previousAttempts = await pb.collection('quiz_attempts').getList(1, 1, {
				filter: `user.id = "${locals.user.id}" && quiz.id = "${quiz.id}"`
			});

			let totalXpGained = 0;

			// إذا كان عدد المحاولات الكلي يساوي 1 (أي هذه هي المحاولة الأولى التي يتم تسجيلها)
			if (previousAttempts.totalItems <= 1) {
				totalXpGained += 50; // امنح النقاط الأساسية للمحاولة الأولى
				totalXpGained += Math.floor(score / 20); // امنح نقاط النتيجة للمحاولة الأولى فقط
			}

			// --- بداية التعديل: لا تمنح نقاطًا إذا كانت القيمة صفرًا ---
			if (totalXpGained > 0) {
				await grantXp(locals.user.id, totalXpGained);
			}
			// --- نهاية التعديل ---

			return { success: true, attemptId: attemptRecord.id };
		} catch (err) {
			console.error('Quiz submission REAL error:', err);
			return fail(500, { error: 'حدث خطأ أثناء إرسال إجاباتك. حاول مرة أخرى.' });
		}
	}
};
