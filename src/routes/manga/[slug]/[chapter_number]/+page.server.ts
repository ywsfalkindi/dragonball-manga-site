import { pb } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	try {
		// أولاً، نحتاج لمعلومات المانجا لإنشاء روابط التنقل
		const manga = await pb.collection('mangas').getFirstListItem(`slug = "${params.slug}"`);

		// ثانيًا، نحضر معلومات الفصل المحدد
		const chapter = await pb.collection('chapters').getFirstListItem(`manga = "${manga.id}" && chapter_number = ${params.chapter_number}`);

		// ثالثًا، نحضر كل الصفحات التابعة لهذا الفصل، ونرتبها حسب رقم الصفحة
		const pages = await pb.collection('pages').getFullList({
			filter: `chapter = "${chapter.id}"`,
			sort: 'page_number' // الترتيب مهم جدًا هنا
		});

        // نضيف رابط الصورة الكامل لكل صفحة
        pages.forEach(page => {
            page.page_image_url = pb.getFileUrl(page, page.page_image);
        });

		// أخيرًا، نرسل كل شيء للواجهة
		return {
			manga,
			chapter,
			pages
		};

	} catch (err) {
		// إذا لم يجد الفصل أو المانجا، يعرض صفحة خطأ 404
		console.error("Error loading chapter data:", err);
		throw error(404, 'المانجا أو الفصل المطلوب غير موجود');
	}
};