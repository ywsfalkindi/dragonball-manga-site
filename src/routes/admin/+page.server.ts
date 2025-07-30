import { pb } from '$lib/pocketbase';

export const load = async () => {
	const mangaCount = await pb.collection('mangas').getFullList({ fields: 'id' });
	const chapterCount = await pb.collection('chapters').getFullList({ fields: 'id' });
	const userCount = await pb.collection('users').getFullList({ fields: 'id' });
	const commentCount = await pb.collection('comments').getFullList({ fields: 'id' });

	return {
		stats: {
			mangas: mangaCount.length,
			chapters: chapterCount.length,
			users: userCount.length,
			comments: commentCount.length
		}
	};
};