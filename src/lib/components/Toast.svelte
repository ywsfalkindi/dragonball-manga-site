<script lang="ts">
	import { fly } from 'svelte/transition';

	export let message: string;
	export let type: 'success' | 'error' = 'success';
</script>

<div
	in:fly={{ y: -20, duration: 300 }}
	out:fly={{ y: -20, duration: 300 }}
	class="fixed top-20 right-1/2 z-[9999] translate-x-1/2 rounded-lg px-6 py-2 text-white shadow-lg {type ===
	'success'
		? 'bg-green-600'
		: 'bg-red-600'}"
	role="alert"
>
	{message}
</div>
