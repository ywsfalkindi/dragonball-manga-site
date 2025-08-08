// src/routes/admin/quizzes/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// جلب جميع الاختبارات لعرضها في الجدول
export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.admin) throw redirect(303, '/'); // حماية الصفحة للمدير فقط

	try {
		const quizzes = await pb.collection('quizzes').getFullList({ sort: '-created' });
		return { quizzes };
	} catch (err) {
		console.error('Error fetching quizzes:', err);
		throw error(500, 'حدث خطأ أثناء جلب الاختبارات.');
	}
};

// Actions لحذف الاختبار
export const actions: Actions = {
	deleteQuiz: async ({ locals, request }) => {
		if (!locals.admin) throw redirect(303, '/'); // حماية الإجراء

		const formData = await request.formData();
		const quizId = formData.get('id') as string;

		if (!quizId) return { success: false, message: 'معرّف الاختبار مفقود.' };

		try {
            // ملاحظة: يجب تفعيل "Cascade Delete" في PocketBase لحذف الأسئلة المتعلقة تلقائياً
			await pb.collection('quizzes').delete(quizId);
			return { success: true, message: 'تم حذف الاختبار بنجاح.' };
		} catch (err) {
			console.error('Error deleting quiz:', err);
			return { success: false, message: 'فشل حذف الاختبار.' };
		}
	}
};