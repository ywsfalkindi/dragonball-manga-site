<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<svelte:head>
	<title>سجل القراءة</title>
</svelte:head>

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white">
	<div class="container mx-auto">
		<a href="/profile" class="text-blue-400 hover:underline mb-8 block">&larr; العودة إلى الملف الشخصي</a>
		<h1 class="text-4xl font-bold mb-8">سجل القراءة الخاص بي</h1>

		<div class="bg-gray-800 rounded-lg shadow-lg">
			<ul class="divide-y divide-gray-700">
				{#each data.history as record (record.id)}
					<li class="p-4 flex justify-between items-center">
						<div>
							<a href="/manga/{record.expand?.manga.slug}/{record.expand?.chapter.chapter_number}" class="text-lg font-semibold hover:text-orange-400">
								{record.expand?.manga.title} - الفصل #{record.expand?.chapter.chapter_number}
							</a>
							<p class="text-sm text-gray-400 mt-1">
								تاريخ القراءة: {new Date(record.created).toLocaleString('ar')}
							</p>
						</div>
						<a href="/manga/{record.expand?.manga.slug}/{record.expand?.chapter.chapter_number}" class="bg-orange-600 text-white text-sm font-bold py-1 px-3 rounded-full hover:bg-orange-500">
							إعادة القراءة
						</a>
					</li>
				{:else}
					<li class="p-8 text-center text-gray-400">
						سجل القراءة فارغ. ابدأ بتصفح المانجا!
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>