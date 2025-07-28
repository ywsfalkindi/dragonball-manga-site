<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
</script>

<svelte:head><title>ملفي الشخصي</title></svelte:head>

<div class="min-h-screen bg-gray-900 text-white font-[Tajawal] p-8">
    <div class="container mx-auto">
        <div class="flex justify-between items-center mb-10">
            <h1 class="text-4xl font-bold">قائمتي المفضلة</h1>
            <form method="POST" action="?/logout">
                <button class="bg-red-600 py-2 px-4 rounded hover:bg-red-700">تسجيل الخروج</button>
            </form>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {#each data.favorites as fav (fav.id)}
                <a href="/manga/{fav.expand.manga.slug}" class="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform">
                    <img src={fav.expand.manga.cover_image_url} alt="غلاف {fav.expand.manga.title}" class="w-full h-64 object-cover"/>
                    <h3 class="p-3 font-bold text-center">{fav.expand.manga.title}</h3>
                </a>
            {:else}
                <p class="col-span-full text-center text-gray-400">قائمتك فارغة. ابدأ بإضافة بعض المانجا!</p>
            {/each}
        </div>
    </div>
</div>