<script lang="ts">
	// Svelte component for site settings
	import type { PageData, ActionData } from './$types';
	export let data: PageData;
	export let form: ActionData;

	let maintenanceMode = data.settings.maintenanceMode;
	let announcementText = data.announcement?.text || '';
	let announcementActive = data.announcement?.isActive || false;
</script>

<svelte:head><title>إعدادات الموقع</title></svelte:head>

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white">
	<a href="/admin" class="text-blue-400 hover:underline mb-8 block text-right">
		&larr; العودة إلى لوحة التحكم
	</a>
	<h1 class="text-4xl font-bold mb-8 text-right">إعدادات الموقع العامة</h1>

	<div class="max-w-2xl mx-auto space-y-8">
		<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
			<h2 class="text-2xl font-bold mb-4">وضع الصيانة</h2>
			<form method="POST" action="?/toggleMaintenance" class="flex items-center justify-between">
				<p class="text-gray-400">
					عند التفعيل، لن يتمكن أحد من تصفح الموقع باستثناء المسؤولين.
				</p>
				<button
					type="submit"
					class="px-6 py-2 rounded font-bold transition-colors {maintenanceMode ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}"
				>
					{maintenanceMode ? 'إلغاء تفعيل' : 'تفعيل'}
				</button>
			</form>
		</div>

		<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
			<h2 class="text-2xl font-bold mb-4">إعلان الموقع</h2>
			<form method="POST" action="?/updateAnnouncement" class="space-y-4">
				<div>
					<label for="announcement" class="block text-gray-300 mb-2">نص الإعلان</label>
					<textarea name="text" id="announcement" bind:value={announcementText} class="w-full bg-gray-700 p-2 rounded" rows="3"></textarea>
				</div>
				<div class="flex items-center gap-4">
					<label for="isActive" class="text-gray-300">تفعيل الإعلان؟</label>
					<input type="checkbox" name="isActive" id="isActive" bind:checked={announcementActive} class="h-5 w-5 rounded">
				</div>
				{#if form?.success}
				<p class="text-green-500">{form.success}</p>
				{/if}
				<button type="submit" class="w-full bg-blue-600 font-bold py-2 rounded hover:bg-blue-700">
					حفظ الإعلان
				</button>
			</form>
		</div>
	</div>
</div>