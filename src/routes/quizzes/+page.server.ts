// src/routes/quizzes/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		// جلب الاختبارات المنشورة فقط
		const quizzes = await pb.collection('quizzes').getFullList({
			filter: 'published = true',
			sort: '-created'
		});

		// توليد روابط الصور
		quizzes.forEach(quiz => {
			if (quiz.cover_image) {
				quiz.cover_image_url = pb.files.getURL(quiz, quiz.cover_image);
			}
		});

		return { quizzes };
	} catch (err) {
		console.error('Error fetching published quizzes:', err);
		throw error(500, 'لا يمكن تحميل الاختبارات حالياً.');
	}
};