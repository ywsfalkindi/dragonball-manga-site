// src/routes/leaderboard/+page.server.ts
import { pb } from '$lib/pocketbase';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const userRecords = await pb.collection('users').getFullList({
            sort: '-power_level, -xp'
            // لا نحتاج فلتر للمشرفين هنا لأن بياناتهم ستعرض بشكل طبيعي
        });

        const users = userRecords.map(record => {
            const displayName = record.name && record.name.trim() !== '' ? record.name : record.username;
            return {
                id: record.id,
                displayName: displayName,
                power_level: record.power_level || 0,
                xp: record.xp || 0,
                title: record.title
            };
        });

        return { users };
    } catch (err) {
        console.error('Leaderboard page error:', err);
        throw error(500, 'لا يمكن تحميل لوحة الصدارة حالياً.');
    }
};