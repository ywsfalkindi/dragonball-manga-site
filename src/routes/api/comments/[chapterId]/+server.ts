// src/routes/api/comments/[chapterId]/+server.ts

import { pb } from '$lib/pocketbase';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
	const chapterId = params.chapterId;
	const page = Number(url.searchParams.get('page')) || 1; // رقم الصفحة المطلوب من الرابط

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

		// نعالج البيانات بنفس الطريقة تماماً كما في page.server.ts
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
