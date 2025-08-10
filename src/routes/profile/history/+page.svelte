<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<svelte:head>
	<title>سجل القراءة</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 p-8 font-[Tajawal] text-white">
	<div class="container mx-auto">
		<a href="/profile" class="mb-8 block text-blue-400 hover:underline"
			>&larr; العودة إلى الملف الشخصي</a
		>
		<h1 class="mb-8 text-4xl font-bold">سجل القراءة الخاص بي</h1>

		<div class="rounded-lg bg-gray-800 shadow-lg">
			<ul class="divide-y divide-gray-700">
				{#each data.history as record (record.id)}
					<li class="flex items-center justify-between p-4">
						<div>
							<a
								href="/manga/{record.expand?.manga.slug}/{record.expand?.chapter.chapter_number}"
								class="text-lg font-semibold hover:text-orange-400"
							>
								{record.expand?.manga.title} - الفصل #{record.expand?.chapter.chapter_number}
							</a>
							<p class="mt-1 text-sm text-gray-400">
								تاريخ القراءة: {new Date(record.created).toLocaleString('ar')}
							</p>
						</div>
						<a
							href="/manga/{record.expand?.manga.slug}/{record.expand?.chapter.chapter_number}"
							class="rounded-full bg-orange-600 px-3 py-1 text-sm font-bold text-white hover:bg-orange-500"
						>
							إعادة القراءة
						</a>
					</li>
				{:else}
					<li class="p-8 text-center text-gray-400">سجل القراءة فارغ. ابدأ بتصفح المانجا!</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
