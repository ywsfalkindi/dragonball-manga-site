import { pb } from '$lib/pocketbase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// تحميل تذكرة الدخول من الكوكيز في كل طلب
	pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	if (pb.authStore.isValid) {
		try {
			// تحديث بيانات المستخدم
			await pb.collection('users').authRefresh();
			event.locals.user = pb.authStore.model;
		} catch (_) {
			// إذا فشل التحديث (ربما التذكرة منتهية)، نمسحها
			pb.authStore.clear();
		}
	}

	const response = await resolve(event);

	// بعد إنشاء الاستجابة، نرسل تذكرة الدخول المحدثة للمتصفح
	response.headers.set('set-cookie', pb.authStore.exportToCookie({ httpOnly: false }));

	return response;
};