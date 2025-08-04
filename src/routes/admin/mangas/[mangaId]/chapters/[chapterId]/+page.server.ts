import { pb } from '$lib/pocketbase';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { PUBLIC_CDN_URL } from '$env/static/public'; // <-- الخطوة 1: استيراد المتغير

export const load: PageServerLoad = async ({ params }) => {
	try {
		const chapter = await pb.collection('chapters').getOne(params.chapterId, {
			expand: 'manga'
		});

		const pages = await pb.collection('pages').getFullList({
			filter: `chapter.id = "${params.chapterId}"`,
			sort: 'page_number'
		});

		// الخطوة 2: بناء رابط الصورة بالطريقة الصحيحة
		pages.forEach((page) => {
			// استبدلنا السطر القديم بهذا السطر
			page.imageUrl = `${PUBLIC_CDN_URL}/${page.image_path}`;
		});

		return {
			chapter,
			pages
		};
	} catch (err) {
		throw error(404, 'الفصل أو المانجا غير موجودة');
	}
};

export const actions: Actions = {
	deletePage: async ({ request }) => {
		const formData = await request.formData();
		const pageId = formData.get('pageId') as string;

		if (!pageId) {
			return fail(400, { error: 'معرف الصفحة مفقود.' });
		}

		try {
			await pb.collection('pages').delete(pageId);
		} catch (err) {
			return fail(500, { error: 'فشل حذف الصفحة.' });
		}

		return { success: true };
	}
};