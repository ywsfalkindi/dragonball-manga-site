import { pb } from '$lib/pocketbase';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const passwordConfirm = data.get('passwordConfirm') as string;

		try {
			await pb.collection('users').create({
				email,
				password,
				passwordConfirm
			});
		} catch (err: any) {
			console.error('Error creating user:', err);
			return { error: 'فشل إنشاء الحساب. تأكد من أن كلمة المرور قوية والبريد غير مستخدم.' };
		}

		// إذا نجح كل شيء، انقل المستخدم لصفحة تسجيل الدخول
		throw redirect(303, '/login');
	}
};