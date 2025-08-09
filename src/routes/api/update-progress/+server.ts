// src/routes/api/update-progress/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'غير مصرح به');
	}

	const { chapterId, page } = await request.json();

	if (!chapterId || !page) {
		throw error(400, 'معلومات غير مكتملة');
	}

	try {
		// أولاً، نحاول العثور على السجل الموجود
		const record = await pb.collection('read_history').getFirstListItem(
			`user.id = "${locals.user.id}" && chapter.id = "${chapterId}"`
		);

		// إذا وجدناه، نقوم بتحديثه
		await pb.collection('read_history').update(record.id, {
			last_page_read: page
		});

	} catch (err: any) {
		// إذا لم يتم العثور على السجل (وهذا هو الخطأ المتوقع)، نقوم بإنشائه
		if (err.status === 404) {
			try {
				// نحتاج إلى معرّف المانجا لإنشاء سجل جديد، لذا نقوم بجلب بيانات الفصل أولاً
				const chapter = await pb.collection('chapters').getOne(chapterId, { fields: 'manga' });

				await pb.collection('read_history').create({
					user: locals.user.id,
					chapter: chapterId,
					manga: chapter.manga, // حصلنا على معرّف المانجا من الفصل
					last_page_read: page
				});
			} catch (createErr) {
				// معالجة أي خطأ قد يحدث أثناء محاولة الإنشاء
				console.error("فشل في إنشاء سجل قراءة جديد:", createErr);
				throw error(500, 'فشل إنشاء سجل القراءة.');
			}
		} else {
			// لأي أخطاء أخرى، يتم تسجيلها وإظهار خطأ عام
			console.error("فشل في تحديث التقدم:", err);
			throw error(500, 'فشل تحديث سجل القراءة.');
		}
	}

	return json({ success: true });
};