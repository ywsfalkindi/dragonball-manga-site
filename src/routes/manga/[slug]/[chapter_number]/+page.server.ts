// src/routes/manga/[slug]/[chapter_number]/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { grantXp } from '../../../../hooks.server';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export const load: PageServerLoad = async ({ locals, params }) => {
	try {
		const manga = await pb.collection('mangas').getFirstListItem(`slug = "${params.slug}"`);
		const chapter = await pb.collection('chapters').getFirstListItem(`manga.id = "${manga.id}" && chapter_number = ${params.chapter_number}`);

		if (locals.user) {
			try {
				// التحقق مما إذا كان المستخدم قد قرأ هذا الفصل من قبل لمنع تكرار XP
				await pb.collection('read_history').getFirstListItem(`user.id = "${locals.user.id}" && chapter.id = "${chapter.id}"`);
			} catch (err: any) {
				// إذا لم يقرأه من قبل (err.status === 404)
				if (err.status === 404) {
					await pb.collection('read_history').create({ user: locals.user.id, chapter: chapter.id, manga: manga.id });
					await grantXp(locals.user.id, 25); // ✨ منح 25 XP
				}
			}
		}

		// --- بداية التحسين لنظام التعليقات ---
        const topLevelComments = await pb.collection('comments').getFullList({
            filter: `chapter = "${chapter.id}" && parentComment = null`,
            sort: '-created',
            expand: 'user,likes'
        });

        const replies = await pb.collection('comments').getFullList({
            filter: `chapter = "${chapter.id}" && parentComment != null`,
            sort: '+created',
            expand: 'user,likes'
        });

        const commentsById = new Map();
        topLevelComments.forEach(c => {
            c.replies = [];
            commentsById.set(c.id, c);
        });
        replies.forEach(r => {
            const parent = commentsById.get(r.parentComment);
            if (parent) {
                parent.replies.push(r);
            }
        });

        const comments = topLevelComments;
        // --- نهاية التحسين ---

        const [pages, nextChapter] = await Promise.all([
            pb.collection('pages').getFullList({
                filter: `chapter = "${chapter.id}"`,
                sort: 'page_number'
            }),
            pb.collection('chapters').getFirstListItem(`manga.id = "${manga.id}" && chapter_number = ${Number(params.chapter_number) + 1}`).catch(() => null)
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
            nextChapterExists: !!nextChapter
        };

	} catch (err) {
		console.error("CRASH REPORT:", err);
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
    const parentId = data.get('parentId') as string | null; // <-- ✨ إضافة: استقبال parentId

    if (!rawContent || rawContent.trim().length === 0) {
        return fail(400, { error: 'لا يمكن أن يكون التعليق فارغًا.' });
    }
    
    const content = purify.sanitize(rawContent);
    
    const manga = await pb.collection('mangas').getFirstListItem(`slug = "${params.slug}"`);
    const chapter = await pb.collection('chapters').getFirstListItem(`manga.id = "${manga.id}" && chapter_number = ${params.chapter_number}`);

    try {
        await pb.collection('comments').create({
            content,
            user: locals.user.id,
            chapter: chapter.id,
            parentComment: parentId || null // <-- ✨ إضافة: حفظ parentId
        });
        await grantXp(locals.user.id, 10);
    } catch (err) {
        return fail(500, { error: 'حدث خطأ ما أثناء إرسال التعليق.' });
    }

    return { success: true };
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
                console.error("Failed to grant XP for like:", xpError);
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