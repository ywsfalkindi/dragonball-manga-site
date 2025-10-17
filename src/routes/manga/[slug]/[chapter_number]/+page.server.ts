// src/routes/manga/[slug]/[chapter_number]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { grantXp } from '../../../../hooks.server';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export const load: PageServerLoad = async ({ locals, params, url }) => {
	try {
		const manga = await pb.collection('mangas').getFirstListItem(`slug = "${params.slug}"`);
		const chapter = await pb
			.collection('chapters')
			.getFirstListItem(`manga.id = "${manga.id}" && chapter_number = ${params.chapter_number}`);

		let lastPageRead = 1;
		const pageFromUrl = Number(url.searchParams.get('page'));

		if (locals.user && locals.user.id) {
			try {
				const historyRecord = await pb
					.collection('read_history')
					.getFirstListItem(`user.id = "${locals.user.id}" && chapter.id = "${chapter.id}"`);
				lastPageRead = historyRecord.last_page_read || 1;
			} catch (err: any) {
				if (err.status === 404) {
					await pb.collection('read_history').create({
						user: locals.user.id,
						chapter: chapter.id,
						last_page_read: 1
					});
				} else {
					console.error('Error fetching read history:', err);
				}
			}
		}

		if (pageFromUrl && pageFromUrl > 0) {
			lastPageRead = pageFromUrl;
		}

		const pages = await pb.collection('pages').getFullList({
			filter: `chapter.id = "${chapter.id}"`,
			sort: 'page_number'
		});

		const nextChapterExists =
			(await pb.collection('chapters').getList(1, 1, {
				filter: `manga.id = "${manga.id}" && chapter_number > ${params.chapter_number}`
			})) .items.length > 0;

		const commentsResult = await pb.collection('comments').getList(1, 20, {
			filter: `chapter = "${chapter.id}" && parentComment = null && isApproved = true`,
			sort: '-created',
			expand: 'user,likes'
		});

		const comments = commentsResult.items.map((c) => {
			const userObject = c.expand?.user
				? {
						id: c.expand.user.id,
						username: c.expand.user.username,
						name: c.expand.user.name,
						isAdmin: c.expand.user.isAdmin, // ✨ تأكد من إضافة هذا الحقل
						avatarUrl: c.expand.user.avatar
							? pb.files.getURL(c.expand.user, c.expand.user.avatar, { thumb: '100x100' })
							: null
					}
				: null;

			return {
				id: c.id,
				content: c.content,
				created: c.created,
				parentComment: c.parentComment || null,
				likes: c.expand?.likes?.map((like: any) => like.id) || [],
				user: userObject,
				replies: [] // سيتم التعامل مع الردود في الواجهة
			};
		});

		return {
			user: locals.user,
			manga,
			chapter,
			pages,
			nextChapterExists,
			comments,
			commentsTotalPages: commentsResult.totalPages,
			lastPageRead
		};
	} catch (err) {
		console.error(err);
		throw error(404, 'المانجا أو الفصل غير موجود.');
	}
};

export const actions: Actions = {
	addComment: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'يجب عليك تسجيل الدخول أولاً' });
		}
		try {
			const formData = await request.formData();
			const content = formData.get('content') as string;
			const parentId = formData.get('parentId') as string;
			const chapter = await pb
				.collection('chapters')
				.getFirstListItem(`chapter_number = ${params.chapter_number} && manga.slug = "${params.slug}"`);

			if (!content) {
				return fail(400, { error: 'لا يمكن أن يكون محتوى التعليق فارغًا.' });
			}

			const sanitizedContent = purify.sanitize(content);

			const data = {
				content: sanitizedContent,
				user: locals.user.id,
				chapter: chapter.id,
				parentComment: parentId || null,
				isApproved: !parentId // الردود تتم الموافقة عليها تلقائياً
			};

			const newCommentRaw = await pb.collection('comments').create(data, { expand: 'user' });
			const newComment = {
				id: newCommentRaw.id,
				content: newCommentRaw.content,
				created: newCommentRaw.created,
				parentComment: newCommentRaw.parentComment || null,
				likes: [],
				user: newCommentRaw.expand?.user
					? {
							id: newCommentRaw.expand.user.id,
							username: newCommentRaw.expand.user.username,
							name: newCommentRaw.expand.user.name,
							avatarUrl: newCommentRaw.expand.user.avatar
								? pb.files.getURL(newCommentRaw.expand.user, newCommentRaw.expand.user.avatar, {
										thumb: '100x100'
									})
								: null
						}
					: null,
				replies: []
			};

			await grantXp(locals.user.id, 10);
			return { success: true, newComment };
		} catch (err) {
			return fail(500, { error: 'حدث خطأ ما أثناء إرسال التعليق.' });
		}
	},

	toggleLike: async ({ locals, request }) => {
		if (!locals.user) {
			throw redirect(303, '/login');
		}

		const data = await request.formData();
		const commentId = data.get('commentId') as string;
		const userId = locals.user.id;

		try {
			const comment = await pb.collection('comments').getOne(commentId, {
				fields: 'user,likes'
			});

			const isAlreadyLiked = comment.likes?.includes(userId);

			if (isAlreadyLiked) {
				await pb.collection('comments').update(commentId, {
					'likes-': userId
				});
				if (comment.user !== userId) {
					await grantXp(comment.user, -5);
				}
			} else {
				await pb.collection('comments').update(commentId, {
					'likes+': userId
				});
				if (comment.user !== userId) {
					await grantXp(comment.user, 5);
				}
			}
		} catch (err) {
			console.error('Error toggling like:', err);
			return fail(500, { error: 'حدث خطأ ما.' });
		}
		return { success: true };
	},

	// ✨ بداية الإضافة الجديدة ✨
	deleteComment: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'يجب تسجيل الدخول للحذف' });
		}

		const formData = await request.formData();
		const commentId = formData.get('commentId') as string;

		try {
			// لا داعي لجلب التعليق، قواعد الـ API في Pocketbase ستحمي من الحذف غير المصرح به
			await pb.collection('comments').delete(commentId);
			return { deleteSuccess: true };
		} catch (err: any) {
			console.error('Delete Comment Error:', err);
			return fail(500, { error: 'حدث خطأ أثناء حذف التعليق.' });
		}
	},

	editComment: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'يجب تسجيل الدخول للتعديل' });
		}

		const formData = await request.formData();
		const commentId = formData.get('commentId') as string;
		const content = formData.get('content') as string;

		if (!content || content.trim().length === 0) {
			return fail(400, { error: 'لا يمكن أن يكون التعليق فارغًا.' });
		}
		// تنقية المحتوى الجديد
		const sanitizedContent = purify.sanitize(content);

		try {
			// قواعد الـ API في Pocketbase ستتحقق من الصلاحية
			const updatedComment = await pb
				.collection('comments')
				.update(commentId, { content: sanitizedContent });
			return { editSuccess: true, updatedComment };
		} catch (err: any) {
			console.error('Edit Comment Error:', err);
			return fail(500, { error: 'حدث خطأ أثناء تعديل التعليق.' });
		}
	}
	// ✨ نهاية الإضافة الجديدة ✨
};