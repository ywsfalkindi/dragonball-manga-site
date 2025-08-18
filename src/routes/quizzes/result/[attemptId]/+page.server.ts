// src/routes/quizzes/result/[attemptId]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login?redirect=/quizzes/result/' + params.attemptId);
	}

	try {
  console.log('Checkpoint 1: Fetching attempt record...');
  const attempt = await pb.collection('quiz_attempts').getOne(params.attemptId, {
    expand: 'user,quiz'
  });

  // --- بداية الإصلاح الأمني ---
  if (attempt.user !== locals.user.id) {
    throw error(403, 'غير مصرح لك بعرض هذه النتيجة.');
  }
  // --- نهاية الإصلاح الأمني ---

  console.log('Checkpoint 2: Fetching user answers...');
  const userAnswersRecords = await pb.collection('quiz_user_answers').getFullList({
    filter: `attempt = "${params.attemptId}"`, // تأكد من تطبيق الإصلاح هنا
  });

  console.log('Checkpoint 3: Mapping user answers...');
  const userAnswers = userAnswersRecords.map((a) => ({
    questionId: a.question,
    selectedOption: a.selected_option,
    isCorrect: a.is_correct
  }));

  console.log('Checkpoint 4: Fetching questions...');
  const quizId = attempt.expand?.quiz.id;
  if (!quizId) {
    throw new Error("Quiz ID is missing from attempt expand. The 'quiz' relation might be broken or missing.");
  }
  const questions = await pb.collection('questions').getFullList({
    filter: `quiz = "${quizId}"` // تأكد من تطبيق الإصلاح السابق هنا
  });

  console.log('Checkpoint 5: All data fetched successfully.');
  const correctAnswersMap = new Map(questions.map((q) => [q.id, q.correct_option]));

  return { attempt, userAnswers, correctAnswersMap, questions };

} catch (err: any) {
  console.error('DETAILED ERROR:', JSON.stringify(err, null, 2));
  if (err.status === 403) {
    throw err; 
  }
  throw error(404, 'لم يتم العثور على هذه المحاولة أو حدث خطأ ما.');
}
};
