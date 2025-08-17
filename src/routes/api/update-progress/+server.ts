// src/routes/api/update-progress/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';
import { grantXp } from '../../../hooks.server'; // <-- أضفنا هذا السطر

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
		const record = await pb
			.collection('read_history')
			.getFirstListItem(`user.id = "${locals.user.id}" && chapter.id = "${chapterId}"`);

		// إذا وجدناه، نقوم بتحديثه
		await pb.collection('read_history').update(record.id, {
			last_page_read: page
		});

		// --- بداية المنطق الجديد لمنح نقاط الخبرة ---

		// تحقق إذا كان المستخدم قد أكمل الفصل بالفعل من قبل
		if (record.completed_reading === true) {
			return json({ success: true, message: 'Progress updated.' });
		}

		// جلب عدد الصفحات الكلي للفصل
		const pagesInChapter = await pb.collection('pages').getFullList({
			filter: `chapter = "${chapterId}"`,
			fields: 'id' // نطلب فقط الـ ID لتسريع الاستعلام
		});
		const totalPages = pagesInChapter.length;

		// إذا وصل المستخدم للصفحة الأخيرة ولم يكن قد أكمل الفصل من قبل
		if (page >= totalPages && !record.completed_reading) {
			// --- بداية منطق التحقق من الوقت ---
			const startTime = new Date(record.reading_started_at).getTime();
			const endTime = new Date().getTime();
			const timeSpentInSeconds = (endTime - startTime) / 1000;

			// لنفترض أن الوقت المنطقي لقراءة صفحة هو ثانيتان على الأقل
			const minimumTimeRequired = totalPages * 2; // مثال: فصل 20 صفحة يتطلب 40 ثانية

			// إذا كان الوقت المستغرق غير منطقي، لا تمنح نقاط خبرة
			if (timeSpentInSeconds < minimumTimeRequired) {
				// يمكنك تسجيل هذا السلوك المشبوه إذا أردت
				console.warn(
					`User ${locals.user.id} may be cheating. Finished chapter ${chapterId} in ${timeSpentInSeconds}s.`
				);
			} else {
				// الوقت منطقي، امنح 25 نقطة خبرة
				await grantXp(locals.user.id, 25);
			}
			// --- نهاية منطق التحقق من الوقت ---

			// سيتم تحديث حالة الفصل كمكتمل في كل الأحوال
			await pb.collection('read_history').update(record.id, {
				completed_reading: true
			});
		}
		// --- نهاية المنطق الجديد ---
	} catch (err: any) {
		// إذا لم يتم العثور على السجل (وهذا هو الخطأ المتوقع)، نقوم بإنشائه
		if (err.status === 404) {
			try {
				// نحتاج إلى معرّف المانجا لإنشاء سجل جديد، لذا نقوم بجلب بيانات الفصل أولاً
				const chapter = await pb.collection('chapters').getOne(chapterId, { fields: 'manga' });

				await pb.collection('read_history').create({
					user: locals.user.id,
					chapter: chapterId,
					manga: chapter.manga,
					last_page_read: page,
					completed_reading: false, // القيمة الافتراضية
					reading_started_at: new Date().toISOString()
				});
			} catch (createErr) {
				console.error('فشل في إنشاء سجل قراءة جديد:', createErr);
				throw error(500, 'فشل إنشاء سجل القراءة.');
			}
		} else {
			console.error('فشل في تحديث التقدم:', err);
			throw error(500, 'فشل تحديث سجل القراءة.');
		}
	}

	return json({ success: true });
};
