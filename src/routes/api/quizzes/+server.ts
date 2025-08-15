// src/routes/api/quizzes/+server.ts

import { pb } from '$lib/pocketbase';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// هذا الكود هو نفسه تقريباً الموجود في صفحتك، لكنه يرجع بيانات JSON فقط
		const page = parseInt(url.searchParams.get('page') || '1');
		const perPage = 12;
		const category = url.searchParams.get('category') || '';
		const difficulty = url.searchParams.get('difficulty') || '';
		const searchTerm = url.searchParams.get('search') || '';
		const sort = url.searchParams.get('sort') || '-created';

		const filterParts = ['published = true'];
		if (category) filterParts.push(`category = "${category}"`);
		if (difficulty) filterParts.push(`difficulty = "${difficulty}"`);
		if (searchTerm) filterParts.push(`(title ~ "${searchTerm}" || description ~ "${searchTerm}")`);

		const filter = filterParts.join(' && ');

		const quizzesResult = await pb.collection('quizzes').getList(page, perPage, {
			filter: filter,
			sort: sort
		});

		quizzesResult.items.forEach((quiz) => {
			if (quiz.cover_image) {
				quiz.cover_image_url = pb.files.getURL(quiz, quiz.cover_image);
			}
		});

		// الأهم: نرجع البيانات بصيغة JSON نقية
		return json(quizzesResult);
	} catch (err) {
		console.error('Error in /api/quizzes:', err);
		return json({ error: 'Failed to fetch quizzes' }, { status: 500 });
	}
};