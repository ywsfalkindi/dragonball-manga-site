<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	const { manga, chapters } = data;
</script>

<svelte:head>
	<title>قراءة مانجا {manga.title} - جميع الفصول</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white font-[Tajawal]">
	<header class="relative h-[50vh] flex items-end p-8 bg-cover bg-center" style="background-image: url({manga.cover_image_url})">
    <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
    <div class="relative z-10">
        <h1 class="text-5xl font-extrabold">{manga.title}</h1>
        <p class="mt-4 text-lg max-w-2xl text-gray-300">{manga.description}</p>

        {#if data.user}
            <div class="mt-6">
                <form method="POST" action="?/{data.isFavorited ? 'unfavorite' : 'favorite'}">
                    <button type="submit" class="bg-orange-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-700 transition-all">
                        {data.isFavorited ? '❤️ إزالة من المفضلة' : '🤍 إضافة إلى المفضلة'}
                    </button>
                </form>
            </div>
        {/if}
        </div>
</header>

	<main class="container mx-auto px-4 py-12">
		<h2 class="text-3xl font-bold mb-6 text-orange-500">قائمة الفصول</h2>
		<div class="bg-gray-800 rounded-lg shadow-lg">
			<ul class="divide-y divide-gray-700">
				{#each chapters as chapter}
					<a href="/manga/{manga.slug}/{chapter.chapter_number}" class="block p-6 hover:bg-gray-700/50 transition-colors duration-200">
						<li class="flex items-center justify-between">
							<span class="text-xl font-semibold">الفصل #{chapter.chapter_number}</span>
							<span class="bg-orange-500 text-white text-sm font-bold py-1 px-3 rounded-full">اقرأ الآن</span>
						</li>
					</a>
				{:else}
                    <li class="p-6 text-center text-gray-400">
                        لم تتم إضافة أي فصول لهذه المانجا بعد.
                    </li>
                {/each}
			</ul>
		</div>
	</main>
</div>