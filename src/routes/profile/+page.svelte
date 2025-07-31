<script lang="ts">
    import type { PageData } from './$types';
    import MangaCard from '$lib/components/MangaCard.svelte';
    export let data: PageData;
</script>

<svelte:head><title>ملفي الشخصي - {data.user?.username}</title></svelte:head>

<div class="min-h-screen bg-gray-900 text-white font-[Tajawal] p-8">
    <div class="container mx-auto">
        <div class="flex flex-wrap justify-between items-center mb-10 gap-4">
            <div>
                <h1 class="text-4xl font-bold">ملفي الشخصي</h1>
                <p class="text-gray-400 mt-1">مرحبًا بعودتك، {data.user?.username}!</p>
            </div>
            <form method="POST" action="?/logout">
                <button class="bg-red-600 py-2 px-4 rounded hover:bg-red-700 transition-colors">تسجيل الخروج</button>
            </form>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div class="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                <h2 class="text-xl text-gray-400">المانجا المفضلة</h2>
                <p class="text-5xl font-bold mt-2 text-orange-500">{data.stats.totalFavorites}</p>
            </div>
            <div class="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                <h2 class="text-xl text-gray-400">الفصول المقروءة</h2>
                <p class="text-5xl font-bold mt-2 text-orange-500">{data.stats.totalChaptersRead}</p>
            </div>
        </div>

        <h2 class="text-3xl font-bold mb-6">قائمتي المفضلة</h2>
        {#if data.favorites.length > 0}
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {#each data.favorites as fav (fav.id)}
                    {#if fav.expand?.manga}
                        <MangaCard manga={fav.expand.manga} />
                    {/if}
                {/each}
            </div>
        {:else}
            <div class="text-center py-10 bg-gray-800 rounded-lg">
                <p class="text-lg text-gray-400">قائمتك فارغة حاليًا.</p>
                <a href="/" class="mt-4 inline-block bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-orange-500">
                    تصفح المانجا
                </a>
            </div>
        {/if}
    </div>
</div>