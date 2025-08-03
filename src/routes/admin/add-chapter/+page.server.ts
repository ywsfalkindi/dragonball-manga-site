// src/routes/admin/add-chapter/+page.server.ts
import { pb } from '$lib/pocketbase';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
// ✨ التحسين: تم حذف متغيرات المدير غير المستخدمة ✨

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
            // ✨ التحسين: تم حذف كود تسجيل دخول المدير لأنه غير ضروري ✨

			// --- بداية التحسين الأول: التحقق من وجود الفصل ---
			try {
				await pb
					.collection('chapters')
					.getFirstListItem(`manga.id = "${mangaId}" && chapter_number = ${chapterNumber}`);
				return fail(400, { error: `الفصل رقم ${chapterNumber} موجود بالفعل في هذه المانجا.` });
			} catch (err: any) {
				if (err.status !== 404) {
					throw err;
				}
			}
			// --- نهاية التحسين الأول ---

			const manga = await pb.collection('mangas').getOne(mangaId);

			const newChapter = await pb.collection('chapters').create({
				manga: mangaId,
				chapter_number: chapterNumber
			});

			// --- بداية التحسين الثاني: إنشاء الصفحات دفعة واحدة ---
			const pagesToCreate = [];
			for (let i = 1; i <= totalPages; i++) {
				const chapterNumFormatted = String(chapterNumber).padStart(2, '0');
				const pageNumFormatted = String(i).padStart(2, '0'); 
				const imagePath = `${manga.folder_name}/chapter${chapterNumber}/${manga.file_prefix}-ch${chapterNumFormatted}-p${pageNumFormatted}.jpg`;

				pagesToCreate.push({
					chapter: newChapter.id,
					page_number: i,
					image_path: imagePath
				});
			}

			await Promise.all(pagesToCreate.map((page) => pb.collection('pages').create(page)));
			// --- نهاية التحسين الثاني ---

		} catch (err: any) {
			return fail(500, { error: `حدث خطأ: ${err.message}` });
		}

		return { success: `تمت إضافة الفصل ${chapterNumber} بـ ${totalPages} صفحة بنجاح!` };
	}
};