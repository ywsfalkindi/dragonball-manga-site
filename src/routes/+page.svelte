<script lang="ts">
	import type { PageData } from './$types';
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';

	export let data: PageData;
	const { mangas } = data;

	let stage = 0;
	onMount(() => {
		setTimeout(() => (stage = 1), 100);
		setTimeout(() => (stage = 2), 2000);
	});
</script>

<svelte:head>
	<title>موقع دراغون بول الأسطوري | اقرأ المانجا أونلاين</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white font-[Tajawal]">
	<header
		class="relative flex items-center justify-center h-96 bg-cover bg-center overflow-hidden"
		style="background-image: url('/covers/hero-banner.jpg');"
	>
		<!-- svelte-ignore element_invalid_self_closing_tag -->
		<div class="absolute inset-0 bg-black bg-opacity-60" />
		<div class="relative z-10 text-center px-4 flex flex-col items-center justify-center">
			<div class="w-full h-32 flex items-center justify-center">
				{#if stage === 1}
					<div in:fade={{ duration: 300 }} out:fade={{ duration: 500 }} class="energy-sphere-container">
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
							class="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-shadow-lg"
						>
							عالم دراغون بول بين يديك
						</h1>
						<p
							in:fly={{ y: 20, duration: 800, delay: 200, easing: cubicOut }}
							class="mt-4 text-base sm:text-xl text-gray-200"
						>
							اقرأ جميع فصول المانجا من الطفولة وحتى سوبر بجودة عالية
						</p>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<main class="container mx-auto px-4 py-16">
		<h2 class="text-3xl md:text-4xl font-bold text-center mb-12 text-orange-500">اختر السلسلة</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
			{#each mangas as manga}
				<a
					href="/manga/{manga.slug}"
					class="bg-gray-800 rounded-lg overflow-hidden shadow-xl transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group"
				>
					<div class="h-64 w-full overflow-hidden">
						<img
							src={manga.cover_image_url}
							alt="غلاف مانجا {manga.title}"
							class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
						/>
					</div>
					<div class="p-6">
						<h3 class="text-2xl font-bold mb-2">{manga.title}</h3>
						<p class="text-gray-400 leading-relaxed">{manga.description}</p>
					</div>
				</a>
			{/each}
		</div>
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
		box-shadow: 0 0 10px #87ceeb, 0 0 20px #87ceeb, 0 0 40px #fff;
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
			box-shadow: 0 0 20px #87ceeb, 0 0 40px #87ceeb, 0 0 80px #fff;
		}
		100% {
			transform: translate(-50%, -50%) scale(1);
			box-shadow: 0 0 10px #87ceeb, 0 0 20px #87ceeb, 0 0 40px #fff;
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