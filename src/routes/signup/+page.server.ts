import { pb } from '$lib/pocketbase';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const username = data.get('username') as string;
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const passwordConfirm = data.get('passwordConfirm') as string;

		if (password.length < 8) {
			return fail(400, { error: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.' });
		}

		try {
			await pb.collection('users').create({
				username,
				email,
				password,
				passwordConfirm,
				emailVisibility: true
			});
		} catch (err: any) {
			console.error('Error creating user:', err);

			if (err.data?.data?.email?.code === 'validation_invalid_email') {
				return fail(400, { error: 'صيغة البريد الإلكتروني غير صحيحة.' });
			}
			if (err.data?.data?.username?.code === 'validation_not_unique') {
				return fail(400, { error: 'اسم المستخدم هذا محجوز بالفعل.' });
			}
			if (err.data?.data?.password?.code === 'validation_length_too_short') {
				return fail(400, { error: 'كلمة المرور قصيرة جدًا.' });
			}
			return fail(500, { error: 'فشل إنشاء الحساب. تأكد من أن البريد الإلكتروني أو اسم المستخدم غير مستخدمين.' });
		}

		throw redirect(303, '/login?registered=true');
	}
};