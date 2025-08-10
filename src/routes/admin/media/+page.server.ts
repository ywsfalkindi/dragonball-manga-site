// src/routes/admin/media/+page.server.ts
import { pb } from '$lib/pocketbase';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	// جلب كل الصفحات وأغلفة المانجا
	const [pages, mangas] = await Promise.all([
		pb.collection('pages').getFullList({ fields: 'image_path' }),
		pb.collection('mangas').getFullList({ fields: 'cover_image' })
	]);

	// إنشاء مجموعة بأسماء جميع الملفات المستخدمة
	const usedFiles = new Set<string>();
	pages.forEach((p) => usedFiles.add(p.image_path));
	mangas.forEach((m) => usedFiles.add(m.cover_image));

	// جلب كل السجلات التي تحتوي على ملفات (هذا مثال مبسط)
	// ملاحظة: PocketBase لا يوفر طريقة مباشرة لجلب "كل الملفات"
	// لذا سنفحص السجلات التي نعرف أنها تحتوي على ملفات.
	const allFileRecords = [
		...(await pb.collection('pages').getFullList()),
		...(await pb.collection('mangas').getFullList())
	];

	const unusedFiles: { name: string; url: string; recordId: string }[] = [];
	allFileRecords.forEach((record) => {
		const fileFields = ['image_path', 'cover_image'];
		for (const field of fileFields) {
			const fileName = record[field];
			if (fileName && !usedFiles.has(fileName)) {
				unusedFiles.push({
					name: fileName,
					url: pb.files.getURL(record, fileName),
					recordId: record.id
				});
			}
		}
	});

	return { unusedFiles };
};

export const actions: Actions = {
	// إجراء لحذف الملفات غير المستخدمة سيكون أكثر تعقيدًا
	// ويتطلب معرفة الـ Record ID والـ Collection.
	// هذا مجرد مثال توضيحي.
};
