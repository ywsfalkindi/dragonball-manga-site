// src/routes/signup/+page.server.ts

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { pb } from '$lib/pocketbase';
import { signupSchema } from '$lib/schemas'; // <-- استيراد مخطط التحقق الجديد
import { zod } from 'sveltekit-superforms/adapters'; // <-- محول Zod لـ Superforms
import { superValidate } from 'sveltekit-superforms/server'; // <-- "السر" الكبير!

// هذه الدالة load تعمل قبل تحميل الصفحة
// نستخدمها لإنشاء نموذج فارغ مرتبط بمخطط Zod الخاص بنا
// هذا يضمن أن الواجهة الأمامية والخادم يتشاركان نفس "فهم" النموذج
export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(signupSchema))
	};
};

export const actions: Actions = {
	// هذا هو الـ "action" الرئيسي لإنشاء الحساب
	default: async ({ request, cookies }) => {
		// الخطوة 1: نستخدم superValidate للتحقق من البيانات القادمة من النموذج
		// مقابل مخطط Zod الذي عرفناه. الأمر بهذه البساطة!
		const form = await superValidate(request, zod(signupSchema));

		// الخطوة 2: إذا كانت البيانات غير صالحة (form.valid === false)
		// فإن superValidate سيعيد النموذج مع رسائل الخطأ تلقائياً. لا حاجة لكتابة أي كود إضافي!
		if (!form.valid) {
			return fail(400, { form });
		}

		// الخطوة 3: إذا كانت البيانات صالحة، نحاول إنشاء المستخدم في PocketBase
		try {
			await pb.collection('users').create({
				...form.data,
				name: form.data.username, // PocketBase يتوقع حقل "name" أيضاً
				emailVisibility: true
			});
		} catch (err: any) {
			// إذا حدث خطأ من PocketBase (مثل اسم مستخدم موجود بالفعل)
			console.error('PocketBase Error:', err);
			const validationErrors = err.data?.data;

			// نتعامل مع حالة "البريد الإلكتروني أو اسم المستخدم موجود بالفعل"
			if (
				validationErrors?.username?.code === 'validation_not_unique' ||
				validationErrors?.email?.code === 'validation_not_unique'
			) {
				// "سر" Superforms: نضيف الخطأ يدوياً إلى النموذج
				// ونربطه بالحقل الصحيح (email) ليعرض في المكان المناسب في الواجهة
				form.errors.email = ['اسم المستخدم أو البريد الإلكتروني مسجل بالفعل.'];
				return fail(400, { form });
			}

			// لأي خطأ آخر غير متوقع من الخادم
			form.errors._errors = ['حدث خطأ ما أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.'];
			return fail(500, { form });
		}

		// --- التحسين الذي تحدثنا عنه: تسجيل الدخول التلقائي ---
		try {
			await pb.collection('users').authWithPassword(form.data.email, form.data.password);
			cookies.set('pb_auth', pb.authStore.exportToCookie(), { path: '/' });
		} catch (authError) {
			console.error('Auto-login failed after signup:', authError);
			// كخطة بديلة، نوجهه لصفحة الدخول
			throw redirect(303, '/login?registered=true');
		}

		// نوجه المستخدم إلى صفحته الشخصية مباشرة
		throw redirect(303, '/profile');
	}
};
