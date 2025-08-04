<script lang="ts">
    import type { PageData } from './$types';
	export let data: PageData;
</script>

<svelte:head><title>إدارة الوسائط</title></svelte:head>

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white">
	<a href="/admin" class="text-blue-400 hover:underline mb-8 block text-right">
		&larr; العودة إلى لوحة التحكم
	</a>
	<h1 class="text-4xl font-bold mb-8 text-right">إدارة الوسائط</h1>
    <p class="text-gray-400 mb-8 text-right">
        هنا يمكنك عرض الملفات التي تم رفعها ولم تعد مرتبطة بأي مانجا أو فصل.
    </p>

    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">ملفات غير مستخدمة ({data.unusedFiles.length})</h2>
        {#if data.unusedFiles.length > 0}
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {#each data.unusedFiles as file}
                    <div class="relative group">
                        <img src={file.url} alt={file.name} class="rounded-lg aspect-square object-cover" />
                        <div class="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <form method="POST" action="?/deleteFile">
                                <input type="hidden" name="recordId" value={file.recordId} />
                                <input type="hidden" name="fileName" value={file.name} />
                                <button class="text-red-500 hover:text-red-400 text-sm">حذف</button>
                            </form>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <p class="text-gray-400 text-center py-8">لا توجد ملفات غير مستخدمة حاليًا.</p>
        {/if}
    </div>
</div>