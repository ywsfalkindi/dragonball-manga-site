// src/routes/admin/quizzes/create/+page.server.ts
import { pb } from '$lib/pocketbase';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	createQuiz: async ({ locals, request }) => {
		if (!locals.admin) throw redirect(303, '/');

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const slug = formData.get('slug') as string;

		// --- التحسين رقم 1: التحقق من الحقول المطلوبة قبل الإرسال ---
		if (!title || title.trim() === '') {
			return fail(400, { error: 'حقل "عنوان الاختبار" مطلوب.' });
		}
		if (!slug || slug.trim() === '') {
			return fail(400, { error: 'حقل "الرابط (Slug)" مطلوب.' });
		}

		const dataToCreate: { [key: string]: any } = {
			title,
			slug,
			description: formData.get('description'),
			published: formData.get('published') === 'true'
		};

		const coverImage = formData.get('cover_image');
		if (coverImage instanceof File && coverImage.size > 0) {
			dataToCreate.cover_image = coverImage;
		}

		try {
			const newQuiz = await pb.collection('quizzes').create(dataToCreate);
			throw redirect(303, `/admin/quizzes/${newQuiz.id}?created=true`);
		} catch (err: any) {
			// --- التحسين رقم 2: معالجة أخطاء آمنة ومبسطة ---
			console.error('**POCKETBASE ERROR:**', JSON.stringify(err, null, 2));
			return fail(400, { 
				error: 'فشل إنشاء السجل في قاعدة البيانات. تحقق من أن الـ Slug فريد وأن جميع الحقول المطلوبة صحيحة.' 
			});
		}
	}
};