<script lang="ts">
    import type { RecordModel } from 'pocketbase';
    export let manga: RecordModel;
</script>

<a
    href="/manga/{manga.slug}"
    class="bg-gray-800 rounded-lg overflow-hidden shadow-xl transform hover:-translate-y-2 transition-all duration-300 group flex flex-col"
>
    <div class="manga-card-image-container w-full overflow-hidden">
        <img
            src={manga.cover_image_url}
            alt="غلاف مانجا {manga.title}"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
    </div>
    <div class="p-6 flex flex-col flex-grow">
        <h3 class="text-2xl font-bold mb-2">{manga.title}</h3>
        <p class="text-gray-400 leading-relaxed line-clamp-3">{manga.description}</p>
    </div>
</a>

<style>
    .line-clamp-3 {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
    }
</style>