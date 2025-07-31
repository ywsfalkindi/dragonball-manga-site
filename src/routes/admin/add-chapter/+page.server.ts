import { pb } from '$lib/pocketbase';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '$env/static/private'; // <-- التغيير: استيراد من البيئة

export const load: PageServerLoad = async () => {
	const mangas = await pb.collection('mangas').getFullList({ sort: 'title' });
	return { mangas };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const mangaId = formData.get('mangaId') as string;
		const chapterNumber = Number(formData.get('chapterNumber'));
		const totalPages = Number(formData.get('totalPages'));

		if (!mangaId || !chapterNumber || !totalPages) {
			return fail(400, { error: 'يرجى ملء جميع الحقول المطلوبة.' });
		}

		try {
			// تسجيل الدخول ببيانات المدير
			// <-- التغيير: استخدام المتغيرات الآمنة
			await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);

			// جلب الـ slug الخاص بالمانجا المختارة
			const manga = await pb.collection('mangas').getOne(mangaId);

			const newChapter = await pb.collection('chapters').create({
				manga: mangaId,
				chapter_number: chapterNumber
			});

			for (let i = 1; i <= totalPages; i++) {
				const chapterNumFormatted = String(chapterNumber).padStart(2, '0');
				// بناء مسار الصورة تلقائيًا هنا في الخادم
				const imagePath = `${manga.folder_name}/chapter${chapterNumber}/${manga.file_prefix}-ch${chapterNumFormatted}-p${i}.jpg`;

				await pb.collection('pages').create({
					chapter: newChapter.id,
					page_number: i,
					image_path: imagePath
				});
			}
		} catch (err: any) {
			return fail(500, { error: `حدث خطأ: ${err.message}` });
		}

		return { success: `تمت إضافة الفصل ${chapterNumber} بنجاح!` };
	}
};