// src/routes/admin/mangas/+page.server.ts (New file)
import { pb } from '$lib/pocketbase';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const mangas = await pb.collection('mangas').getFullList({ sort: '-created' });
	return { mangas };
};

export const actions: Actions = {
	deleteManga: async ({ request }) => {
		const formData = await request.formData();
		const mangaId = formData.get('mangaId') as string;

		try {
			// لاحقًا: يمكن إضافة حذف الفصول والصفحات المتعلقة بالمانجا هنا
			await pb.collection('mangas').delete(mangaId);
		} catch (err) {
			return fail(500, { error: 'فشل حذف المانجا.' });
		}
		return { success: true };
	}
};