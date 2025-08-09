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
		const record = await pb.collection('read_history').getFirstListItem(
			`user.id = "${locals.user.id}" && chapter.id = "${chapterId}"`
		);

		await pb.collection('read_history').update(record.id, {
			last_page_read: page
		});

		return json({ success: true });
	} catch (err) {
		// يمكن تجاهل الخطأ إذا لم يتم العثور على السجل، لأنه سيتم إنشاؤه عند تحميل الصفحة
		return json({ success: false, message: 'لم يتم العثور على سجل القراءة.' });
	}
};