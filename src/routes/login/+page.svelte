<script lang="ts">
	import type { ActionData } from './$types';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms'; // السر الأول: استيراد الأداة السحرية
	import { navigating } from '$app/stores'; // لاستشعار حالة الإرسال

	export let form: ActionData;

	// التحقق من وجود 'registered' في الرابط
	const registrationSuccess = $page.url.searchParams.get('registered') === 'true';

	// متغير لتتبع حالة عرض كلمة المرور
	let showPassword = false;

	// متغير لتتبع حالة الإرسال (لإظهار مؤشر التحميل)
	// الطريقة الصحيحة للتحقق: فقط نتأكد من أن نوع التنقل هو 'form'
	$: submitting = $navigating?.type === 'form';
</script>

<svelte:head>
	<title>تسجيل الدخول</title>
	<!-- أيقونات لاستخدامها في زر عرض كلمة المرور -->
	<!-- تم تصحيح الخطأ الإملائي هنا: integrity بدلاً من xintegrity -->
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
		integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
		crossorigin="anonymous"
		referrerpolicy="no-referrer"
	/>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-900 font-[Tajawal]" dir="rtl">
	<div class="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-2xl shadow-black/20">
		<h1 class="mb-6 text-center text-3xl font-bold text-white">تسجيل الدخول</h1>

		{#if registrationSuccess}
			<div
				class="mb-4 rounded-lg border border-green-500 bg-green-500/20 p-3 text-center text-sm text-green-300"
			>
				تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.
			</div>
		{/if}

		<!-- السر الأول: استخدام `enhance` لتجربة مستخدم سلسة بدون إعادة تحميل -->
		<form method="POST" use:enhance>
			<div class="mb-4">
				<label for="email" class="mb-2 block text-sm font-medium text-gray-300"
					>البريد الإلكتروني</label
				>
				<input
					type="email"
					name="email"
					id="email"
					class="w-full rounded-lg border bg-gray-700 p-2.5 text-white transition-colors duration-200 placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
					class:border-red-500={form?.errors?.email}
					class:border-gray-600={!form?.errors?.email}
					required
					value={form?.data?.email ?? ''}
				/>
				{#if form?.errors?.email}
					<!-- السر الرابع: سهولة الوصول مع aria-live -->
					<p class="mt-1 text-xs text-red-400" aria-live="assertive">{form.errors.email}</p>
				{/if}
			</div>

			<div class="mb-6">
				<label for="password" class="mb-2 block text-sm font-medium text-gray-300"
					>كلمة المرور</label
				>
				<!-- السر الثالث: تحسين تجربة كلمة المرور -->
				<div class="relative">
					<input
						type={showPassword ? 'text' : 'password'}
						name="password"
						id="password"
						class="w-full rounded-lg border bg-gray-700 p-2.5 text-white transition-colors duration-200 placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
						class:border-red-500={form?.errors?.password}
						class:border-gray-600={!form?.errors?.password}
						required
					/>
					<button
						type="button"
						on:click={() => (showPassword = !showPassword)}
						class="absolute inset-y-0 left-0 flex items-center px-3 text-gray-400 hover:text-white"
						aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
					>
						<i class="fa-solid {showPassword ? 'fa-eye-slash' : 'fa-eye'}"></i>
					</button>
				</div>
				{#if form?.errors?.password}
					<p class="mt-1 text-xs text-red-400" aria-live="assertive">{form.errors.password}</p>
				{/if}
			</div>

			{#if form?.error}
				<p class="mb-4 text-center text-red-400" aria-live="assertive">{form.error}</p>
			{/if}

			<!-- السر الثاني: إعطاء تغذية راجعة فورية -->
			<button
				type="submit"
				disabled={submitting}
				class="flex w-full items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 font-bold text-white transition-colors duration-200 hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-800"
			>
				{#if submitting}
					<!-- أيقونة التحميل -->
					<svg
						class="h-5 w-5 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span class="mr-2">جارِ تسجيل الدخول...</span>
				{:else}
					<span>تسجيل الدخول</span>
				{/if}
			</button>
		</form>
		<p class="mt-6 text-center text-sm text-gray-400">
			ليس لديك حساب؟ <a href="/signup" class="font-medium text-orange-500 hover:underline"
				>أنشئ حساباً جديداً</a
			>
		</p>
	</div>
</div>
