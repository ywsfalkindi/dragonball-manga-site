import { z } from 'zod';
import { fail, redirect } from '@sveltejs/kit';
import { pb } from '$lib/pocketbase';
import { dev } from '$app/environment';
import type { Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { loginSchema } from '$lib/schemas';
import { RateLimiter } from 'sveltekit-rate-limiter/server';

// إعداد آلية تحديد الطلبات
const limiter = new RateLimiter({
	rates: {
		// ======================= التعديل يبدأ هنا =======================
		// تم تغيير "ip" إلى "IP" بحرف كبير
		IP: [10, 'm']
		// ======================= التعديل ينتهي هنا =======================
	}
});

export const load = async () => {
	const form = await superValidate(zod(loginSchema));
	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const { request, cookies } = event;
		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (await limiter.isLimited(event)) {
			return message(form, 'لقد تجاوزت الحد المسموح به من المحاولات، يرجى المحاولة لاحقاً.', {
				status: 429
			});
		}

		try {
			await pb.collection('users').authWithPassword(form.data.email, form.data.password);

			const cookieOptions = {
				path: '/',
				httpOnly: true,
				secure: !dev,
				sameSite: 'lax' as const,
				maxAge: 60 * 60 * 24 * 30
			};

			cookies.set('pb_auth', pb.authStore.exportToCookie(cookieOptions), cookieOptions);
		} catch (err: any) {
			console.error('Login Error:', err);
			return message(form, 'البريد الإلكتروني أو كلمة المرور غير صحيحة.', {
				status: 401
			});
		}

		throw redirect(303, '/');
	}
};
