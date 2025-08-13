import { z } from 'zod';

// قمنا بفصل تعريف الكائن عن دالة .refine
// هذا يساعد TypeScript على فهم نوع البيانات بشكل صحيح ويحل الخطأ
const SignupFormObject = z.object({
	// اسم المستخدم: يجب أن يكون نصاً، وبطول 3 أحرف على الأقل.
	username: z.string().min(3, { message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' }),

	// البريد الإلكتروني: يجب أن يكون نصاً وبصيغة بريد إلكتروني صحيحة.
	email: z.string().email({ message: 'صيغة البريد الإلكتروني غير صحيحة' }),

	// كلمة المرور: يجب أن تكون نصاً، وبطول 8 أحرف على الأقل.
	password: z.string().min(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }),

	// تأكيد كلمة المرور: نفس شروط كلمة المرور.
	passwordConfirm: z.string().min(8, { message: 'يجب تأكيد كلمة المرور' })
});

// الآن نطبق دالة .refine على الكائن الذي عرفناه بالأعلى
export const signupSchema = SignupFormObject.refine(
	(data) => {
		// الآن TypeScript يعرف أن 'data' تحتوي على الحقول التي عرفناها أعلاه
		return data.password === data.passwordConfirm;
	},
	{
		message: 'كلمتا المرور غير متطابقتين',
		path: ['passwordConfirm'] // نحدد أن هذا الخطأ يتعلق بحقل "تأكيد كلمة المرور".
	}
);
