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

		const pageFromUrl = Number(url.searchParams.get('page'));
		let lastPageRead = 1;

		if (locals.user) {
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
						manga: manga.id,
						last_page_read: 1
					});
					await grantXp(locals.user.id, 25);
					lastPageRead = 1;
				}
			}
		}

		if (pageFromUrl > 0) {
			lastPageRead = pageFromUrl;
		}

		// --- بداية التعديل ---

		// 1. جلب كل التعليقات والردود دفعة واحدة
		const allCommentsRaw = await pb.collection('comments').getFullList({
			filter: `chapter = "${chapter.id}"`,
			sort: '-created',
			expand: 'user,likes'
		});

		// 2. تحويل سجلات PocketBase إلى كائنات JavaScript بسيطة ونظيفة
		const allComments = allCommentsRaw.map((c) => {
			// تشكيل كائن المستخدم بشكل آمن
			const userObject = c.expand?.user
				? {
						id: c.expand.user.id,
						username: c.expand.user.username,
						name: c.expand.user.name,
						avatarUrl: c.expand.user.avatar
							? pb.files.getURL(c.expand.user, c.expand.user.avatar, { thumb: '100x100' })
							: null
					}
				: null;

			// تشكيل الكائن النهائي للتعليق
			return {
				id: c.id,
				content: c.content,
				created: c.created,
				parentComment: c.parentComment || null,
				likes: c.expand?.likes?.map((like: any) => like.id) || [],
				user: userObject,
				replies: [] as any[] // سيتم ملؤه لاحقًا
			};
		});

		// 3. بناء هيكل الشجرة للتعليقات والردود
		const commentsById = new Map();
		const topLevelComments: any[] = [];

		allComments.forEach((c) => {
			commentsById.set(c.id, c);
		});

		allComments.forEach((c) => {
			if (c.parentComment && commentsById.has(c.parentComment)) {
				commentsById.get(c.parentComment).replies.push(c);
			} else {
				topLevelComments.push(c);
			}
		});

		// 4. فرز الردود داخل كل تعليق حسب تاريخ الإنشاء (الأقدم أولاً)
		topLevelComments.forEach((c) => {
			if (c.replies.length > 0) {
				c.replies.sort(
					(a: { created: string | number | Date }, b: { created: string | number | Date }) =>
						new Date(a.created).getTime() - new Date(b.created).getTime()
				);
			}
		});

		// --- نهاية التعديل ---

		const [pages, nextChapter] = await Promise.all([
			pb.collection('pages').getFullList({
				filter: `chapter = "${chapter.id}"`,
				sort: 'page_number'
			}),
			pb
				.collection('chapters')
				.getFirstListItem(
					`manga.id = "${manga.id}" && chapter_number = ${Number(params.chapter_number) + 1}`
				)
				.catch(() => null)
		]);

		pages.forEach((page) => {
			page.page_image_url = pb.files.getURL(page, page.image_path);
		});

		return {
			user: locals.user || null,
			manga,
			chapter,
			pages,
			comments: topLevelComments, // استخدام المتغير الجديد
			nextChapterExists: !!nextChapter,
			lastPageRead
		};
	} catch (err) {
		console.error('CRASH REPORT:', err);
		throw error(404, 'المانجا أو الفصل المطلوب غير موجود');
	}
};

export const actions: Actions = {
	addComment: async ({ locals, request, params }) => {
		if (!locals.user) {
			throw redirect(303, '/login');
		}

		const data = await request.formData();
		const rawContent = data.get('content') as string;
		const parentId = data.get('parentId') as string | null;

		if (!rawContent || rawContent.trim().length === 0) {
			return fail(400, { error: 'لا يمكن أن يكون التعليق فارغًا.' });
		}
		const content = purify.sanitize(rawContent);

		const manga = await pb.collection('mangas').getFirstListItem(`slug = "${params.slug}"`);
		const chapter = await pb
			.collection('chapters')
			.getFirstListItem(`manga.id = "${manga.id}" && chapter_number = ${params.chapter_number}`);

		try {
			const recordData = {
				content,
				user: locals.user.id,
				chapter: chapter.id,
				parentComment: parentId || null
			};

			const createdRecord = await pb.collection('comments').create(recordData);

			const newCommentRaw = await pb.collection('comments').getOne(createdRecord.id, {
				expand: 'user'
			});

			// تحويل السجل الجديد إلى كائن بسيط قبل إرساله
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
			console.error('Add comment error:', err);
			return fail(500, { error: 'حدث خطأ ما أثناء إرسال التعليق.' });
		}
	},

	toggleLike: async ({ locals, request }) => {
		if (!locals.user) {
			throw redirect(303, '/login');
		}

		const data = await request.formData();
		const commentId = data.get('commentId') as string;

		try {
			await pb.collection('comments').update(commentId, {
				'likes+': locals.user.id
			});

			try {
				const comment = await pb.collection('comments').getOne(commentId, { fields: 'user' });
				if (comment.user !== locals.user.id) {
					await grantXp(comment.user, 5);
				}
			} catch (xpError) {
				console.error('Failed to grant XP for like:', xpError);
			}
		} catch (err) {
			try {
				await pb.collection('comments').update(commentId, {
					'likes-': locals.user.id
				});
			} catch (innerErr) {
				return fail(500, { error: 'فشل التفاعل مع التعليق.' });
			}
		}

		return { success: true };
	}
};
