// src/routes/manga/[slug]/[chapter_number]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { grantXp } from '../../../../hooks.server';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import type { RecordModel } from 'pocketbase';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const processComments = (comments: RecordModel[]) => {
	// <-- ✨ أضفنا النوع هنا
	comments.forEach((c: RecordModel) => {
		// <-- ✨ وأضفنا النوع هنا
		if (c.expand?.user && c.expand.user.avatar) {
			// إذا كان للمستخدم صورة رمزية، قم بإنشاء رابط كامل لها
			c.expand.user.avatarUrl = pb.files.getURL(c.expand.user, c.expand.user.avatar, {
				thumb: '100x100'
			});
		}
	});
	return comments;
};

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

		let topLevelComments = await pb.collection('comments').getFullList({
			filter: `chapter = "${chapter.id}" && parentComment = null`,
			sort: '-created',
			expand: 'user,likes'
		});

		let replies = await pb.collection('comments').getFullList({
			filter: `chapter = "${chapter.id}" && parentComment != null`,
			sort: '+created',
			expand: 'user,likes'
		});

		// معالجة التعليقات والردود لإنشاء روابط الصور
		topLevelComments = processComments(topLevelComments);
		replies = processComments(replies);

		const commentsById = new Map();
		topLevelComments.forEach((c) => {
			c.replies = [];
			commentsById.set(c.id, c);
		});
		replies.forEach((r) => {
			const parent = commentsById.get(r.parentComment);
			if (parent) {
				parent.replies.push(r);
			}
		});

		const comments = topLevelComments;

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
			comments,
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
			// 1. تجهيز بيانات التعليق
			const recordData = {
				content,
				user: locals.user.id,
				chapter: chapter.id,
				parentComment: parentId || null
			};

			// 2. إنشاء التعليق مرة واحدة فقط
			const createdRecord = await pb.collection('comments').create(recordData);

			// 3. طلب السجل مرة أخرى مع تضمين بيانات المستخدم
			const newComment = await pb.collection('comments').getOne(createdRecord.id, {
				expand: 'user'
			});

			// 4. معالجة التعليق لإنشاء رابط الصورة الرمزية
			if (newComment.expand?.user && newComment.expand.user.avatar) {
				newComment.expand.user.avatarUrl = pb.files.getURL(
					newComment.expand.user,
					newComment.expand.user.avatar,
					{
						thumb: '100x100'
					}
				);
			}

			// 5. منح نقاط الخبرة
			await grantXp(locals.user.id, 10);

			// 6. إعادة التعليق الجديد والكامل إلى الواجهة الأمامية
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
			// PocketBase يستخدم `+=` و `-=` لتعديل العلاقات المتعددة
			await pb.collection('comments').update(commentId, {
				'likes+': locals.user.id
			});

			try {
				const comment = await pb.collection('comments').getOne(commentId, { fields: 'user' });
				// نتأكد أن المستخدم لا يعجب بتعليقه الخاص
				if (comment.user !== locals.user.id) {
					await grantXp(comment.user, 5); // منح 5 XP لصاحب التعليق
				}
			} catch (xpError) {
				// تجاهل الخطأ في حال فشل منح XP حتى لا يؤثر على الإعجاب
				console.error('Failed to grant XP for like:', xpError);
			}
		} catch (err) {
			// إذا كان المستخدم قد أعجب به بالفعل، سيحدث خطأ، لذا سنقوم بإزالة الإعجاب
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
