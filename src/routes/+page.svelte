<script lang="ts">
	import type { PageData } from './$types';
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';

	export let data: PageData;
	// استيراد متغيرات الفرز والتصفية
	const { mangas, sort, status } = data;

	let stage = 0;
	onMount(() => {
		setTimeout(() => (stage = 1), 100);
		setTimeout(() => (stage = 2), 2000);
	});
</script>

<svelte:head>
	<title>موقع دراغون بول الأسطوري | اقرأ المانجا أونلاين</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 font-[Tajawal] text-white">
	<header
		class="relative flex h-96 items-center justify-center overflow-hidden bg-cover bg-center"
		style="background-image: url('/covers/hero-banner.jpg');"
	>
		<!-- svelte-ignore element_invalid_self_closing_tag -->
		<div class="bg-opacity-60 absolute inset-0 bg-black" />
		<div class="relative z-10 flex flex-col items-center justify-center px-4 text-center">
			<div class="flex h-32 w-full items-center justify-center">
				{#if stage === 1}
					<div
						in:fade={{ duration: 300 }}
						out:fade={{ duration: 500 }}
						class="energy-sphere-container"
					>
						<div class="energy-sphere"></div>
						{#each Array(20) as _, i}
							<div
								class="particle"
								style="--angle: {Math.random() * 360}deg; --radius: {50 +
									Math.random() * 150}px; animation-delay: {Math.random() * 0.5}s;"
							></div>
						{/each}
					</div>
				{:else if stage === 2}
					<div class="text-content">
						<h1
							in:fly={{ y: 20, duration: 800, easing: cubicOut }}
							class="text-4xl font-extrabold tracking-tight text-shadow-lg sm:text-5xl md:text-7xl"
						>
							عالم دراغون بول بين يديك
						</h1>
						<p
							in:fly={{ y: 20, duration: 800, delay: 200, easing: cubicOut }}
							class="mt-4 text-base text-gray-200 sm:text-xl"
						>
							اقرأ جميع فصول المانجا من الطفولة وحتى سوبر بجودة عالية
						</p>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<main class="container mx-auto px-4 py-16">
		<h2 class="mb-6 text-center text-3xl font-bold text-orange-500 md:text-4xl">اختر السلسلة</h2>

		<div class="mb-12 flex flex-wrap items-center justify-center gap-4">
			<div class="flex items-center gap-2 rounded-lg bg-gray-800 p-1">
				<a
					href="?sort=-created&status={status || ''}"
					class="rounded-md px-4 py-2 text-sm transition-colors {sort === '-created'
						? 'bg-orange-600'
						: 'hover:bg-gray-700'}">الأحدث</a
				>
				<a
					href="?sort=title&status={status || ''}"
					class="rounded-md px-4 py-2 text-sm transition-colors {sort === 'title'
						? 'bg-orange-600'
						: 'hover:bg-gray-700'}">أبجدي</a
				>
			</div>
			<div class="relative">
				<select
					on:change={(e) => {
						const newStatus = e.currentTarget.value;
						window.location.href = `?sort=${sort}&status=${newStatus}`;
					}}
					class="appearance-none rounded-lg bg-gray-800 px-4 py-2 pr-8 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
				>
					<option value="" selected={status === ''}>كل الحالات</option>
					<option value="ongoing" selected={status === 'ongoing'}>مستمرة</option>
					<option value="completed" selected={status === 'completed'}>مكتملة</option>
				</select>
				<div
					class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"
				>
					<svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
						><path
							d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
						/></svg
					>
				</div>
			</div>
		</div>

		{#if mangas.length > 0}
			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-10">
				{#each mangas as manga}
					<a
						href="/manga/{manga.slug}"
						class="group transform overflow-hidden rounded-lg bg-gray-800 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
					>
						<div class="h-64 w-full overflow-hidden">
							<img
								src={manga.cover_image_url}
								alt="غلاف مانجا {manga.title}"
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
							/>
						</div>
						<div class="p-6">
							<h3 class="mb-2 text-2xl font-bold">{manga.title}</h3>
							<p class="leading-relaxed text-gray-400">{manga.description}</p>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<p class="text-center text-xl text-gray-400">لا توجد مانجا تطابق خيارات البحث الحالية.</p>
		{/if}
	</main>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap');
	.text-shadow-lg {
		text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
	}

	.energy-sphere-container {
		position: relative;
		width: 100px;
		height: 100px;
		animation: flash-in 2s forwards;
	}

	.energy-sphere {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 20px;
		height: 20px;
		background-color: #87ceeb;
		border-radius: 50%;
		box-shadow:
			0 0 10px #87ceeb,
			0 0 20px #87ceeb,
			0 0 40px #fff;
		transform: translate(-50%, -50%);
		animation: charge 1.5s ease-in-out forwards;
	}

	.particle {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 3px;
		height: 3px;
		background-color: #ffdead;
		border-radius: 50%;
		transform: rotate(var(--angle)) translateX(var(--radius)) rotate(calc(-1 * var(--angle)));
		animation: particle-suck-in 1.5s ease-out forwards;
	}

	@keyframes charge {
		0% {
			transform: translate(-50%, -50%) scale(0);
		}
		50% {
			transform: translate(-50%, -50%) scale(1.5);
			box-shadow:
				0 0 20px #87ceeb,
				0 0 40px #87ceeb,
				0 0 80px #fff;
		}
		100% {
			transform: translate(-50%, -50%) scale(1);
			box-shadow:
				0 0 10px #87ceeb,
				0 0 20px #87ceeb,
				0 0 40px #fff;
		}
	}

	@keyframes particle-suck-in {
		from {
			opacity: 0.7;
			width: 3px;
			height: 3px;
		}
		to {
			opacity: 0;
			width: 0px;
			height: 0px;
			transform: translate(-50%, -50%);
		}
	}

	@keyframes flash-in {
		0% {
			opacity: 0;
		}
		20% {
			opacity: 1;
		}
		85% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: scale(50);
		}
	}
</style>
