// src/routes/admin/comments/+page.server.ts
import { pb } from '$lib/pocketbase';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
    const comments = await pb.collection('comments').getFullList({ 
        sort: '-created',
        expand: 'user,chapter' // جلب معلومات المستخدم والفصل
    });

    // جلب معلومات المانجا لكل فصل (قد يكون مكلفًا إذا كان عدد التعليقات كبيرًا جدًا)
    for(const comment of comments) {
        if (comment.expand?.chapter) {
            const manga = await pb.collection('mangas').getOne(comment.expand.chapter.manga);
            comment.expand.chapter.expand = { manga };
        }
    }

    return { comments };
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
    }
};