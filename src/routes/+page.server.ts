import { pb } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';
import type { EnrichedManga } from '$lib/types';

export const load: PageServerLoad = async ({ url }) => {
	const searchTerm = url.searchParams.get('q') || '';
	const sort = url.searchParams.get('sort') || '-created';
	const status = url.searchParams.get('status') || '';

	let filter = `title ~ "${searchTerm}"`;
	if (status) {
		filter += ` && status = "${status}"`;
	}

	const records = await pb.collection('mangas').getFullList({
		sort: sort,
		filter: filter,
		expand: 'latest_chapter' // Request PocketBase to include the latest chapter's data
	});

	// Process each record to add dynamic properties for the badges
	const enhancedRecords: EnrichedManga[] = records.map((record) => {
		// --- "New" badge logic ---
		let isNew = false;
		const latestChapter = record.expand?.latest_chapter;
		if (latestChapter) {
			const chapterDate = new Date(latestChapter.created);
			const now = new Date();
			const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
			if (now.getTime() - chapterDate.getTime() < sevenDaysInMs) {
				isNew = true;
			}
		}

		// --- "Trending" badge logic ---
		const TRENDING_THRESHOLD = 5000; // Any manga over 5000 views is considered trending
		const isTrending = record.views > TRENDING_THRESHOLD;

		return {
			...record,
			cover_image_url: pb.files.getURL(record, record.cover_image),
			isNew: isNew,
			isTrending: isTrending
		} as EnrichedManga; // Assert that the new object matches the EnrichedManga type
	});

	return {
		mangas: enhancedRecords,
		searchTerm: searchTerm || '',
		sort: sort,
		status: status
	};
};
