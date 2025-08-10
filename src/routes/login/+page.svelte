<script lang="ts">
	import type { ActionData } from './$types';
	import { page } from '$app/stores';
	// <-- استيراد page store للوصول إلى الرابط

	export let form: ActionData;
	// التحقق من وجود 'registered' في الرابط
	const registrationSuccess = $page.url.searchParams.get('registered') === 'true';
</script>

<svelte:head>
	<title>تسجيل الدخول</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-900 font-[Tajawal]">
	<div class="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-xl">
		<h1 class="mb-6 text-center text-3xl font-bold text-white">تسجيل الدخول</h1>

		{#if registrationSuccess}
			<div
				class="mb-4 rounded-lg border border-green-500 bg-green-500/20 p-3 text-center text-sm text-green-300"
			>
				تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.
			</div>
		{/if}

		<form method="POST">
			<div class="mb-4">
				<label for="email" class="mb-2 block text-gray-300">البريد الإلكتروني</label>
				<input
					type="email"
					name="email"
					id="email"
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white focus:border-orange-500 focus:outline-none"
					required
				/>
			</div>
			<div class="mb-6">
				<label for="password" class="mb-2 block text-gray-300">كلمة المرور</label>
				<input
					type="password"
					name="password"
					id="password"
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white focus:border-orange-500 focus:outline-none"
					required
				/>
			</div>
			{#if form?.error}
				<p class="mb-4 text-center text-red-500">{form.error}</p>
			{/if}
			<button
				type="submit"
				class="w-full rounded bg-orange-600 px-4 py-2 font-bold text-white transition-colors hover:bg-orange-700"
			>
				تسجيل الدخول
			</button>
		</form>
		<p class="mt-4 text-center text-gray-400">
			ليس لديك حساب؟ <a href="/signup" class="text-orange-500 hover:underline">أنشئ حسابًا جديدًا</a
			>
		</p>
	</div>
</div>
