<script lang="ts">
	import type { LayoutData } from './$types';
	import '../app.css';
	import { navigating, page } from '$app/stores';
	import DragonBall from '$lib/components/DragonBall.svelte';
	import { onMount } from 'svelte';
	import { fly, slide } from 'svelte/transition'; // ✨ تم استيراد دالة slide هنا

	export let data: LayoutData;
	let showLogoutToast = false;
	let isMenuOpen = false;

	// ✨ بداية الإصلاح: إغلاق القائمة عند التنقل ✨
	$: if ($navigating) {
		isMenuOpen = false;
	}
	// ✨ نهاية الإصلاح ✨

	onMount(() => {
		if ($page.url.searchParams.get('logout') === 'true') {
			showLogoutToast = true;
			setTimeout(() => {
				showLogoutToast = false;
			}, 3000);
		}
	});
</script>

{#if $navigating}
	<div class="bg-opacity-50 fixed inset-0 z-[9999] flex items-center justify-center bg-black">
		<div
			class="h-16 w-16 animate-spin rounded-full border-4 border-gray-600 border-t-orange-500"
		></div>
	</div>
{/if}

{#if data.dragonBall}
	<DragonBall ball_number={data.dragonBall.ball_number} find_token={data.dragonBall.find_token} />
{/if}

{#if showLogoutToast}
	<div
		in:fly={{ y: -20, duration: 300 }}
		out:fly={{ y: -20, duration: 300 }}
		class="fixed top-20 right-1/2 z-[9999] translate-x-1/2 rounded-lg bg-green-600 px-6 py-2 text-white shadow-lg"
	>
		تم تسجيل خروجك بنجاح!
	</div>
{/if}

<div class="min-h-screen bg-gray-900 font-[Tajawal] text-white">
	<nav class="sticky top-0 z-50 bg-gray-800 p-4 text-white shadow-md">
		<div class="container mx-auto flex flex-wrap items-center justify-between gap-4">
			<a href="/" class="text-2xl font-bold text-orange-500 hover:text-orange-400">
				موقع دراغون بول
			</a>

			<button
				on:click={() => (isMenuOpen = !isMenuOpen)}
				class="inline-block rounded p-2 text-gray-300 hover:bg-gray-700 md:hidden"
				aria-label="Toggle menu"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"
					></line><line x1="3" y1="18" x2="21" y2="18"></line></svg
				>
			</button>

			<div class="hidden items-center gap-x-4 text-base md:flex md:gap-x-6">
				<a href="/quizzes" class="font-semibold transition-colors hover:text-orange-400"
					>الاختبارات</a
				>
				<a href="/leaderboard" class="font-semibold transition-colors hover:text-orange-400"
					>لوحة الصدارة</a
				>
				<div class="hidden h-6 w-px bg-gray-600 sm:block"></div>

				{#if data.user}
					<div class="flex items-center gap-x-4">
						<span class="hidden sm:inline">أهلاً بك، {data.user.name}</span>
						<a
							href="/profile"
							class="rounded bg-orange-600 px-4 py-2 whitespace-nowrap hover:bg-orange-700"
							>ملفي الشخصي</a
						>
					</div>
				{:else}
					<div class="flex items-center gap-x-2">
						<a href="/login" class="rounded px-4 py-2 whitespace-nowrap hover:bg-gray-700"
							>تسجيل الدخول</a
						>
						<a
							href="/signup"
							class="rounded bg-orange-600 px-4 py-2 whitespace-nowrap hover:bg-orange-700"
							>إنشاء حساب</a
						>
					</div>
				{/if}
			</div>

			{#if isMenuOpen}
				<div
					class="mt-4 flex w-full basis-full flex-col items-end gap-y-4 md:hidden"
					transition:slide
				>
					<a href="/quizzes" class="font-semibold transition-colors hover:text-orange-400"
						>الاختبارات</a
					>
					<a href="/leaderboard" class="font-semibold transition-colors hover:text-orange-400"
						>لوحة الصدارة</a
					>
					<div class="h-px w-full bg-gray-700"></div>
					{#if data.user}
						<div class="flex w-full flex-col items-end gap-y-4">
							<span class="text-gray-300" dir="rtl">أهلاً بك، {data.user.name}</span>
							<a
								href="/profile"
								class="w-full rounded bg-orange-600 px-4 py-2 text-center whitespace-nowrap hover:bg-orange-700"
								>ملفي الشخصي</a
							>
						</div>
					{:else}
						<div class="flex w-full flex-col items-stretch gap-y-2">
							<a
								href="/login"
								class="rounded px-4 py-2 text-center whitespace-nowrap hover:bg-gray-700"
								>تسجيل الدخول</a
							>
							<a
								href="/signup"
								class="rounded bg-orange-600 px-4 py-2 text-center whitespace-nowrap hover:bg-orange-700"
								>إنشاء حساب</a
							>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</nav>
	<slot />
</div>
