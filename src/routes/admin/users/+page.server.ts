// src/routes/admin/users/+page.server.ts
import { pb } from '$lib/pocketbase';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { RecordFullListOptions } from 'pocketbase'; // ✨ إضافة: استيراد النوع الصحيح

export const load: PageServerLoad = async ({ url }) => {
	const searchTerm = url.searchParams.get('q') || '';
	const filterBy = url.searchParams.get('filter') || 'all';

	let filterString = '';
	if (searchTerm) {
		filterString += `(username ~ "${searchTerm}" || email ~ "${searchTerm}")`;
	}

	if (filterBy === 'banned') {
		if (filterString) filterString += ' && ';
		filterString += 'banned = true';
	} else if (filterBy === 'admins') {
		if (filterString) filterString += ' && ';
		filterString += 'isAdmin = true';
	}

	// ✨ تصحيح: بناء كائن الخيارات بشكل آمن للأنواع (type-safe)
	const options: RecordFullListOptions = {
		sort: '-created'
	};

	if (filterString) {
		options.filter = filterString;
	}

	const users = await pb.collection('users').getFullList(options);
	// ✨ نهاية التصحيح

	return {
		users,
		searchTerm,
		filterBy
	};
};

export const actions: Actions = {
	toggleAdmin: async ({ request }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const currentIsAdmin = formData.get('isAdmin') === 'true';

		try {
			await pb.collection('users').update(userId, {
				isAdmin: !currentIsAdmin
			});
		} catch (err) {
			return fail(500, { error: 'فشل تغيير صلاحيات المستخدم.' });
		}

		return { success: true };
	},

	toggleBan: async ({ request }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const currentIsBanned = formData.get('isBanned') === 'true';

		try {
			await pb.collection('users').update(userId, {
				banned: !currentIsBanned
			});
		} catch (err) {
			return fail(500, { error: 'فشل تغيير حالة حظر المستخدم.' });
		}

		return { success: true };
	}
};