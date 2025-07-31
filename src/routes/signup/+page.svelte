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

<div class="min-h-screen bg-gray-900 flex items-center justify-center font-[Tajawal]">
	<div class="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
		<h1 class="text-3xl font-bold text-center text-white mb-6">إنشاء حساب جديد</h1>
		<form method="POST">
			<div class="mb-4">
				<label for="username" class="block text-gray-300 mb-2">اسم المستخدم</label>
				<input
					type="text"
					name="username"
					id="username"
					class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:outline-none focus:border-orange-500"
					required
				/>
			</div>

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

			<div class="mb-4">
				<label for="password" class="block text-gray-300 mb-2">كلمة المرور</label>
				<input
					type="password"
					name="password"
					id="password"
					class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:outline-none focus:border-orange-500"
					bind:value={password}
					required
				/>
				{#if password.length > 0}
					<div class="mt-2 flex items-center">
						<div class="w-full bg-gray-600 rounded-full h-2.5">
							<div
								class="h-2.5 rounded-full transition-all duration-300 {passwordStrength.color}"
								style="width: {(passwordStrength.score / 4) * 100}%"
							></div>
						</div>
						<span class="text-sm text-gray-300 mr-3 whitespace-nowrap"
							>{passwordStrength.text}</span
						>
					</div>
				{/if}
			</div>

			<div class="mb-6">
				<label for="passwordConfirm" class="block text-gray-300 mb-2">تأكيد كلمة المرور</label>
				<input
					type="password"
					name="passwordConfirm"
					id="passwordConfirm"
					class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:outline-none focus:border-orange-500"
					bind:value={passwordConfirm}
					required
				/>
			</div>

			{#if clientError}
				<p class="text-yellow-400 text-center mb-4">{clientError}</p>
			{:else if form?.error}
				<p class="text-red-500 text-center mb-4">{form.error}</p>
			{/if}
			
			<button
				type="submit"
				class="w-full bg-orange-600 text-white font-bold py-2 px-4 rounded hover:bg-orange-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
				disabled={clientError !== null}
			>
				إنشاء الحساب
			</button>
		</form>
		<p class="text-center text-gray-400 mt-4">
			لديك حساب بالفعل؟ <a href="/login" class="text-orange-500 hover:underline">سجل الدخول</a>
		</p>
	</div>
</div>