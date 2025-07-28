<script lang="ts">
	import type { LayoutData } from './$types';
	import '../app.css';
	export let data: LayoutData;
</script>

<nav class="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-50 font-[Tajawal]">
	<div class="container mx-auto flex justify-between items-center">
		<a href="/" class="text-2xl font-bold text-orange-500 hover:text-orange-400">
			موقع دراغون بول
		</a>
		<div>
			{#if data.user}
				<div>
					<span class="mr-4">أهلاً بك، {data.user.email}</span>
					<a
						href="/profile"
						class="py-2 px-4 bg-orange-600 rounded hover:bg-orange-700 transition-colors"
						>ملفي الشخصي</a
					>
				</div>
			{:else}
				<a href="/login" class="py-2 px-4 hover:bg-gray-700 rounded transition-colors"
					>تسجيل الدخول</a
				>
				<a
					href="/signup"
					class="py-2 px-4 bg-orange-600 rounded hover:bg-orange-700 transition-colors"
					>إنشاء حساب</a
				>
			{/if}
		</div>
	</div>
</nav>

<slot />