// src/routes/admin/comments/+page.server.ts
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { pb } from '$lib/pocketbase';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { RecordModel } from 'pocketbase';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export const load: PageServerLoad = async () => {
	// --- بداية الحل الجديد: جلب البيانات بشكل أكثر موثوقية ---

	// 1. جلب كل التعليقات مع توسيع العلاقات الأساسية فقط
	const allComments = await pb.collection('comments').getFullList({
		sort: '-created',
		expand: 'user,chapter' // ملاحظة: تم تبسيط expand هنا
	});

	// 2. تجميع كل المعرفات الفريدة للمستخدمين والفصول والمانجا
	const userIds = new Set<string>();
	const chapterIds = new Set<string>();
	const mangaIds = new Set<string>();

	allComments.forEach((comment) => {
		if (comment.user) userIds.add(comment.user);
		if (comment.expand?.chapter) {
			chapterIds.add(comment.expand.chapter.id);
			if (comment.expand.chapter.manga) {
				mangaIds.add(comment.expand.chapter.manga);
			}
		}
	});

	// 3. جلب كل المستخدمين والمانجا المرتبطة في طلبات مجمعة
	const [users, mangas] = await Promise.all([
		userIds.size > 0
			? pb.collection('users').getFullList({
					filter: Array.from(userIds)
						.map((id) => `id = "${id}"`)
						.join(' || ')
				})
			: Promise.resolve([]),
		mangaIds.size > 0
			? pb.collection('mangas').getFullList({
					filter: Array.from(mangaIds)
						.map((id) => `id = "${id}"`)
						.join(' || ')
				})
			: Promise.resolve([])
	]);

	// 4. إنشاء خرائط للوصول السريع للبيانات
	const usersById = new Map<string, RecordModel>(users.map((u) => [u.id, u]));
	const mangasById = new Map<string, RecordModel>(mangas.map((m) => [m.id, m]));

	// 5. بناء كائن التعليقات الكامل يدويًا لضمان وجود كل البيانات
	const processedComments = allComments.map((comment) => {
		// التأكد من وجود كائن expand
		if (!comment.expand) comment.expand = {};

		// إرفاق بيانات المستخدم من الخريطة
		if (comment.user && usersById.has(comment.user)) {
			comment.expand.user = usersById.get(comment.user);
		}

		// إرفاق بيانات المانجا داخل الفصل
		if (
			comment.expand.chapter &&
			comment.expand.chapter.manga &&
			mangasById.has(comment.expand.chapter.manga)
		) {
			if (!comment.expand.chapter.expand) {
				comment.expand.chapter.expand = {};
			}
			comment.expand.chapter.expand.manga = mangasById.get(comment.expand.chapter.manga);
		}
		return comment;
	});

	// 6. تصفية النتائج النهائية
	const approvedComments = [];
	const pendingComments = [];

	for (const comment of processedComments) {
		if (comment.isApproved) {
			approvedComments.push(comment);
		} else {
			pendingComments.push(comment);
		}
	}

	// --- نهاية الحل الجديد ---

	return {
		approvedComments,
		pendingComments
	};
};

export const actions: Actions = {
	deleteComment: async ({ request }) => {
		const formData = await request.formData();
		const commentId = formData.get('commentId') as string;
		try {
			await pb.collection('comments').delete(commentId);
		} catch (err) {
			return fail(500, { error: 'فشل حذف التعليق.' });
		}
		return { success: true };
	},

	editComment: async ({ request }) => {
		const formData = await request.formData();
		const commentId = formData.get('commentId') as string;
		const content = formData.get('content') as string;

		if (!content) {
			return fail(400, { editError: 'لا يمكن أن يكون محتوى التعليق فارغًا.' });
		}

		const sanitizedContent = purify.sanitize(content, {
			ALLOWED_TAGS: ['br', 'strong', 'em', 'u', 's'] // اختياري: حدد التنسيقات المسموحة
		});

		try {
			await pb.collection('comments').update(commentId, { content: sanitizedContent });
		} catch (err) {
			return fail(500, { editError: 'فشل تعديل التعليق.' });
		}
		return { editSuccess: true, commentId, content: sanitizedContent };
	},

	approveComment: async ({ request }) => {
		const formData = await request.formData();
		const commentId = formData.get('commentId') as string;

		try {
			await pb.collection('comments').update(commentId, { isApproved: true });
		} catch (err) {
			return fail(500, { error: 'فشلت الموافقة على التعليق.' });
		}
		return { success: true };
	}
};
