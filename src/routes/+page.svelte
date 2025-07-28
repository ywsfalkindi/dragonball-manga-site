<script lang="ts">
  import type { PageData } from './$types';
  
  // SvelteKit يمرر لنا البيانات التي جلبها الخادم تلقائيًا هنا
  export let data: PageData;

  // نفكك البيانات ونستخرج قائمة المانجا
  const { mangas } = data;
</script>

<svelte:head>
  <title>موقع دراغون بول الأسطوري | اقرأ المانجا أونلاين</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white font-[Tajawal]">
  <header
    class="relative flex items-center justify-center h-96 bg-cover bg-center"
    style="background-image: url('/covers/hero-banner.jpg');"
  >
    <div class="absolute inset-0 bg-black bg-opacity-60" />
    <div class="relative z-10 text-center px-4">
      <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-shadow-lg">
        عالم دراغون بول بين يديك
      </h1>
      <p class="mt-4 text-xl text-gray-200">
        اقرأ جميع فصول المانجا من الطفولة وحتى سوبر بجودة عالية
      </p>
    </div>
  </header>

  <main class="container mx-auto px-4 py-16">
    <h2 class="text-4xl font-bold text-center mb-12 text-orange-500">اختر السلسلة</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
      {#each mangas as manga}
        <a
          href="/manga/{manga.slug}"
          class="bg-gray-800 rounded-lg overflow-hidden shadow-xl transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group"
        >
          <div class="h-64 w-full overflow-hidden">
            <img
              src={manga.cover_image_url}
              alt="غلاف مانجا {manga.title}"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div class="p-6">
            <h3 class="text-2xl font-bold mb-2">{manga.title}</h3>
            <p class="text-gray-400 leading-relaxed">{manga.description}</p>
          </div>
        </a>
      {/each}
    </div>
  </main>
</div>

<style>
  /* هنا نضع تنسيقات خاصة لا يمكن عملها بسهولة بـ Tailwind */
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap');

  .text-shadow-lg {
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
  }
</style>