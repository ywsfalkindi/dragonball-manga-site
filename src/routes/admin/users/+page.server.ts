// src/routes/admin/users/+page.server.ts
import { pb } from '$lib/pocketbase';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
    const users = await pb.collection('users').getFullList({ sort: '-created' });
    return { users };
};

export const actions: Actions = {
    toggleAdmin: async ({ request }) => {
        const formData = await request.formData();
        const userId = formData.get('userId') as string;
        const currentIsAdmin = formData.get('isAdmin') === 'true';

        try {
            await pb.collection('users').update(userId, {
                isAdmin: !currentIsAdmin
            });
        } catch (err) {
            return fail(500, { error: 'فشل تغيير صلاحيات المستخدم.' });
        }

        return { success: true };
    },

    toggleBan: async ({ request }) => {
        const formData = await request.formData();
        const userId = formData.get('userId') as string;
        const currentIsBanned = formData.get('isBanned') === 'true';

        try {
            await pb.collection('users').update(userId, {
                banned: !currentIsBanned
            });
        } catch (err) {
            return fail(500, { error: 'فشل تغيير حالة حظر المستخدم.' });
        }

        return { success: true };
    }
};