// src/routes/quizzes/+page.server.ts

import { pb } from '$lib/pocketbase';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	try {
		// --- 1. قراءة كل المعايير من الرابط ---
		// للحصول على رقم الصفحة الحالية للتحميل التدريجي
		const page = parseInt(url.searchParams.get('page') || '1');
		const perPage = 12; // سنعرض 12 اختبارًا في كل صفحة

		// للحصول على قيم الفلترة والبحث والفرز
		const category = url.searchParams.get('category') || '';
		const difficulty = url.searchParams.get('difficulty') || '';
		const searchTerm = url.searchParams.get('search') || '';
		const sort = url.searchParams.get('sort') || '-created'; // الفرز الافتراضي هو الأحدث أولاً

		// --- 2. بناء جملة الفلترة بذكاء ---
		const filterParts = ['published = true'];
		if (category) {
			filterParts.push(`category = "${category}"`);
		}
		if (difficulty) {
			filterParts.push(`difficulty = "${difficulty}"`);
		}
		// إضافة البحث: سيبحث في العنوان والوصف
		if (searchTerm) {
			filterParts.push(`(title ~ "${searchTerm}" || description ~ "${searchTerm}")`);
		}
		const filter = filterParts.join(' && ');

		// --- 3. جلب دفعة من الاختبارات بدلاً من كلها ---
		// استبدلنا getFullList بـ getList للتحميل التدريجي
		const quizzesResult = await pb.collection('quizzes').getList(page, perPage, {
			filter: filter,
			sort: sort // تطبيق الفرز الديناميكي
		});

		// --- 4. جلب خيارات الفلترة ديناميكيًا ---
		// نجلب كل الاختبارات مرة واحدة فقط للحصول على التصنيفات والمستويات (هذا سريع لأننا نطلب حقلين فقط)
		const allQuizzesForFilters = await pb.collection('quizzes').getFullList({
			fields: 'category,difficulty' // نطلب فقط الحقول التي نحتاجها
		});
		// نستخدم Set لإزالة التكرار والحصول على قيم فريدة
		const categories = [...new Set(allQuizzesForFilters.map((q) => q.category).filter(Boolean))];
		const difficulties = [
			...new Set(allQuizzesForFilters.map((q) => q.difficulty).filter(Boolean))
		];

		// --- 5. توليد روابط الصور (كما كان) وإرسال البيانات ---
		quizzesResult.items.forEach((quiz) => {
			if (quiz.cover_image) {
				quiz.cover_image_url = pb.files.getURL(quiz, quiz.cover_image);
			}
		});

		return {
			quizzes: quizzesResult.items,
			// بيانات التحميل التدريجي
			currentPage: quizzesResult.page,
			totalPages: quizzesResult.totalPages,
			// بيانات الفلترة الديناميكية
			categories,
			difficulties,
			// قيم الفلترة الحالية لإبقائها في النموذج
			currentCategory: category,
			currentDifficulty: difficulty,
			currentSearch: searchTerm,
			currentSort: sort
		};
	} catch (err) {
		console.error('Error fetching data for quizzes page:', err);
		throw error(500, 'حدث خطأ ما أثناء تحميل الاختبارات. حاول مجددًا.');
	}
};
