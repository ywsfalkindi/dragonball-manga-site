// src/routes/admin/add-chapter/+page.server.ts
import { pb } from '$lib/pocketbase';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '$env/static/private';

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
			await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);

			// --- بداية التحسين الأول: التحقق من وجود الفصل ---
			try {
				await pb
					.collection('chapters')
					.getFirstListItem(`manga.id = "${mangaId}" && chapter_number = ${chapterNumber}`);
				// إذا وجدنا الفصل ولم يظهر خطأ، فهذا يعني أنه مكرر
				return fail(400, { error: `الفصل رقم ${chapterNumber} موجود بالفعل في هذه المانجا.` });
			} catch (err: any) {
				// نتوقع خطأ "Not Found"، وهذا يعني أن الفصل غير موجود ويمكننا المتابعة
				if (err.status !== 404) {
					// إذا كان الخطأ لسبب آخر، نعرضه
					throw err;
				}
			}
			// --- نهاية التحسين الأول ---

			// جلب بيانات المانجا
			const manga = await pb.collection('mangas').getOne(mangaId);

			// إنشاء سجل الفصل الجديد
			const newChapter = await pb.collection('chapters').create({
				manga: mangaId,
				chapter_number: chapterNumber
			});

			// --- بداية التحسين الثاني: إنشاء الصفحات دفعة واحدة ---
			const pagesToCreate = [];
			for (let i = 1; i <= totalPages; i++) {
				const chapterNumFormatted = String(chapterNumber).padStart(2, '0');
				const pageNumFormatted = String(i).padStart(2, '0'); // تحسين إضافي لترتيب أفضل
				const imagePath = `${manga.folder_name}/chapter${chapterNumber}/${manga.file_prefix}-ch${chapterNumFormatted}-p${pageNumFormatted}.jpg`;

				pagesToCreate.push({
					chapter: newChapter.id,
					page_number: i,
					image_path: imagePath
				});
			}

			// تنفيذ جميع عمليات إنشاء الصفحات بشكل متوازٍ
			await Promise.all(pagesToCreate.map((page) => pb.collection('pages').create(page)));
			// --- نهاية التحسين الثاني ---

		} catch (err: any) {
			// في حالة فشل أي خطوة، يتم إرجاع رسالة خطأ
			return fail(500, { error: `حدث خطأ: ${err.message}` });
		}

		return { success: `تمت إضافة الفصل ${chapterNumber} بـ ${totalPages} صفحة بنجاح!` };
	}
};