// src/routes/api/comments/[chapterId]/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';

// --- استيراد المكتبات اللازمة للأمان ---
import { z } from 'zod';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { RateLimiter } from 'sveltekit-rate-limiter/server';

const limiter = new RateLimiter({
	IP: [5, 'm']
});

// GET handler (from original file)
export const GET: RequestHandler = async ({ params, url }) => {
	const chapterId = params.chapterId;
	const page = Number(url.searchParams.get('page')) || 1;

	if (!chapterId) {
		return json({ error: 'Chapter ID is required' }, { status: 400 });
	}

	try {
		const COMMENTS_PER_PAGE = 20;

		const commentsResult = await pb.collection('comments').getList(page, COMMENTS_PER_PAGE, {
			filter: `chapter = "${chapterId}" && parentComment = null`,
			sort: '-created',
			expand: 'user,likes'
		});

		const comments = commentsResult.items.map((c) => {
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

		return json({
			comments: comments,
			totalPages: commentsResult.totalPages
		});
	} catch (err: any) {
		console.error('API Error fetching comments:', err);
		return json({ error: 'Failed to fetch comments.' }, { status: 500 });
	}
};

// --- بداية الكود الجديد والآمن لإضافة تعليق ---

// نحتاج لإنشاء بيئة DOM وهمية على الخادم لكي يعمل DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// مخطط التحقق من المدخلات باستخدام Zod
const addCommentSchema = z.object({
	content: z.string().trim().min(1, { message: 'التعليق لا يمكن أن يكون فارغاً' }),
	parentComment: z.string().optional().nullable()
});

export const POST: RequestHandler = async (event) => {
	// <-- ✅ التعديل هنا
	const { request, locals, params } = event;

	// 2. نمرر الكائن "event" بالكامل إلى المحدّد
	if (await limiter.isLimited(event)) {
		return json({ error: 'لقد تجاوزت حد الطلبات، يرجى المحاولة لاحقاً' }, { status: 429 });
	}

	if (!locals.user) {
		return json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
	}

	try {
		const body = await request.json();
		// 1. التحقق من صحة البيانات القادمة
		const parsedBody = addCommentSchema.parse(body);

		// 2. تنقية المحتوى على الخادم لمنع حقن أي أكواد خبيثة
		const sanitizedContent = purify.sanitize(parsedBody.content);

		const data = {
			content: sanitizedContent, // استخدام المحتوى الآمن
			user: locals.user.id,
			chapter: params.chapterId,
			parentComment: parsedBody.parentComment || null
		};

		const record = await pb.collection('comments').create(data);
		// لإعادة التعليق الجديد مع بيانات المستخدم، نقوم بعمل expand
		// لإعادة التعليق الجديد مع بيانات المستخدم، نقوم بعمل expand
		const newComment = await pb.collection('comments').getOne(record.id, { expand: 'user' });

		// --- بداية الإضافة الأمنية (تنقية الرد) ---
		// نقوم بتصفية بيانات المستخدم تماماً كما في دالة GET
		const userObject = newComment.expand?.user
			? {
					id: newComment.expand.user.id,
					username: newComment.expand.user.username,
					name: newComment.expand.user.name,
					avatarUrl: newComment.expand.user.avatar
						? pb.files.getURL(newComment.expand.user, newComment.expand.user.avatar, {
								thumb: '100x100'
							})
						: null
					// يمكنك إضافة حقل المشرف إذا أردت
					// isAdmin: newComment.expand.user.isAdmin || false
				}
			: null;

		const safeCommentResponse = {
			id: newComment.id,
			content: newComment.content,
			created: newComment.created,
			parentComment: newComment.parentComment || null,
			likes: [], // التعليق الجديد ليس له لايكات بعد
			user: userObject,
			replies: []
		};
		// --- نهاية الإضافة الأمنية ---

		return json(safeCommentResponse, { status: 201 }); // إرجاع الكائن الآمن
	} catch (err: any) {
		if (err instanceof z.ZodError) {
			return json({ error: 'البيانات المرسلة غير صالحة', details: err.errors }, { status: 400 });
		}
		console.error('API Error adding comment:', err);
		return json({ error: 'حدث خطأ أثناء إضافة التعليق' }, { status: 500 });
	}
};
// --- نهاية الكود الجديد ---
