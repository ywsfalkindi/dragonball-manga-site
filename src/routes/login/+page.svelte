<script lang="ts">
	import type { ActionData } from './$types';
	import { page } from '$app/stores'; // <-- استيراد page store للوصول إلى الرابط

	export let form: ActionData;

	// التحقق من وجود 'registered' في الرابط
	const registrationSuccess = $page.url.searchParams.get('registered') === 'true';
</script>

<svelte:head>
	<title>تسجيل الدخول</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 flex items-center justify-center font-[Tajawal]">
	<div class="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
		<h1 class="text-3xl font-bold text-center text-white mb-6">تسجيل الدخول</h1>

		{#if registrationSuccess}
			<div class="bg-green-500/20 border border-green-500 text-green-300 text-sm rounded-lg p-3 text-center mb-4">
				تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.
			</div>
		{/if}

		<form method="POST">
			<div class="mb-4">
				<label for="email" class="block text-gray-300 mb-2">البريد الإلكتروني</label>
				<input
					type="email"
					name="email"
					id="email"
					class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:outline-none focus:border-orange-500"
					required
				/>
			</div>
			<div class="mb-6">
				<label for="password" class="block text-gray-300 mb-2">كلمة المرور</label>
				<input
					type="password"
					name="password"
					id="password"
					class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:outline-none focus:border-orange-500"
					required
				/>
			</div>
			{#if form?.error}
				<p class="text-red-500 text-center mb-4">{form.error}</p>
			{/if}
			<button
				type="submit"
				class="w-full bg-orange-600 text-white font-bold py-2 px-4 rounded hover:bg-orange-700 transition-colors"
			>
				تسجيل الدخول
			</button>
		</form>
		<p class="text-center text-gray-400 mt-4">
			ليس لديك حساب؟ <a href="/signup" class="text-orange-500 hover:underline">أنشئ حسابًا جديدًا</a>
		</p>
	</div>
</div>