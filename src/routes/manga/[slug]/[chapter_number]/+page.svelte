<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;

    const { manga, chapter, pages } = data;
    const currentChapter = Number(chapter.chapter_number);

    // 🔽🔽 هذا هو المتغير المهم الذي كان مفقودًا 🔽🔽
    // تأكد من استبدال الرابط بالرابط الصحيح الخاص بك من Bunny.net
    const baseCdnUrl = "https://dragonball-cdn.b-cdn.net"; 
</script>

<svelte:head>
    <title>قراءة مانجا {manga.title} - الفصل #{chapter.chapter_number}</title>
</svelte:head>

<div class="reader-container bg-black min-h-screen font-[Tajawal]">
    <header class="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-md text-white shadow-lg">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <a href="/manga/{manga.slug}" class="hover:text-orange-500 transition-colors">
                &larr; العودة لقائمة الفصول
            </a>
            <h1 class="font-bold text-lg text-center">{manga.title} - الفصل #{chapter.chapter_number}</h1>
            <div class="w-1/3"></div>
        </div>
    </header>

    <main class="flex flex-col items-center pt-8 pb-4">
        {#each pages as page}
            <img 
                src="{baseCdnUrl}/{page.image_path}" 
                alt="صفحة رقم {page.page_number}"
                class="max-w-full md:max-w-4xl mb-2 shadow-md"
                loading="lazy"
            />
        {:else}
            <div class="text-white text-center py-20">
                <h2 class="text-2xl">لم يتم العثور على صفحات لهذا الفصل.</h2>
                <p class="text-gray-400">قد تكون قيد الإضافة حاليًا.</p>
            </div>
        {/each}
    </main>

    <footer class="container mx-auto px-4 py-6 flex justify-between items-center text-white">
        <a 
            href="/manga/{manga.slug}/{currentChapter - 1}" 
            class="bg-orange-600 py-2 px-6 rounded hover:bg-orange-700 transition-colors {currentChapter <= 1 ? 'opacity-50 pointer-events-none' : ''}">
            الفصل السابق
        </a>
        <a 
            href="/manga/{manga.slug}/{currentChapter + 1}" 
            class="bg-orange-600 py-2 px-6 rounded hover:bg-orange-700 transition-colors">
            الفصل التالي
        </a>
    </footer>
</div>