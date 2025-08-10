// src/routes/profile/history/+page.server.ts

import { pb } from '$lib/pocketbase';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// التأكد من أن المستخدم مسجل دخوله
	if (!locals.user) throw redirect(303, '/login');

	// جلب كل سجلات القراءة للمستخدم الحالي
	const historyRecords = await pb.collection('read_history').getFullList({
		filter: `user.id = "${locals.user.id}"`,
		sort: '-created', // الترتيب من الأحدث للأقدم
		expand: 'manga,chapter' // جلب معلومات المانجا والفصل المرتبطة
	});

	return {
		history: historyRecords
	};
};
