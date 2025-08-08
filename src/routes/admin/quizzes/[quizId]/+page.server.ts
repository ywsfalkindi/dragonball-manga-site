// src/routes/admin/quizzes/[quizId]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.admin) throw redirect(303, '/');
	const quizId = params.quizId;

	try {
		// جلب الاختبار مع أسئلته المرتبطة به
		const quiz = await pb.collection('quizzes').getOne(quizId);
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
	// Action لتحديث بيانات الاختبار الأساسية
	updateQuizDetails: async ({ locals, request, params }) => {
		if (!locals.admin) throw redirect(303, '/');
		const formData = await request.formData();
		// تحويل checkbox إلى قيمة boolean صحيحة
		const published = formData.get('published') === 'true';
		formData.set('published', published.toString());

		try {
			await pb.collection('quizzes').update(params.quizId, formData);
			return { type: 'details', success: true, message: 'تم تحديث تفاصيل الاختبار.' };
		} catch (err) {
			return fail(400, { type: 'details', success: false, message: 'فشل تحديث التفاصيل.' });
		}
	},

	// Action لإضافة سؤال جديد للاختبار الحالي
	addQuestion: async ({ locals, request, params }) => {
		if (!locals.admin) throw redirect(303, '/');
		const formData = await request.formData();

		// ✨✨✨ بداية الإصلاح ✨✨✨
		// 1. نحسب عدد الأسئلة الموجودة حاليًا في هذا الاختبار
		const { totalItems } = await pb.collection('questions').getList(1, 1, {
			filter: `quiz.id = "${params.quizId}"`
		});
		const newOrder = totalItems + 1;

		// 2. نضيف رقم الترتيب الجديد إلى البيانات قبل إرسالها
		formData.append('order', newOrder.toString());
		// ✨✨✨ نهاية الإصلاح ✨✨✨

		formData.append('quiz', params.quizId);

		try {
			await pb.collection('questions').create(formData);
			return { type: 'question', success: true, message: 'تمت إضافة السؤال.' };
		} catch (err) {
			console.error(err);
			return fail(400, { type: 'question', success: false, message: 'فشلت إضافة السؤال.' });
		}
	},
    
    // Action لتحديث سؤال موجود
	updateQuestion: async ({ locals, request }) => {
		if (!locals.admin) throw redirect(303, '/');
		const formData = await request.formData();
        const questionId = formData.get('questionId') as string;
        formData.delete('questionId'); // إزالته قبل التحديث

		try {
			await pb.collection('questions').update(questionId, formData);
			return { type: 'question', success: true, message: 'تم تحديث السؤال.' };
		} catch (err) {
			return fail(400, { type: 'question', success: false, message: 'فشل تحديث السؤال.' });
		}
	},

	// Action لحذف سؤال
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
	}
};