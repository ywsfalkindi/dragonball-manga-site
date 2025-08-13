<script lang="ts">
	// يا صديقي، انظر كم أصبح جزء السكريبت بسيطاً ونظيفاً!
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms/client';

	export let data: PageData;

	// هذا هو "السر" في الواجهة الأمامية.
	// `superForm` يأخذ البيانات من الخادم (التي أنشأناها في دالة load)
	// ويوفر لنا "مخازن" (stores) سحرية لإدارة حالة النموذج.
	const { form, errors, enhance, submitting } = superForm(data.form);

	// لم نعد بحاجة لمتغيرات `password`, `passwordConfirm`, `clientError`
	// `superForm` يتكفل بكل شيء!

	// --- تحسين مؤشر قوة كلمة المرور ---
	// سنربطه مباشرة بمتغير النموذج من superForm
	$: password = $form.password || '';

	let passwordStrength = {
		score: 0,
		text: '',
		color: 'bg-gray-600'
	};

	// نفس دالة التحقق من قوة كلمة المرور، لكنها الآن أكثر تكاملاً
	function checkPasswordStrength(p: string) {
		let score = 0;
		if (!p) {
			score = -1;
		} else {
			if (p.length > 8) score++;
			if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
			if (/\d/.test(p)) score++;
			if (/[^a-zA-Z0-9]/.test(p)) score++;
		}

		passwordStrength.score = score;

		switch (score) {
			case 1:
				passwordStrength.text = 'ضعيفة';
				passwordStrength.color = 'bg-red-500';
				break;
			case 2:
				passwordStrength.text = 'متوسطة';
				passwordStrength.color = 'bg-yellow-500';
				break;
			case 3:
				passwordStrength.text = 'جيدة';
				passwordStrength.color = 'bg-blue-500';
				break;
			case 4:
				passwordStrength.text = 'قوية';
				passwordStrength.color = 'bg-green-500';
				break;
			default:
				passwordStrength.text = '';
				passwordStrength.color = 'bg-gray-600';
		}
	}

	$: checkPasswordStrength(password);
</script>

<svelte:head>
	<title>إنشاء حساب جديد</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-900 font-[Tajawal]" dir="rtl">
	<div class="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-xl">
		<h1 class="mb-2 text-center text-3xl font-bold text-white">أنشئ حسابك</h1>
		<p class="mb-6 text-center text-gray-400">وابدأ رحلتك في عالم دراغون بول</p>

		<!-- 
      السر الكبير هنا: `use:enhance`.
      هذا السطر الصغير يفعل كل السحر. يجعل النموذج يرسل البيانات
      في الخلفية بدون إعادة تحميل الصفحة، ويقوم بتحديث المتغيرات
      `$form`, `$errors`, `$submitting` تلقائياً.
    -->
		<form method="POST" use:enhance>
			<!-- عرض الأخطاء العامة التي لا ترتبط بحقل معين -->
			{#if $errors._errors}
				<div class="mb-4 rounded-md bg-red-900/50 p-3 text-center text-red-300">
					{$errors._errors}
				</div>
			{/if}

			<!-- حقل اسم المستخدم -->
			<div class="mb-4">
				<label for="username" class="mb-2 block text-gray-300">اسم المستخدم</label>
				<input
					type="text"
					name="username"
					id="username"
					class="w-full rounded border bg-gray-700 p-2 text-white focus:border-orange-500 focus:outline-none {$errors.username
						? 'border-red-500'
						: 'border-gray-600'}"
					bind:value={$form.username}
					aria-invalid={$errors.username ? 'true' : 'false'}
				/>
				<!-- عرض الخطأ الخاص بهذا الحقل فقط -->
				{#if $errors.username}
					<p class="mt-1 text-sm text-red-400">{$errors.username}</p>
				{/if}
			</div>

			<!-- حقل البريد الإلكتروني -->
			<div class="mb-4">
				<label for="email" class="mb-2 block text-gray-300">البريد الإلكتروني</label>
				<input
					type="email"
					name="email"
					id="email"
					class="w-full rounded border bg-gray-700 p-2 text-white focus:border-orange-500 focus:outline-none {$errors.email
						? 'border-red-500'
						: 'border-gray-600'}"
					bind:value={$form.email}
					aria-invalid={$errors.email ? 'true' : 'false'}
				/>
				{#if $errors.email}
					<p class="mt-1 text-sm text-red-400">{$errors.email}</p>
				{/if}
			</div>

			<!-- حقل كلمة المرور -->
			<div class="mb-4">
				<label for="password" class="mb-2 block text-gray-300">كلمة المرور</label>
				<input
					type="password"
					name="password"
					id="password"
					class="w-full rounded border bg-gray-700 p-2 text-white focus:border-orange-500 focus:outline-none {$errors.password
						? 'border-red-500'
						: 'border-gray-600'}"
					bind:value={$form.password}
					aria-invalid={$errors.password ? 'true' : 'false'}
				/>
				{#if $errors.password}
					<p class="mt-1 text-sm text-red-400">{$errors.password}</p>
				{/if}

				<!-- مؤشر قوة كلمة المرور (محسّن) -->
				{#if password.length > 0}
					<div class="mt-2 flex items-center">
						<div class="h-2.5 w-full rounded-full bg-gray-600">
							<!-- ✨ الإصلاح الأول هنا ✨ -->
							<div
								class="h-2.5 rounded-full transition-all duration-300 {passwordStrength.color}"
								style="width: {(passwordStrength.score / 4) * 100}%"
							></div>
						</div>
						<span class="mr-3 text-sm whitespace-nowrap text-gray-300">{passwordStrength.text}</span
						>
					</div>
				{/if}
			</div>

			<!-- حقل تأكيد كلمة المرور -->
			<div class="mb-6">
				<label for="passwordConfirm" class="mb-2 block text-gray-300">تأكيد كلمة المرور</label>
				<input
					type="password"
					name="passwordConfirm"
					id="passwordConfirm"
					class="w-full rounded border bg-gray-700 p-2 text-white focus:border-orange-500 focus:outline-none {$errors.passwordConfirm
						? 'border-red-500'
						: 'border-gray-600'}"
					bind:value={$form.passwordConfirm}
					aria-invalid={$errors.passwordConfirm ? 'true' : 'false'}
				/>
				{#if $errors.passwordConfirm}
					<p class="mt-1 text-sm text-red-400">{$errors.passwordConfirm}</p>
				{/if}
			</div>

			<button
				type="submit"
				class="w-full rounded bg-orange-600 px-4 py-2 font-bold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-500"
				disabled={$submitting}
			>
				<!-- نظهر نصاً مختلفاً أثناء إرسال البيانات -->
				{$submitting ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
			</button>
		</form>

		<!-- --- الميزة الجديدة: تسجيل الدخول عبر وسائل التواصل الاجتماعي --- -->
		<div class="my-6 flex items-center">
			<!-- ✨ الإصلاح الثاني هنا ✨ -->
			<div class="flex-grow border-t border-gray-600"></div>
			<span class="mx-4 flex-shrink text-sm text-gray-400">أو سجل عبر</span>
			<!-- ✨ الإصلاح الثالث هنا ✨ -->
			<div class="flex-grow border-t border-gray-600"></div>
		</div>

		<div class="flex justify-center space-x-4 space-x-reverse">
			<!-- زر جوجل (مثال) -->
			<button
				class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 transition-colors hover:bg-gray-600"
				aria-label="التسجيل باستخدام جوجل"
			>
				<svg class="h-6 w-6" viewBox="0 0 48 48">
					<path
						fill="#FFC107"
						d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20c0-1.341-.138-2.65-.389-3.917z"
					/>
					<path
						fill="#FF3D00"
						d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
					/>
					<path
						fill="#4CAF50"
						d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.655-3.657-11.303-8H6.306C9.656,39.663,16.318,44,24,44z"
					/>
					<path
						fill="#1976D2"
						d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.34,43.611,20.083z"
					/>
				</svg>
			</button>
			<!-- يمكنك إضافة أزرار أخرى هنا (تويتر، جيت هاب...) -->
		</div>

		<p class="mt-8 text-center text-gray-400">
			لديك حساب بالفعل؟ <a href="/login" class="text-orange-500 hover:underline">سجل الدخول</a>
		</p>
	</div>
</div>
