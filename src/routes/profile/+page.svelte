<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import MangaCard from '$lib/components/MangaCard.svelte';
	import { collectedBallsStore } from '$lib/stores/dragonballs';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	export let data: PageData;
	export let form: ActionData;
	collectedBallsStore.set(data.collectedBalls || []);
	let showSummoningScene = false;
	let animationStep = 0;
	// 0: start, 1: balls gather, 2.5: shake, 2: flash, 3: shenron appears, 4: wishes appear
	let selectedWishes: any[] = [];
	let finalMessage = '';

	// Use onMount to manage messages after the page is fully loaded
	let passwordSuccessMessage = '';
	onMount(() => {
		if (form?.passwordSuccess) {
			passwordSuccessMessage = form.passwordSuccess;
			setTimeout(() => {
				passwordSuccessMessage = '';
			}, 3000);
		}
	});

	$: if (form) {
		if (form.wishes && !showSummoningScene) {
			selectedWishes = form.wishes;
			showSummoningScene = true;
			// Start the animation sequence when the scene is shown
			animationStep = 1;
		} else if (form.shenronWished) {
			finalMessage = form.message || 'تحققت أمنيتك!';
			collectedBallsStore.set([]);
			setTimeout(() => {
				showSummoningScene = false;
				finalMessage = '';
				animationStep = 0; // Reset for next time
			}, 5000);
		}
	}

	// Use on:animationend to sequence the animations
	function handleAnimationEnd(event: AnimationEvent) {
		if (event.animationName === 'circle-in') {
			animationStep = 2.5;
			// Trigger shake
		} else if (event.animationName === 'screen-shake') {
			animationStep = 2;
			// Trigger flash
		} else if (event.animationName === 'flash-effect') {
			animationStep = 3;
			// Trigger Shenron
		}
	}
</script>

<svelte:head><title>ملفي الشخصي - {data.user?.username}</title></svelte:head>

{#if showSummoningScene}
	<div
		class="summoning-overlay"
		class:shake={animationStep === 2.5}
		on:animationend={handleAnimationEnd}
	>
		<div class="lightning" style="--delay: 0.1s; --duration: 0.3s;"></div>
		<div class="lightning" style="--delay: 0.5s; --duration: 0.2s; left: 20%; top: 0;"></div>
		<div class="lightning" style="--delay: 0.8s; --duration: 0.4s; left: 80%; top: 20%;"></div>

		{#if animationStep >= 1}
			<div class="balls-container">
				{#each { length: 7 } as _, i}
					<img
						src={`/dragonballs/db_${i + 1}.png`}
						alt="كرة رقم {i + 1}"
						class="dragonball"
						style="--i: {i}"
					/>
				{/each}
			</div>
		{/if}

		{#if animationStep >= 2}
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<div class="flash" />
		{/if}

		{#if animationStep >= 3}
			<div
				class="shenron-container"
				transition:fly={{ y: 200, duration: 1000 }}
				on:introend={() => (animationStep = 4)}
			>
				<img src="/shenron.png" alt="Shenron" class="shenron-img" />

				{#if animationStep >= 4}
					<div class="wishes-box" transition:fly={{ y: 50, duration: 500 }}>
						{#if finalMessage}
							<div class="final-message">
								<p>{finalMessage}</p>
							</div>
						{:else}
							<h2 class="text-2xl font-bold mb-4">اختر أمنيتك يا محارب!</h2>
							<div class="space-y-3">
								{#each selectedWishes as wish}
									<form method="POST" action="?/grantWish">
										<input type="hidden" name="wishId" value={wish.id} />
										<button type="submit" class="wish-button">
											{wish.text}
										</button>
									</form>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<div class="min-h-screen bg-gray-900 text-white font-[Tajawal] p-8" dir="rtl" >
	<div class="container mx-auto">
		<div class="flex flex-wrap justify-between items-center mb-10 gap-4">
			<div>
				<h1 class="text-4xl font-bold">ملفي الشخصي</h1>
				<p class="text-gray-400 mt-1">مرحباً بعودتك ، {data.user?.username}</p>
				{#if data.user.title}
					<span
						class="mt-2 inline-block bg-yellow-500 text-black text-sm font-bold py-1 px-3 rounded-full"
						>{data.user.title}</span
					>
				{/if}
			</div>
			<form method="POST" action="?/logout">
				<button class="bg-red-600 py-2 px-4 rounded hover:bg-red-700 transition-colors"
					>تسجيل الخروج</button
				>
			</form>
		</div>

        <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-12" dir="rtl">
			<div class="flex justify-between items-center mb-2">
				<span class="font-bold text-orange-400">مستوى الطاقة : {data.user.power_level}</span>
				<span class="text-sm text-gray-400">{data.user.xp} / {data.user.xp_to_next_level} XP</span>
			</div>
			<div class="w-full bg-gray-700 rounded-full h-4">
				<div
					class="bg-green-500 h-4 rounded-full transition-all duration-500"
					style="width: {(data.user.xp / data.user.xp_to_next_level) * 100}%"
				></div>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
			<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
				<h2 class="text-2xl font-bold mb-4" dir="rtl" >إحصائياتي</h2>
				<div class="flex justify-around items-center">
					<div class="text-center">
						<h3 class="text-xl text-gray-400">المانجا المفضلة</h3>
						<p class="text-5xl font-bold mt-2 text-orange-500">{data.stats.totalFavorites}</p>
					</div>
					<div class="text-center">
						<h3 class="text-xl text-gray-400">الفصول المقروءة</h3>
						<p class="text-5xl font-bold mt-2 text-orange-500">{data.stats.totalChaptersRead}</p>
						<!-- ✨ التحسين: إضافة رابط لصفحة سجل القراءة الكامل ✨ -->
						<a href="/profile/history" class="text-sm mt-2 text-blue-400 hover:underline"
							>عرض السجل الكامل</a
						>
					</div>
				</div>
			</div>

			<div class="bg-gray-800 p-6 rounded-lg shadow-lg" dir="rtl">
				<h2 class="text-2xl font-bold mb-4">تغيير كلمة المرور</h2>
				<form method="POST" action="?/changePassword" class="space-y-4">
					<div>
						<input
							type="password"
							name="oldPassword"
							placeholder="كلمة المرور القديمة"
							class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
							required
						/>
					</div>
					<div>
						<input
							type="password"
							name="newPassword"
							placeholder="كلمة المرور الجديدة"
							class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
							required
						/>
					</div>
					<div>
						<input
							type="password"
							name="newPasswordConfirm"
							placeholder="تأكيد كلمة المرور الجديدة"
							class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
							required
						/>
					</div>
					{#if form?.passwordError}
						<p class="text-red-500 text-sm text-center">{form.passwordError}</p>
					{/if}

					{#if passwordSuccessMessage}
						<p class="text-green-500 text-sm text-center">{passwordSuccessMessage}</p>
					{/if}
					<button
						type="submit"
						class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
					>
						حفظ التغييرات
					</button>
				</form>
			</div>
		</div>

		<h2 class="text-3xl font-bold mb-6" dir="rtl" >كرات التنين</h2>
		<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
			<div class="flex justify-center items-center gap-4 mb-6">
				{#each { length: 7 } as _, i}
					{@const ballNum = i + 1}
					{@const hasBall = $collectedBallsStore.includes(ballNum)}
					<img
						src={`/dragonballs/db_${ballNum}.png`}
						alt="كرة رقم {ballNum}"
						class="w-16 h-16 transition-transform duration-300 {hasBall
							? 'opacity-100'
							: 'opacity-20 grayscale'}"
						class:ready-to-summon={$collectedBallsStore.length === 7}
						style={$collectedBallsStore.length === 7
							? `animation-delay: ${Math.random() * 2}s, ${Math.random() * 2}s`
							: ''}
						title={hasBall ? 'تم جمعها' : 'مفقودة'}
					/>
				{/each}
			</div>

			<form method="POST" action="?/summonShenron">
				<button
					type="submit"
					class="w-full bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
					disabled={$collectedBallsStore.length < 7 || showSummoningScene}
				>
					🐉 استدعاء شينرون!
				</button>
			</form>
			{#if form?.error && !form.wishes}
				<p class="text-red-500 text-center mt-4">{form.error}</p>
			{/if}
		</div>

		<h2 class="text-3xl font-bold mb-6 mt-12" dir="rtl" >قائمتي المفضلة</h2>
		{#if data.favorites.length > 0}
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
				{#each data.favorites as fav (fav.id)}
					{#if fav.expand?.manga}
						<MangaCard manga={fav.expand.manga} />
					{/if}
				{/each}
			</div>
		{:else}
			<div class="text-center py-10 bg-gray-800 rounded-lg" dir="rtl" >
				<p class="text-lg text-gray-400">قائمتك فارغة حالياً</p>
				<a
					href="/"
					class="mt-4 inline-block bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-orange-500"
				>
					تصفح المانجا
				</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.summoning-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.9);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		overflow: hidden;
	}

	.balls-container {
		position: relative;
		width: 250px;
		height: 250px;
	}

	.dragonball {
		position: absolute;
		width: 50px;
		height: 50px;
		top: 50%;
		left: 50%;
		transform-origin: 125px 50%;
		animation:
			circle-in 1.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards,
			glowing-balls 2s infinite alternate;
		animation-delay: calc(var(--i) * 0.05s);
		opacity: 0;
	}

	@keyframes glowing-balls {
		from {
			filter: drop-shadow(0 0 5px #f59e0b) brightness(1);
		}
		to {
			filter: drop-shadow(0 0 15px #f59e0b) brightness(1.3);
		}
	}

	@keyframes circle-in {
		0% {
			transform: translate(-50%, -50%) rotate(calc(var(--i) * 120deg)) translateX(100vw)
				scale(0.5);
			opacity: 1;
		}
		60% {
			transform: translate(-50%, -50%) rotate(calc(var(--i) * -50deg)) translateX(100px)
				scale(1.2);
			opacity: 1;
		}
		90% {
			transform: translate(-50%, -50%) rotate(0deg) translateX(0px) scale(1);
			opacity: 1;
			filter: drop-shadow(0 0 20px white) brightness(3);
		}
		100% {
			transform: translate(-50%, -50%) rotate(0deg) translateX(0px) scale(1.1);
			opacity: 1;
			filter: drop-shadow(0 0 30px white) brightness(5);
		}
	}

	.flash {
		position: absolute;
		width: 300vw;
		height: 300vh;
		background-color: white;
		border-radius: 50%;
		animation: flash-effect 0.5s ease-out forwards;
		z-index: 10000;
	}

	@keyframes flash-effect {
		from {
			transform: scale(0);
			opacity: 1;
		}
		to {
			transform: scale(1);
			opacity: 0;
		}
	}

	.shenron-container {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.shenron-img {
		width: 80%;
		max-width: 500px;
		height: auto;
		animation: shenron-glow 3s infinite alternate;
	}

	@keyframes shenron-glow {
		from {
			filter: drop-shadow(0 0 15px #fde047) brightness(1);
		}
		to {
			filter: drop-shadow(0 0 30px #fde047) brightness(1.2);
		}
	}

	.wishes-box {
		margin-top: -50px;
		background-color: rgba(17, 24, 39, 0.8);
		backdrop-filter: blur(10px);
		padding: 2rem;
		border-radius: 1rem;
		border: 1px solid #fde047;
		text-align: center;
		color: white;
		width: 90%;
		max-width: 500px;
	}

	.wish-button {
		width: 100%;
		background-color: rgba(253, 224, 71, 0.1);
		border: 1px solid #fde047;
		color: #fef08a;
		padding: 0.75rem;
		border-radius: 0.5rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.wish-button:hover {
		background-color: rgba(253, 224, 71, 0.3);
		color: white;
		box-shadow: 0 0 15px #fde047;
	}

	.final-message {
		color: #fde047;
		font-size: 1.5rem;
		font-weight: bold;
		text-shadow: 0 0 10px #fde047;
	}

	.ready-to-summon {
		opacity: 1 !important;
		filter: grayscale(0) !important;
		animation:
			ready-glow 1.8s infinite alternate ease-in-out,
			gentle-float 3s infinite alternate ease-in-out;
	}

	@keyframes ready-glow {
		0% {
			transform: scale(1);
			filter: drop-shadow(0 0 5px #f59e0b) drop-shadow(0 0 10px #fef08a) brightness(1.1);
		}
		100% {
			transform: scale(1.07);
			filter: drop-shadow(0 0 12px #f59e0b) drop-shadow(0 0 25px #fef08a) brightness(1.5);
		}
	}

	@keyframes gentle-float {
		0% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-3px);
		}
		100% {
			transform: translateY(0px);
		}
	}

	.summoning-overlay.shake {
		animation: screen-shake 0.2s linear;
	}

	@keyframes screen-shake {
		0% {
			transform: translate(0, 0);
		}
		25% {
			transform: translate(5px, 5px);
		}
		50% {
			transform: translate(-5px, -5px);
		}
		75% {
			transform: translate(5px, -5px);
		}
		100% {
			transform: translate(0, 0);
		}
	}

	.lightning {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 2px;
		height: 100%;
		background: white;
		transform: skewX(-20deg);
		opacity: 0;
		box-shadow: 0 0 20px 10px white;
		animation: lightning-flash var(--duration, 0.3s) linear infinite;
		animation-delay: var(--delay, 0s);
	}

	@keyframes lightning-flash {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 0.3;
		}
		100% {
			opacity: 0;
		}
	}
</style>