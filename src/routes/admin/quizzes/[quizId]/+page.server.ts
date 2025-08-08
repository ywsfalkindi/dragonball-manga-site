// src/routes/admin/quizzes/[quizId]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.admin) throw redirect(303, '/');
	const quizId = params.quizId;

	try {
		// جلب الاختبار مع توسيع علاقة الأسئلة لجلب تفاصيلها
		const quiz = await pb.collection('quizzes').getOne(quizId, {
			expand: 'questions'
		});

		if (quiz.cover_image) {
			quiz.cover_image_url = pb.files.getURL(quiz, quiz.cover_image);
		}

		// جلب كل الأسئلة المتاحة في بنك الأسئلة
		const allQuestionsInBank = await pb.collection('questions').getFullList({
			sort: '-created'
		});

		return {
			quiz,
			// هذه هي البيانات الجديدة التي سنستخدمها
			quizQuestions: quiz.expand?.questions || [],
			questionBank: allQuestionsInBank
		};
	} catch (err) {
		throw error(404, 'الاختبار غير موجود.');
	}
};

export const actions: Actions = {
	updateQuizDetails: async ({ locals, request, params }) => {
		if (!locals.admin) throw redirect(303, '/');
		const formData = await request.formData();
		
		const dataToUpdate: { [key: string]: any } = {
			title: formData.get('title'),
			slug: formData.get('slug'),
			description: formData.get('description'),
			published: formData.get('published') === 'true',
			category: formData.get('category') || 'عام',
			difficulty: formData.get('difficulty') || 'متوسط',
			quiz_mode: formData.get('quiz_mode') || 'normal'
		};

		const timeLimitRaw = formData.get('time_limit') as string;
		const timeLimit = parseInt(timeLimitRaw, 10);
		
		dataToUpdate.time_limit = !isNaN(timeLimit) && timeLimit > 0 ? timeLimit : null;

		try {
			await pb.collection('quizzes').update(params.quizId, dataToUpdate);
			return { type: 'details', success: true, message: 'تم تحديث تفاصيل الاختبار.' };
		} catch (err) {
			return fail(400, { type: 'details', success: false, message: 'فشل تحديث التفاصيل.' });
		}
	},

	// إجراء لربط الأسئلة من البنك بالاختبار
	linkQuestions: async ({ locals, request, params }) => {
		if (!locals.admin) throw redirect(303, '/');
		const formData = await request.formData();
		const questionIds = formData.getAll('questionIds') as string[];

		try {
			await pb.collection('quizzes').update(params.quizId, {
				'questions+': questionIds
			});
			return { type: 'question', success: true, message: 'تمت إضافة الأسئلة للاختبار.' };
		} catch (err) {
			return fail(400, { type: 'question', success: false, message: 'فشل ربط الأسئلة.' });
		}
	},
    
    // إجراء لإلغاء ربط سؤال من الاختبار
    unlinkQuestion: async ({ locals, request, params }) => {
        if (!locals.admin) throw redirect(303, '/');
        const formData = await request.formData();
        const questionId = formData.get('questionId') as string;

        try {
            await pb.collection('quizzes').update(params.quizId, {
                'questions-': questionId
            });
            return { type: 'question', success: true, message: 'تمت إزالة السؤال من الاختبار.' };
        } catch (err) {
            return fail(400, { type: 'question', success: false, message: 'فشل إلغاء ربط السؤال.' });
        }
    },

	addQuestion: async ({ locals, request }) => {
		if (!locals.admin) throw redirect(303, '/');
		const formData = await request.formData();
		const questionType = formData.get('type') as string;

		const dataToCreate: { [key: string]: any } = {
			text: formData.get('text'),
			image: formData.get('image'),
			type: questionType || 'multiple_choice',
			option_1: formData.get('option_1'),
			option_2: formData.get('option_2'),
			correct_option: formData.get('correct_option'),
			explanation: formData.get('explanation') || '',
			category: formData.get('category') || 'عام',
			difficulty: formData.get('difficulty') || 'متوسط'
		};

		if (questionType === 'multiple_choice') {
			dataToCreate.option_3 = formData.get('option_3');
			dataToCreate.option_4 = formData.get('option_4');
		} else {
			dataToCreate.option_3 = '';
			dataToCreate.option_4 = '';
		}

		try {
			await pb.collection('questions').create(dataToCreate);
			return { type: 'question', success: true, message: 'تمت إضافة السؤال إلى بنك الأسئلة.' };
		} catch (err) {
			console.error("Add question error:", err);
			return fail(400, { type: 'question', success: false, message: 'فشلت إضافة السؤال للبنك.' });
		}
	},

	deleteQuestion: async ({ locals, request }) => {
		if (!locals.admin) throw redirect(303, '/');
		const formData = await request.formData();
		const questionId = formData.get('questionId') as string;

		try {
			await pb.collection('questions').delete(questionId);
			return { type: 'question', success: true, message: 'تم حذف السؤال من البنك نهائياً.' };
		} catch (err) {
			return fail(400, { type: 'question', success: false, message: 'فشل حذف السؤال.' });
		}
	},
};