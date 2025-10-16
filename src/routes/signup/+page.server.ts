import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { pb } from '$lib/pocketbase';
import { signupSchema } from '$lib/schemas';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms/server';

// ======================= الاضافة تبدأ هنا =======================
import { RateLimiter } from 'sveltekit-rate-limiter/server';

// إعداد آلية تحديد الطلبات
// يسمح بإنشاء 5 حسابات جديدة فقط كل ساعة من نفس عنوان الـ IP
const limiter = new RateLimiter({
	rates: {
		IP: [5, 'h']
	}
});
// ======================= الاضافة تنتهي هنا =======================

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(signupSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { request, cookies } = event;
		const form = await superValidate(request, zod(signupSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// ======================= التعديل يبدأ هنا =======================
		// تطبيق آلية تحديد الطلبات على هذا الإجراء
		if (await limiter.isLimited(event)) {
			// نضيف رسالة خطأ عامة إلى النموذج لإبلاغ المستخدم
			form.errors._errors = ['لقد تجاوزت الحد المسموح به لإنشاء حسابات جديدة.'];
			return fail(429, { form }); // Status code for "Too Many Requests"
		}
		// ======================= التعديل ينتهي هنا =======================

		try {
			await pb.collection('users').create({
				...form.data,
				name: form.data.username,
				emailVisibility: true
			});
		} catch (err: any) {
			console.error('PocketBase Error:', err);
			const validationErrors = err.data?.data;

			if (
				validationErrors?.username?.code === 'validation_not_unique' ||
				validationErrors?.email?.code === 'validation_not_unique'
			) {
				form.errors.email = ['اسم المستخدم أو البريد الإلكتروني مسجل بالفعل.'];
				return fail(400, { form });
			}

			form.errors._errors = ['حدث خطأ ما أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.'];
			return fail(500, { form });
		}

		// تسجيل الدخول التلقائي بعد إنشاء الحساب
		try {
			await pb.collection('users').authWithPassword(form.data.email, form.data.password);
			cookies.set('pb_auth', pb.authStore.exportToCookie(), { path: '/' });
		} catch (err) {
			console.error('Auto-login Error:', err);
			// إذا فشل تسجيل الدخول التلقائي، نوجه المستخدم لصفحة تسجيل الدخول
			throw redirect(303, '/login');
		}

		// توجيه المستخدم إلى الصفحة الرئيسية بعد نجاح العملية
		throw redirect(303, '/');
	}
};