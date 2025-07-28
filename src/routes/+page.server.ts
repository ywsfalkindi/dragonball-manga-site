import { pb } from '$lib/pocketbase'; // نستدعي اتصالنا من الملف المركزي
import type { PageServerLoad } from './$types';

// هذه الدالة السحرية تعمل دائمًا قبل تحميل الصفحة
export const load: PageServerLoad = async () => {
	// اذهب إلى صندوق 'mangas' وأحضر لي كل السجلات
	const records = await pb.collection('mangas').getFullList({
		sort: '-created' // رتبها من الأحدث إلى الأقدم
	});

    // PocketBase يعطينا اسم الملف فقط، نحتاج لبناء الرابط الكامل للصورة
    records.forEach(record => {
        record.cover_image_url = pb.getFileUrl(record, record.cover_image);
    });


	// أرسل البيانات التي أحضرتها إلى الصفحة لكي تعرضها
	return {
		mangas: records
	};
};