// src/routes/admin/quizzes/[quizId]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.admin) throw redirect(303, '/');
	const quizId = params.quizId;

	try {
		const quiz = await pb.collection('quizzes').getOne(quizId);
		if (quiz.cover_image) {
			quiz.cover_image_url = pb.files.getURL(quiz, quiz.cover_image);
		}

		const questions = await pb.collection('questions').getFullList({
			filter: `quiz.id = "${quizId}"`,
			sort: 'order'
		});

		return { quiz, questions };
	} catch (err) {
		throw error(404, 'الاختبار غير موجود.');
	}
};

export const actions: Actions = {
	updateQuizDetails: async ({ locals, request, params }) => {
		if (!locals.admin) throw redirect(303, '/');
		const formData = await request.formData();
		
		// --- بداية الإصلاح ---
		// 1. إنشاء كائن بيانات نظيف بدلاً من تمرير formData مباشرة
		const dataToUpdate: { [key: string]: any } = {
			title: formData.get('title'),
			slug: formData.get('slug'),
			description: formData.get('description'),
			published: formData.get('published') === 'true'
		};

		// 2. معالجة مدة الاختبار بشكل دقيق
		const timeLimitRaw = formData.get('time_limit') as string;
		const timeLimit = parseInt(timeLimitRaw, 10);
		
		// إذا كان الإدخال فارغاً أو غير رقمي، قم بتعيينه إلى null (بلا وقت)
		// وإلا، استخدم القيمة الرقمية
		dataToUpdate.time_limit = !isNaN(timeLimit) && timeLimit > 0 ? timeLimit : null;
		// --- نهاية الإصلاح ---

		try {
			// 3. تحديث قاعدة البيانات باستخدام الكائن النظيف
			await pb.collection('quizzes').update(params.quizId, dataToUpdate);
			return { type: 'details', success: true, message: 'تم تحديث تفاصيل الاختبار.' };
		} catch (err) {
			return fail(400, { type: 'details', success: false, message: 'فشل تحديث التفاصيل.' });
		}
	},

	updateQuizCoverImage: async ({ locals, request, params }) => {
		if (!locals.admin) throw redirect(303, '/');
		const formData = await request.formData();

		try {
			await pb.collection('quizzes').update(params.quizId, formData);
			return { type: 'details', success: true, message: 'تم تحديث صورة الغلاف.' };
		} catch (err) {
			return fail(400, {
				type: 'details',
				success: false,
				message: 'فشل تحديث صورة الغلاف.'
			});
		}
	},

	addQuestion: async ({ locals, request, params }) => {
		if (!locals.admin) throw redirect(303, '/');
		const formData = await request.formData();

		const { totalItems } = await pb.collection('questions').getList(1, 1, {
			filter: `quiz.id = "${params.quizId}"`
		});
		const newOrder = totalItems + 1;
		formData.append('order', newOrder.toString());
		formData.append('quiz', params.quizId);

		try {
			await pb.collection('questions').create(formData);
			return { type: 'question', success: true, message: 'تمت إضافة السؤال.' };
		} catch (err) {
			console.error(err);
			return fail(400, { type: 'question', success: false, message: 'فشلت إضافة السؤال.' });
		}
	},

	updateQuestion: async ({ locals, request }) => {
		if (!locals.admin) throw redirect(303, '/');
		const formData = await request.formData();
		const questionId = formData.get('questionId') as string;
		formData.delete('questionId');

		try {
			await pb.collection('questions').update(questionId, formData);
			return { type: 'question', success: true, message: 'تم تحديث السؤال.' };
		} catch (err) {
			return fail(400, { type: 'question', success: false, message: 'فشل تحديث السؤال.' });
		}
	},

	deleteQuestion: async ({ locals, request }) => {
		if (!locals.admin) throw redirect(303, '/');
		const formData = await request.formData();
		const questionId = formData.get('questionId') as string;

		try {
			await pb.collection('questions').delete(questionId);
			return { type: 'question', success: true, message: 'تم حذف السؤال.' };
		} catch (err) {
			return fail(400, { type: 'question', success: false, message: 'فشل حذف السؤال.' });
		}
	},

	reorderQuestions: async ({ locals, request }) => {
		if (!locals.admin) throw redirect(303, '/');
		const formData = await request.formData();
		const questionIds = (formData.get('order') as string).split(',');

		try {
			await Promise.all(
				questionIds.map((id, index) =>
					pb.collection('questions').update(id, { order: index + 1 })
				)
			);
			return { type: 'question', success: true, message: 'تم تحديث ترتيب الأسئلة.' };
		} catch (err) {
			return fail(400, {
				type: 'question',
				success: false,
				message: 'فشل تحديث ترتيب الأسئلة.'
			});
		}
	}
};