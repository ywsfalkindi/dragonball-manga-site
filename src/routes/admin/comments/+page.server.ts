// src/routes/admin/comments/+page.server.ts
import { pb } from '$lib/pocketbase';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	// ✨ بداية التصحيح: جلب كل التعليقات مرة واحدة فقط ✨
	const allComments = await pb.collection('comments').getFullList({
		sort: '-created',
		expand: 'user,chapter.manga'
	});

	// ✨ ثم تصفية النتائج باستخدام JavaScript ✨
	const approvedComments = [];
	const pendingComments = [];

	for (const comment of allComments) {
		if (comment.isApproved) {
			approvedComments.push(comment);
		} else {
			pendingComments.push(comment);
		}
	}
	// ✨ نهاية التصحيح ✨

	// هذه الدالة مهمة لجلب معلومات المانجا التي لا تأتي مع الطلب الأول
	const processComments = async (comments: any[]) => {
		for (const comment of comments) {
			if (comment.expand?.chapter && !comment.expand.chapter.expand?.manga) {
				try {
					const manga = await pb.collection('mangas').getOne(comment.expand.chapter.manga);
					// التأكد من وجود expand object قبل إضافة المانجا إليه
					if (!comment.expand.chapter.expand) {
						comment.expand.chapter.expand = {};
					}
					comment.expand.chapter.expand.manga = manga;
				} catch (e) {
					// تجاهل الخطأ إذا لم يتم العثور على المانجا (قد تكون حذفت)
				}
			}
		}
		return comments;
	};

	return {
		approvedComments: await processComments(approvedComments),
		pendingComments: await processComments(pendingComments)
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

		try {
			await pb.collection('comments').update(commentId, { content });
		} catch (err) {
			return fail(500, { editError: 'فشل تعديل التعليق.' });
		}
		return { editSuccess: true, commentId, content };
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
