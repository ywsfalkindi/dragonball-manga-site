<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
	// مجموعة لتتبع السجلات التي يتم حذفها حاليًا
	let deleting = new Set<string>();
	$: ({ history, searchTerm } = data)
</script>

<svelte:head>
	<title>سجل القراءة</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 p-8 font-[Tajawal] text-white">
	<div class="container mx-auto">
		<a href="/profile" class="mb-8 block text-blue-400 hover:underline"
			>&larr; العودة إلى الملف الشخصي</a
		>
		<h1 class="mb-8 text-4xl font-bold" dir="rtl">سجل القراءة الخاص بي</h1>
        <form method="GET" class="mb-8" dir="rtl">
    <div class="relative">
        <input
            type="search"
            name="q"
            placeholder="ابحث عن مانجا في سجلك..."
            class="w-full rounded-md border-2 border-gray-600 bg-gray-700 p-3 pr-10 text-white focus:border-orange-500 focus:outline-none"
            value={data.searchTerm || ''}
        />
        <button type="submit" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label="بحث">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
    </div>
</form>
		<div class="rounded-lg bg-gray-800 shadow-lg" dir="rtl">
			<ul class="divide-y divide-gray-700">
				{#each data.history.items as record (record.id)}
					<li class="flex items-center gap-4 p-4">
    <a href="/manga/{record.expand?.manga.slug}">
        <img
            src={record.expand?.manga.cover_image_url || '/placeholder.png'}
            alt="غلاف {record.expand?.manga.title}"
            class="h-24 w-16 rounded-md object-cover shadow-md transition-transform hover:scale-105"
            loading="lazy"
        />
    </a>

    <div class="flex-grow">
        <a
            href="/manga/{record.expand?.manga.slug}/{record.expand?.chapter.chapter_number}"
            class="text-lg font-semibold hover:text-orange-400"
        >
            {record.expand?.manga.title} - الفصل {record.expand?.chapter.chapter_number}
        </a>
        <p class="mt-1 text-sm text-gray-400">
            تاريخ القراءة: {new Date(record.created).toLocaleString('ar')}
        </p>
    </div>

    <div class="flex items-center gap-3">
        <a
            href="/manga/{record.expand?.manga.slug}/{record.expand?.chapter.chapter_number}"
            class="rounded-full bg-orange-600 px-3 py-1 text-sm font-bold text-white hover:bg-orange-500"
        >
            إعادة القراءة
        </a>

        <form
            method="POST"
            action="?/deleteRecord"
            use:enhance={() => {
                deleting.add(record.id);
                deleting = deleting;

                return async ({ update }) => {
                    deleting.delete(record.id);
                    deleting = deleting;
                    await update();
                };
            }}
        >
            <input type="hidden" name="id" value={record.id} />
            <button
                type="submit"
                class="rounded-full bg-red-700 px-3 py-1 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-500"
                disabled={deleting.has(record.id)}
            >
                {deleting.has(record.id) ? '...جاري الحذف' : 'حذف'}
            </button>
        </form>
    </div>
</li>
				{:else}
					<li class="p-8 text-center text-gray-400">سجل القراءة فارغ، ابدأ بتصفح المانجا</li>
				{/each}
			</ul>
		</div>
	</div>

	<div class="mt-8 flex items-center justify-center gap-4">
	{#if data.history.page > 1}
		<a
			href="?page={data.history.page - 1}{data.searchTerm ? `&q=${data.searchTerm}` : ''}"
			class="rounded-md bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-500"
			>الصفحة السابقة</a
		>
	{/if}

	{#if data.history.totalPages > 0}
		<span class="text-gray-400">
			صفحة {data.history.page} من {data.history.totalPages}
		</span>
	{/if}

	{#if data.history.page < data.history.totalPages}
		<a
			href="?page={data.history.page + 1}{data.searchTerm ? `&q=${data.searchTerm}` : ''}"
			class="rounded-md bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-500"
			>الصفحة التالية</a
		>
	{/if}
</div>
</div>