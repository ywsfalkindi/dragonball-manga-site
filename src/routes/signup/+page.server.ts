// src/routes/signup/+page.server.ts
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

		if (password !== passwordConfirm) {
			return fail(400, { error: 'كلمتا المرور غير متطابقتين.' });
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
			// **التحسين: تسجيل الخطأ الكامل للمساعدة في التشخيص**
			console.error('Full PocketBase Error Object:', JSON.stringify(err, null, 2));

			const validationErrors = err.data?.data;

			if (validationErrors) {
				// --- بداية التعديل ---
				// تم دمج التحقق من وجود المستخدم أو الإيميل في رسالة واحدة عامة لزيادة الأمان
				if (
					validationErrors.username?.code === 'validation_not_unique' ||
					validationErrors.email?.code === 'validation_not_unique'
				) {
					return fail(400, {
						error: 'اسم المستخدم أو البريد الإلكتروني مسجل بالفعل.'
					});
				}
				// --- نهاية التعديل ---

				if (validationErrors.username?.code === 'validation_invalid_username') {
					return fail(400, {
						error: 'اسم المستخدم غير صالح. لا يجب أن يحتوي على مسافات أو رموز خاصة.'
					});
				}
				if (validationErrors.passwordConfirm?.code === 'validation_values_not_equal') {
					return fail(400, { error: 'كلمتا المرور غير متطابقتين.' });
				}
				if (validationErrors.email?.code === 'validation_invalid_email') {
					return fail(400, { error: 'صيغة البريد الإلكتروني غير صحيحة.' });
				}
				if (validationErrors.password?.code === 'validation_length_too_short') {
					return fail(400, { error: 'كلمة المرور قصيرة جدًا.' });
				}
			}

			return fail(500, {
				error: 'فشل إنشاء الحساب. يرجى مراجعة إعدادات قاعدة البيانات (Create Rule).'
			});
		}

		throw redirect(303, '/login?registered=true');
	}
};