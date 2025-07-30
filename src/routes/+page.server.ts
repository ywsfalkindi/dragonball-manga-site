import { pb } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const searchTerm = url.searchParams.get('q') || '';

    const records = await pb.collection('mangas').getFullList({
        sort: '-created',
        filter: `title ~ "${searchTerm}"`
    });

    // 🔽 تم تصحيح الدالة هنا 🔽
    records.forEach(record => {
        record.cover_image_url = pb.files.getURL(record, record.cover_image);
    });

    return {
        mangas: records,
        searchTerm: searchTerm || ''
    };
};