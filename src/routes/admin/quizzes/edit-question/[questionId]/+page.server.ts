// src/routes/admin/quizzes/edit-question/[questionId]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.admin) throw redirect(303, '/');
	const questionId = params.questionId;

	try {
		const question = await pb.collection('questions').getOne(questionId);
		return { question };
	} catch (err) {
		throw error(404, 'السؤال غير موجود.');
	}
};

export const actions: Actions = {
	updateQuestion: async ({ locals, request, params }) => {
		if (!locals.admin) throw redirect(303, '/');
		const formData = await request.formData();
		const questionType = formData.get('type') as string;

		const dataToUpdate: { [key: string]: any } = {
			text: formData.get('text'),
			type: questionType,
			option_1: formData.get('option_1'),
			option_2: formData.get('option_2'),
			correct_option: Number(formData.get('correct_option')),
			explanation: formData.get('explanation') || '',
			category: formData.get('category') || 'عام',
			difficulty: formData.get('difficulty') || 'متوسط'
		};

		if (questionType === 'multiple_choice') {
			dataToUpdate.option_3 = formData.get('option_3');
			dataToUpdate.option_4 = formData.get('option_4');
		} else {
			dataToUpdate.option_1 = 'صح';
			dataToUpdate.option_2 = 'خطأ';
			dataToUpdate.option_3 = '-';
			dataToUpdate.option_4 = '-';
		}

		try {
			await pb.collection('questions').update(params.questionId, dataToUpdate);
		} catch (err: any) {
			return fail(400, {
				error: 'فشل تحديث السؤال. تأكد من أن جميع الحقول ممتلئة بشكل صحيح.'
			});
		}

		return { success: 'تم تحديث السؤال بنجاح!' };
	}
};
