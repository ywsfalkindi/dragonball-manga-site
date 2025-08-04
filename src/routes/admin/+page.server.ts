// src/routes/admin/+page.server.ts
import { pb } from '$lib/pocketbase';

export const load = async () => {
	// ✨ بداية التصحيح: تم تغيير طريقة جلب البيانات لتجنب الإلغاء التلقائي ✨
	const [mangaRecords, chapterRecords, userRecords, commentRecords] = await Promise.all([
		pb.collection('mangas').getFullList({ fields: 'id' }),
		pb.collection('chapters').getFullList({ fields: 'id' }),
		// 1. جلب كل المستخدمين مرة واحدة فقط، مع الفرز للحصول على الأحدث
		pb.collection('users').getFullList({ sort: '-created' }),
		// 2. جلب كل التعليقات مرة واحدة فقط، مع البيانات اللازمة للتصفية
		pb.collection('comments').getFullList({
			sort: '-created',
			expand: 'user,chapter'
		})
	]);

	// 3. معالجة البيانات بعد جلبها بدلاً من إرسال طلبات متعددة
	const latestUsers = userRecords.slice(0, 5);
	const latestComments = commentRecords.filter((c) => !c.isApproved).slice(0, 5);
	// ✨ نهاية التصحيح ✨

	return {
		stats: {
			mangas: mangaRecords.length,
			chapters: chapterRecords.length,
			users: userRecords.length,
			comments: commentRecords.length
		},
		latestUsers,
		latestComments
	};
};