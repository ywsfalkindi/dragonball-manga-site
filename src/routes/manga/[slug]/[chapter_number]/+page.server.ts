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
						manga: manga.id,
						last_page_read: 1,
						reading_started_at: new Date().toISOString()
					});
					lastPageRead = 1;
				}
			}
		}

		if (pageFromUrl > 0 && lastPageRead <= 1) {
			lastPageRead = pageFromUrl;
		}
		
		const [pages, nextChapter, commentsResult] = await Promise.all([
			pb.collection('pages').getFullList({
				filter: `chapter = "${chapter.id}"`,
				sort: 'page_number'
			}),
			pb
				.collection('chapters')
				.getFirstListItem(
					`manga.id = "${manga.id}" && chapter_number = ${Number(params.chapter_number) + 1}`
				)
				.catch(() => null),
			pb.collection('comments').getList(1, 20, {
				filter: `chapter = "${chapter.id}" && parentComment = null`,
				sort: '-created',
				expand: 'user,likes'
			})
		]);

		// ✨ سطر مهم لضمان جاهزية الروابط ✨
		pages.forEach((page) => {
			page.page_image_url = pb.files.getURL(page, page.image_path);
		});
		
		const topLevelComments = commentsResult.items.map((c) => {
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

			return {
				id: c.id,
				content: c.content,
				created: c.created,
				parentComment: c.parentComment || null,
				likes: c.expand?.likes?.map((like: any) => like.id) || [],
				user: userObject,
				replies: []
			};
		});

		return {
			user: locals.user || null,
			manga,
			chapter,
			pages,
			comments: topLevelComments,
			commentsTotalPages: commentsResult.totalPages,
			nextChapterExists: !!nextChapter,
			lastPageRead
		};
	} catch (err) {
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

		if (!rawContent || rawContent.trim().length < 15) {
			return fail(400, { error: 'يجب أن يحتوي التعليق على 15 حرفًا على الأقل.' });
		}

		try {
			const lastComment = await pb
				.collection('comments')
				.getFirstListItem(`user.id = "${locals.user.id}"`, { sort: '-created' });

			const now = new Date();
			const lastCommentTime = new Date(lastComment.created);
			const differenceInSeconds = (now.getTime() - lastCommentTime.getTime()) / 1000;

			if (differenceInSeconds < 60) {
				return fail(429, { error: 'يرجى الانتظار دقيقة واحدة قبل إضافة تعليق جديد.' });
			}
		} catch (err: any) {
			if (err.status !== 404) {
				return fail(500, { error: 'حدث خطأ أثناء التحقق من التعليقات.' });
			}
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
			} else {
				await pb.collection('comments').update(commentId, {
					'likes+': userId
				});
				if (comment.user !== userId) {
					try {
						await grantXp(comment.user, 5);
					} catch (xpError) {
						// Ignore error
					}
				}
			}
		} catch (err) {
			return fail(500, { error: 'فشل التفاعل مع التعليق.' });
		}

		return { success: true };
	}
};