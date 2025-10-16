// src/routes/api/update-progress/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';
import { grantXp } from '../../../hooks.server';
import { z } from 'zod'; // <-- 1. تم استيراد Zod

// --- 2. مخطط التحقق من البيانات المدخلة ---
const updateProgressSchema = z.object({
	chapterId: z.string().min(1),
	page: z.number().int().positive() // يجب أن يكون رقم الصفحة عدداً صحيحاً وموجباً
});

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'غير مصرح به');
	}

	try {
		const body = await request.json();
		// --- 3. التحقق من البيانات باستخدام المخطط ---
		const { chapterId, page } = updateProgressSchema.parse(body);

		// أولاً، نحاول العثور على السجل الموجود
		const record = await pb
			.collection('read_history')
			.getFirstListItem(`user.id = "${locals.user.id}" && chapter.id = "${chapterId}"`);

		// إذا وجدناه، نقوم بتحديثه
		await pb.collection('read_history').update(record.id, {
			last_page_read: page
		});

		// --- بداية المنطق الجديد لمنح نقاط الخبرة ---
		if (record.completed_reading === true) {
			return json({ success: true, message: 'Progress updated.' });
		}

		const pagesInChapter = await pb.collection('pages').getFullList({
			filter: `chapter = "${chapterId}"`,
			fields: 'id'
		});
		const totalPages = pagesInChapter.length;

		if (page >= totalPages && !record.completed_reading) {
			const startTime = new Date(record.reading_started_at).getTime();
			const endTime = new Date().getTime();
			const timeSpentInSeconds = (endTime - startTime) / 1000;
			const minimumTimeRequired = totalPages * 2;

			if (timeSpentInSeconds < minimumTimeRequired) {
				console.warn(
					`User ${locals.user.id} may be cheating. Finished chapter ${chapterId} in ${timeSpentInSeconds}s.`
				);
			} else {
				await grantXp(locals.user.id, 25);
			}

			await pb.collection('read_history').update(record.id, {
				completed_reading: true
			});
		}
		// --- نهاية المنطق الجديد ---
		return json({ success: true, message: 'Progress updated.' });
	} catch (err: any) {
		// --- 4. معالجة الأخطاء الناتجة عن التحقق ---
		if (err instanceof z.ZodError) {
			throw error(400, 'بيانات غير صالحة');
		}

		if (err.status === 404) {
			try {
				const { chapterId, page } = updateProgressSchema.parse(await request.json());
				const chapter = await pb.collection('chapters').getOne(chapterId, { fields: 'manga' });

				await pb.collection('read_history').create({
					user: locals.user.id,
					chapter: chapterId,
					manga: chapter.manga,
					last_page_read: page,
					completed_reading: false,
					reading_started_at: new Date().toISOString()
				});

				return json({ success: true, message: 'Progress created.' });
			} catch (createErr) {
				console.error('فشل في إنشاء سجل قراءة جديد:', createErr);
				throw error(500, 'فشل إنشاء سجل القراءة.');
			}
		}

		console.error('فشل في تحديث التقدم:', err);
		throw error(500, 'فشل تحديث سجل القراءة.');
	}
};