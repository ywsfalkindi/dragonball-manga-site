import { pb } from '$lib/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	try {
		const manga = await pb.collection('mangas').getFirstListItem(`slug = "${params.slug}"`);
		const chapter = await pb.collection('chapters').getFirstListItem(`manga.id = "${manga.id}" && chapter_number = ${params.chapter_number}`);

		if (locals.user) {
			try {
				await pb.collection('read_history').create({ user: locals.user.id, chapter: chapter.id, manga: manga.id });
			} catch (err) { /* ignore */ }
		}

		const pages = await pb.collection('pages').getFullList({
			filter: `chapter = "${chapter.id}"`,
			sort: 'page_number'
		});

		pages.forEach((page) => {
			page.page_image_url = pb.files.getURL(page, page.image_path);
		});
		
		const comments = await pb.collection('comments').getFullList({
			filter: `chapter = "${chapter.id}"`,
			sort: '-created',
			expand: 'user'
		});

		return { user: locals.user || null, manga, chapter, pages, comments };
	} catch (err) {
		console.error("CRASH REPORT:", err);
		throw error(404, 'المانجا أو الفصل المطلوب غير موجود');
	}
};

export const actions: Actions = {
	addComment: async ({ locals, request, params }) => {
		if (!locals.user) {
			throw redirect(303, '/login');
		}

		const data = await request.formData();
		const content = data.get('content') as string;

		if (!content || content.trim().length === 0) {
			return fail(400, { error: 'لا يمكن أن يكون التعليق فارغًا.' });
		}
		
		const manga = await pb.collection('mangas').getFirstListItem(`slug = "${params.slug}"`);
		const chapter = await pb.collection('chapters').getFirstListItem(`manga.id = "${manga.id}" && chapter_number = ${params.chapter_number}`);

		try {
			await pb.collection('comments').create({
				content,
				user: locals.user.id,
				chapter: chapter.id
			});
		} catch (err) {
			return fail(500, { error: 'حدث خطأ ما أثناء إرسال التعليق.' });
		}

		return { success: true };
	}
};