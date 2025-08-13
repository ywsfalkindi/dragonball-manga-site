import { z } from 'zod';
import { fail, redirect } from '@sveltejs/kit';
import { pb } from '$lib/pocketbase';
import { dev } from '$app/environment';
import type { Actions } from './$types';

// السر الأول: تعريف مخطط للبيانات المتوقعة باستخدام Zod
// هذا يضمن أننا لن نحاول حتى الاتصال بقاعدة البيانات ببيانات غير صالحة.
const loginSchema = z.object({
	email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صالح.' }),
	password: z.string().min(8, { message: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.' })
});

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		// التحقق من البيانات باستخدام المخطط الذي عرفناه
		const result = loginSchema.safeParse(data);

		// إذا فشل التحقق، نستخدم `fail` لإرجاع الأخطاء مع البيانات التي أدخلها المستخدم
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, {
				errors: {
					email: errors.email?.[0],
					password: errors.password?.[0]
				},
				data: {
					email: data.email
				}
			});
		}

		try {
			// الآن فقط، بعد التأكد من صحة البيانات، نتحدث مع PocketBase
			await pb.collection('users').authWithPassword(result.data.email, result.data.password);

			// السر الثالث: تأمين الـ Cookie بأفضل الممارسات
			const cookieOptions = {
				path: '/',
				httpOnly: true, // لا يمكن الوصول إليها من خلال JavaScript
				secure: !dev, // تُرسل فقط عبر HTTPS في بيئة الإنتاج
				sameSite: 'lax' as const, // حماية ضد هجمات CSRF
				maxAge: 60 * 60 * 24 * 30 // صلاحية لمدة 30 يومًا
			};

			cookies.set('pb_auth', pb.authStore.exportToCookie(cookieOptions), cookieOptions);
		} catch (err: any) {
			console.error('Login failed:', err);
			// إرجاع خطأ عام في حال فشل المصادقة من PocketBase
			return fail(401, {
				error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
				data: {
					email: result.data.email
				}
			});
		}

		// إذا نجح كل شيء، أعد توجيه المستخدم
		throw redirect(303, '/');
	}
};
