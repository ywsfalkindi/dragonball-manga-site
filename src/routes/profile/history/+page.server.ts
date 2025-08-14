// src/routes/profile/history/+page.server.ts

import { pb } from '$lib/pocketbase';
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { PaginatedResult, ReadHistoryRecord } from '$lib/types'; // <-- استيراد الأنواع الجديدة
import type { Actions } from './$types';
import { ClientResponseError } from 'pocketbase'; 

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) throw redirect(303, '/login');

	const page = Number(url.searchParams.get('page')) || 1;
	const perPage = 20;
	// ✨ 1. احصل على مصطلح البحث من الرابط
	const searchTerm = url.searchParams.get('q') || '';

	// ✨ 2. قم ببناء فلتر ديناميكي
	// نبدأ بالفلتر الأساسي الذي يضمن جلب سجلات المستخدم الحالي فقط
	let filter = `user.id = "${locals.user.id}"`;

	// إذا كان هناك مصطلح بحث، أضفه إلى الفلتر
	if (searchTerm) {
		// PocketBase's `~` operator means "like" (يُشبه)
		filter += ` && manga.title ~ "${searchTerm}"`;
	}

	try {
		const historyResult: PaginatedResult<ReadHistoryRecord> = await pb
			.collection('read_history')
			.getList(page, perPage, {
				filter: filter, // ✨ 3. استخدم الفلتر الديناميكي هنا
				sort: '-created',
				expand: 'manga,chapter'
			});

		for (const record of historyResult.items) {
			if (record.expand?.manga?.cover_image) {
				record.expand.manga.cover_image_url = pb.getFileUrl(
					record.expand.manga,
					record.expand.manga.cover_image,
					{ thumb: '100x150' }
				);
			}
		}

		// ✨ 4. أعد مصطلح البحث إلى الصفحة
		return {
			history: historyResult,
			searchTerm: searchTerm
		};
	} catch (err) {
		console.error('Error fetching reading history:', err);
		throw error(500, 'حدث خطأ أثناء جلب سجل القراءة. يرجى المحاولة مرة أخرى.');
	}
};

export const actions: Actions = {
	deleteRecord: async ({ locals, request }) => {
		if (!locals.user) {
			throw error(401, 'غير مصرح به');
		}

		const formData = await request.formData();
		const recordId = formData.get('id') as string;

		if (!recordId) {
			return { success: false, message: 'معرف السجل مفقود.' };
		}

		try {
			await pb.collection('read_history').delete(recordId);
			return { success: true };
		} catch (err) {
			// ✨ 2. Check if the error is a 404
			if (err instanceof ClientResponseError && err.status === 404) {
				// The record was already deleted, which is fine.
				// We can treat this as a success.
				return { success: true };
			}
			
			// For any other error, log it and return a failure message
			console.error('Error deleting history record:', err);
			return { success: false, message: 'فشل حذف السجل.' };
		}
	}
};