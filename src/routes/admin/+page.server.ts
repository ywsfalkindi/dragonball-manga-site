// src/routes/admin/+page.server.ts
import { pb } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// جلب البيانات الأساسية
	const [mangaRecords, chapterRecords, userRecords, commentRecords, readHistoryRecords] =
		await Promise.all([
			pb.collection('mangas').getFullList({ fields: 'id,title' }),
			pb.collection('chapters').getFullList({ fields: 'id' }),
			pb.collection('users').getFullList({ sort: '-created' }),
			pb.collection('comments').getFullList({
				sort: '-created',
				expand: 'user,chapter'
			}),
			// جلب سجل القراءة للتحليلات
			pb.collection('read_history').getFullList({ expand: 'manga' })
		]);

	// معالجة البيانات
	const latestUsers = userRecords.slice(0, 5);
	const latestComments = commentRecords.filter((c) => !c.isApproved).slice(0, 5);

	// حساب المانجا الأكثر قراءة
	const mangaReadCounts = new Map<string, { title: string; reads: number }>();
	for (const record of readHistoryRecords) {
		if (record.expand?.manga) {
			const mangaId = record.expand.manga.id;
			const mangaTitle = record.expand.manga.title;
			if (!mangaReadCounts.has(mangaId)) {
				mangaReadCounts.set(mangaId, { title: mangaTitle, reads: 0 });
			}
			mangaReadCounts.get(mangaId)!.reads++;
		}
	}

	const mostReadMangas = Array.from(mangaReadCounts.values())
		.sort((a, b) => b.reads - a.reads)
		.slice(0, 5);

	return {
		stats: {
			mangas: mangaRecords.length,
			chapters: chapterRecords.length,
			users: userRecords.length,
			comments: commentRecords.length
		},
		latestUsers,
		latestComments,
		mostReadMangas
	};
};
