// src/routes/admin/mangas/[mangaId]/+page.server.ts (New file)
import { pb } from '$lib/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	if (params.mangaId === 'new') {
		return { manga: null }; // صفحة إضافة جديدة
	}

	try {
		const manga = await pb.collection('mangas').getOne(params.mangaId);
		return { manga }; // صفحة تعديل
	} catch (err) {
		throw error(404, 'المانجا غير موجودة');
	}
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const formData = await request.formData();
		const isNew = params.mangaId === 'new';

		// FormData لا تدعم الملفات مباشرة بهذه الطريقة عبر Server Actions
		// عادةً ما يتم رفع الصورة من طرف العميل أولاً ثم إرسال المعرف
		// للتبسيط، سأفترض أن حقل صورة الغلاف سيبقى كما هو عند التعديل
		// أو يتطلب معالجة منفصلة للرفع.
		const data = {
			title: formData.get('title'),
			slug: formData.get('slug'),
			description: formData.get('description'),
			status: formData.get('status'),
			folder_name: formData.get('folder_name'),
			file_prefix: formData.get('file_prefix')
		};

		try {
			if (params.mangaId === 'new') {
				const newManga = await pb.collection('mangas').create(data);
				return { manga: newManga, success: 'تم إنشاء المانجا بنجاح.' };
			} else {
				await pb.collection('mangas').update(params.mangaId, data);
				return { success: 'تم تحديث المانجا بنجاح.' };
			}
		} catch (err: any) {
			// ✨ بداية التحسين: التعامل مع خطأ الصلاحيات بشكل خاص ✨
			if (err.status === 403) {
				return fail(403, {
					error: 'ليس لديك الصلاحية للقيام بهذا الإجراء. تحقق من قواعد API في PocketBase.'
				});
			}
			// ✨ نهاية التحسين ✨
			
			console.error(err.data);
			return fail(400, { error: 'حدث خطأ. تأكد من أن الـ Slug فريد وغير مكرر.' });
		}
	}
};