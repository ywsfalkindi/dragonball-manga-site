<script lang="ts">
	import type { ActionData } from './$types';
	export let form: ActionData;

	let password = '';
	let passwordConfirm = ''; // <-- تمت إضافة متغير لتأكيد كلمة المرور
	let clientError: string | null = null; // <-- متغير لعرض خطأ الواجهة الأمامية

	// <-- منطق التحقق الفوري من تطابق كلمتي المرور
	$: {
		if (passwordConfirm && password !== passwordConfirm) {
			clientError = 'كلمتا المرور غير متطابقتين.';
		} else {
			clientError = null;
		}
	}

	let passwordStrength = {
		score: 0,
		text: '',
		color: 'bg-gray-600'
	};

	function checkPasswordStrength(p: string) {
		let score = 0;
		if (p.length > 8) score++;
		if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
		if (/\d/.test(p)) score++;
		if (/[^a-zA-Z0-9]/.test(p)) score++;

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
		<h1 class="mb-6 text-center text-3xl font-bold text-white">إنشاء حساب جديد</h1>
		<form method="POST">
			<div class="mb-4">
				<label for="username" class="mb-2 block text-gray-300">اسم المستخدم</label>
				<input
					type="text"
					name="username"
					id="username"
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white focus:border-orange-500 focus:outline-none"
					required
				/>
			</div>

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

			<div class="mb-4">
				<label for="password" class="mb-2 block text-gray-300">كلمة المرور</label>
				<input
					type="password"
					name="password"
					id="password"
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white focus:border-orange-500 focus:outline-none"
					bind:value={password}
					required
				/>
				{#if password.length > 0}
					<div class="mt-2 flex items-center">
						<div class="h-2.5 w-full rounded-full bg-gray-600">
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

			<div class="mb-6">
				<label for="passwordConfirm" class="mb-2 block text-gray-300">تأكيد كلمة المرور</label>
				<input
					type="password"
					name="passwordConfirm"
					id="passwordConfirm"
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white focus:border-orange-500 focus:outline-none"
					bind:value={passwordConfirm}
					required
				/>
			</div>

			{#if clientError}
				<p class="mb-4 text-center text-yellow-400">{clientError}</p>
			{:else if form?.error}
				<p class="mb-4 text-center text-red-500">{form.error}</p>
			{/if}

			<button
				type="submit"
				class="w-full rounded bg-orange-600 px-4 py-2 font-bold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-500"
				disabled={clientError !== null}
			>
				إنشاء الحساب
			</button>
		</form>
		<p class="mt-4 text-center text-gray-400">
			لديك حساب بالفعل؟ <a href="/login" class="text-orange-500 hover:underline">سجل الدخول</a>
		</p>
	</div>
</div>
