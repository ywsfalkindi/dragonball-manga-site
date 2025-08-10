// src/routes/quizzes/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	try {
		const category = url.searchParams.get('category') || '';
		const difficulty = url.searchParams.get('difficulty') || '';

		// بناء جملة الفلترة ديناميكيًا
		const filterParts = ['published = true'];
		if (category) {
			filterParts.push(`category = "${category}"`);
		}
		if (difficulty) {
			filterParts.push(`difficulty = "${difficulty}"`);
		}
		const filter = filterParts.join(' && ');

		// جلب الاختبارات المنشورة مع تطبيق الفلاتر
		const quizzes = await pb.collection('quizzes').getFullList({
			filter: filter,
			sort: '-created'
		});

		// توليد روابط الصور
		quizzes.forEach((quiz) => {
			if (quiz.cover_image) {
				quiz.cover_image_url = pb.files.getURL(quiz, quiz.cover_image);
			}
		});

		return {
			quizzes,
			// ✨ تحسين: إرسال قيم الفلترة الحالية إلى الواجهة الأمامية
			currentCategory: category,
			currentDifficulty: difficulty
		};
	} catch (err) {
		console.error('Error fetching published quizzes:', err);
		throw error(500, 'لا يمكن تحميل الاختبارات حالياً.');
	}
};
