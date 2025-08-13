// src/routes/api/manga/[slug]/chapters/+server.ts

// ✨ السر رقم 2: نقطة نهاية API مخصصة لجلب الفصول فقط
import { pb } from '$lib/pocketbase';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Chapter } from '$lib/types';

export const GET: RequestHandler = async ({ params, url }) => {
	const slug = params.slug;
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = Number(url.searchParams.get('limit')) || 30;

	if (!slug) {
		throw error(400, 'Manga slug is required');
	}

	try {
		// أولاً، نحتاج ID المانجا من الـ slug
		const manga = await pb.collection('mangas').getFirstListItem(`slug = "${slug}"`, {
			fields: 'id' // نطلب فقط حقل الـ ID لتحسين الأداء
		});

		// الآن نجلب قائمة الفصول المطلوبة
		const chaptersResult = await pb.collection('chapters').getList<Chapter>(page, limit, {
			filter: `manga = "${manga.id}"`,
			sort: 'chapter_number'
		});

		return json(chaptersResult);
	} catch (err: any) {
		console.error('API Error fetching chapters:', err);
		if (err.status === 404) {
			throw error(404, 'Manga not found');
		}
		throw error(500, 'Failed to fetch chapters from the server.');
	}
};
