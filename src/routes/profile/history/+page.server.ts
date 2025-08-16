// src/routes/profile/history/+page.server.ts

import { pb } from '$lib/pocketbase';
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { PaginatedResult, ReadHistoryRecord } from '$lib/types';
import type { Actions } from './$types';
import { ClientResponseError } from 'pocketbase';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) throw redirect(303, '/login');

	const page = Number(url.searchParams.get('page')) || 1;
	const perPage = 20;
	const searchTerm = url.searchParams.get('q') || '';

	let filter = `user.id = "${locals.user.id}"`;

	if (searchTerm) {
		filter += ` && manga.title ~ "${searchTerm}"`;
	}

	try {
		const historyResult: PaginatedResult<ReadHistoryRecord> = await pb
			.collection('read_history')
			.getList(page, perPage, {
				filter: filter,
				sort: '-created',
				expand: 'manga,chapter'
			});

		for (const record of historyResult.items) {
			if (record.expand?.manga?.cover_image) {
				// ✨✨ هذا هو السطر الذي تم تحديثه ✨✨
				record.expand.manga.cover_image_url = pb.files.getURL(
					record.expand.manga,
					record.expand.manga.cover_image,
					{ thumb: '100x150' }
				);
			}
		}

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
			// رسالة نجاح واضحة
			return { success: true, message: 'تم حذف السجل بنجاح.' };
		} catch (err) {
			if (err instanceof ClientResponseError && err.status === 404) {
				return { success: true, message: 'السجل محذوف بالفعل.' };
			}

			console.error('Error deleting history record:', err);
			return { success: false, message: 'فشل حذف السجل. حاول مرة أخرى.' };
		}
	},

	// ✨ جديد: لحذف السجلات المحددة
	deleteSelected: async ({ locals, request }) => {
		if (!locals.user) throw error(401, 'غير مصرح به');

		const formData = await request.formData();
		const idsToDelete = formData.getAll('ids') as string[];

		if (!idsToDelete || idsToDelete.length === 0) {
			return { success: false, message: 'لم يتم تحديد أي سجلات.' };
		}

		// حاول حذف كل السجلات المحددة
		const promises = idsToDelete.map((id) =>
			pb.collection('read_history').delete(id, { requestKey: null })
		);

		try {
			await Promise.allSettled(promises); // نستخدم allSettled لتجنب إيقاف العملية عند أول خطأ
			return { success: true, message: `تم حذف ${idsToDelete.length} سجل بنجاح.` };
		} catch (err) {
			console.error('Error deleting selected history records:', err);
			return { success: false, message: 'فشل حذف بعض السجلات المحددة.' };
		}
	},

	// ✨ جديد: لمسح كل السجل
	clearHistory: async ({ locals }) => {
		if (!locals.user) throw error(401, 'غير مصرح به');

		try {
			const records = await pb.collection('read_history').getFullList(200, {
				filter: `user.id = "${locals.user.id}"`,
				fields: 'id'
			});

			const deletePromises = records.map((record) =>
				pb.collection('read_history').delete(record.id, { requestKey: null })
			);
			await Promise.allSettled(deletePromises);

			return { success: true, message: 'تم مسح سجل القراءة بالكامل.' };
		} catch (err) {
			console.error('Error clearing history:', err);
			return { success: false, message: 'فشل مسح سجل القراءة.' };
		}
	}
};
