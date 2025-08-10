<script lang="ts">
	import { fly } from 'svelte/transition';
	import { collectedBallsStore } from '$lib/stores/dragonballs';

	export let ball_number: number;
	export let find_token: string;

	let collected = false;

	async function handleSubmit(event: SubmitEvent) {
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		const response = await fetch('/api/collect-ball', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			collected = true;
			const result = await response.json();
			if (result.newBall) {
				collectedBallsStore.update((currentBalls) => [...currentBalls, result.newBall]);
			}
		} else {
			console.error('فشل في جمع الكرة:', await response.json());
			alert('حدث خطأ أثناء محاولة جمع الكرة. حاول مرة أخرى.');
		}
	}
</script>

{#if !collected}
	<div
		transition:fly={{ y: 200, duration: 1000 }}
		class="fixed right-8 bottom-8 z-50 animate-pulse cursor-pointer drop-shadow-lg"
	>
		<form method="POST" action="/api/collect-ball" on:submit|preventDefault={handleSubmit}>
			<input type="hidden" name="ball_number" value={ball_number} />
			<input type="hidden" name="find_token" value={find_token} />
			<button type="submit" class="border-none bg-transparent p-0">
				<img
					src={`/dragonballs/db_${ball_number}.png`}
					alt="كرة تنين"
					class="h-20 w-20 transition-transform hover:scale-110"
				/>
			</button>
		</form>
	</div>
{/if}
