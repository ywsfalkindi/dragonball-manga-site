<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<svelte:head><title>إدارة الوسائط</title></svelte:head>

<div class="min-h-screen bg-gray-900 p-8 font-[Tajawal] text-white">
	<a href="/admin" class="mb-8 block text-right text-blue-400 hover:underline">
		&larr; العودة إلى لوحة التحكم
	</a>
	<h1 class="mb-8 text-right text-4xl font-bold">إدارة الوسائط</h1>
	<p class="mb-8 text-right text-gray-400">
		هنا يمكنك عرض الملفات التي تم رفعها ولم تعد مرتبطة بأي مانجا أو فصل.
	</p>

	<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
		<h2 class="mb-4 text-2xl font-bold">ملفات غير مستخدمة ({data.unusedFiles.length})</h2>
		{#if data.unusedFiles.length > 0}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				{#each data.unusedFiles as file}
					<div class="group relative">
						<img src={file.url} alt={file.name} class="aspect-square rounded-lg object-cover" />
						<div
							class="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<form method="POST" action="?/deleteFile">
								<input type="hidden" name="recordId" value={file.recordId} />
								<input type="hidden" name="fileName" value={file.name} />
								<button class="text-sm text-red-500 hover:text-red-400">حذف</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="py-8 text-center text-gray-400">لا توجد ملفات غير مستخدمة حاليًا.</p>
		{/if}
	</div>
</div>
