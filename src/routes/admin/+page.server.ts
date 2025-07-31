// src/routes/admin/+page.server.ts
import { pb } from '$lib/pocketbase';

export const load = async () => {
	// --- بداية التحسين: تشغيل جميع الطلبات في نفس الوقت ---
	const [mangaCount, chapterCount, userCount, commentCount] = await Promise.all([
		pb.collection('mangas').getFullList({ fields: 'id' }),
		pb.collection('chapters').getFullList({ fields: 'id' }),
		pb.collection('users').getFullList({ fields: 'id' }),
		pb.collection('comments').getFullList({ fields: 'id' })
	]);
	// --- نهاية التحسين ---

	return {
		stats: {
			mangas: mangaCount.length,
			chapters: chapterCount.length,
			users: userCount.length,
			comments: commentCount.length
		}
	};
};