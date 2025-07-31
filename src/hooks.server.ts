import { pb } from '$lib/pocketbase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	if (pb.authStore.isValid) {
		try {
			const user = await pb.collection('users').authRefresh();
			event.locals.user = user.record;

			if (user.record?.isAdmin) {
				event.locals.admin = true;
			}
		} catch (_) {
			pb.authStore.clear();
			event.locals.user = null;
			event.locals.admin = false;
		}
	}

	const response = await resolve(event);
    
	// <-- التغيير: تم تعديل الخيار httpOnly إلى true
	response.headers.set('set-cookie', pb.authStore.exportToCookie({ httpOnly: true, secure: true, sameSite: 'lax' }));
    
	return response;
};