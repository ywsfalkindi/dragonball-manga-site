import { pb } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const searchTerm = url.searchParams.get('q') || '';

	// قراءة متغيرات الفرز والتصفية من الرابط
	const sort = url.searchParams.get('sort') || '-created'; // الفرز الافتراضي هو الأحدث
	const status = url.searchParams.get('status') || ''; // لا يوجد فلتر افتراضي للحالة

	// بناء فلتر البحث
	let filter = `title ~ "${searchTerm}"`;
	if (status) {
		// إذا تم تحديد حالة، أضفها إلى الفلتر
		filter += ` && status = "${status}"`;
	}

	const records = await pb.collection('mangas').getFullList({
		sort: sort, // تطبيق الفرز
		filter: filter // تطبيق الفلتر
	});

	// 🔽 تم تصحيح الدالة هنا 🔽
	records.forEach((record) => {
		record.cover_image_url = pb.files.getURL(record, record.cover_image);
	});

	return {
		mangas: records,
		searchTerm: searchTerm || '',
		// إرسال قيم الفرز والتصفية الحالية إلى الصفحة
		sort: sort,
		status: status
	};
};
