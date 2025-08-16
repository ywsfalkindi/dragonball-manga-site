<script lang="ts">
	import type { PageData } from './$types';
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import MangaCard from '$lib/components/MangaCard.svelte';
	export let data: PageData;
	// استيراد متغيرات الفرز والتصفية
	$: ({ mangas, sort, status } = data);

	let stage = 0;
	onMount(() => {
		setTimeout(() => (stage = 1), 100);
		setTimeout(() => (stage = 2), 500);
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

		<form
			method="GET"
			class="mb-12 flex flex-wrap items-center justify-center gap-4"
			aria-label="فرز وتصفية المانجا"
		>
			<div class="flex items-center gap-2 rounded-lg bg-gray-800 p-1">
				<button
					type="submit"
					name="sort"
					value="-created"
					class="rounded-md px-4 py-2 text-sm font-bold transition-colors {sort === '-created'
						? 'bg-orange-600'
						: 'hover:bg-gray-700'}"
				>
					الأحدث
				</button>
				<button
					type="submit"
					name="sort"
					value="title"
					class="rounded-md px-4 py-2 text-sm font-bold transition-colors {sort === 'title'
						? 'bg-orange-600'
						: 'hover:bg-gray-700'}"
				>
					أبجدي
				</button>
			</div>
			<div class="relative">
				<select
					name="status"
					on:change={(event) => event.currentTarget?.form?.submit()}
					class="appearance-none rounded-lg border-2 border-transparent bg-gray-800 px-4 py-2 pr-8 font-semibold text-white transition hover:border-gray-600 focus:border-orange-500 focus:outline-none"
				>
					<option value="" selected={status === ''}>كل الحالات</option>
					<option value="مستمرة" selected={status === 'مستمرة'}>مستمرة</option>
					<option value="مكتملة" selected={status === 'مكتملة'}>مكتملة</option>
				</select>
			</div>
		</form>

		{#if mangas.length > 0}
			<div class="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{#each mangas as manga (manga.id)}
					<MangaCard
						{manga}
						isNew={manga.isNew}
						isTrending={manga.isTrending}
						chapters_count={manga.chapters_count}
					/>
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
