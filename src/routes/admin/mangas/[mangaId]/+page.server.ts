// src/routes/admin/mangas/[mangaId]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	if (params.mangaId === 'new') {
		return { manga: null, chapters: [] }; // صفحة إضافة جديدة
	}

	try {
		const manga = await pb.collection('mangas').getOne(params.mangaId);
		// جلب الفصول المتعلقة بالمانجا
		const chapters = await pb.collection('chapters').getFullList({
			filter: `manga.id = "${params.mangaId}"`,
			sort: 'chapter_number'
		});

		return { manga, chapters }; // صفحة تعديل
	} catch (err) {
		throw error(404, 'المانجا غير موجودة');
	}
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const formData = await request.formData();
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
				// لا نعيد توجيه، بل نرجع البيانات المحدثة
				return { manga: newManga, success: 'تم إنشاء المانجا بنجاح.' };
			} else {
				await pb.collection('mangas').update(params.mangaId, data);
				return { success: 'تم تحديث المانجا بنجاح.' };
			}
		} catch (err: any) {
			if (err.status === 403) {
				return fail(403, {
					error: 'ليس لديك الصلاحية للقيام بهذا الإجراء. تحقق من قواعد API في PocketBase.'
				});
			}
			console.error(err.data);
			return fail(400, { error: 'حدث خطأ. تأكد من أن الـ Slug فريد وغير مكرر.' });
		}
	}
	// يمكنك إضافة إجراءات لحذف وإعادة ترتيب الفصول هنا
};