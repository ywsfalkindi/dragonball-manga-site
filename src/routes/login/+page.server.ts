import { pb } from '$lib/pocketbase';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		try {
			await pb.collection('users').authWithPassword(email, password);

			// هنا السر: نحفظ بيانات المصادقة في كوكيز المتصفح
			cookies.set('pb_auth', pb.authStore.exportToCookie(), { path: '/' });
		} catch (err) {
			console.error('Login failed:', err);
			return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
		}

		// إذا نجح تسجيل الدخول، انقل المستخدم للصفحة الرئيسية
		throw redirect(303, '/');
	}
};
