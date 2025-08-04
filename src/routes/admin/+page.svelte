<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
</script>

<svelte:head><title>لوحة التحكم</title></svelte:head>

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white">
    <h1 class="text-4xl font-bold mb-8">لوحة التحكم</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h2 class="text-xl text-gray-400">عدد المانجا</h2>
            <p class="text-5xl font-bold mt-2 text-orange-500">{data.stats.mangas}</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h2 class="text-xl text-gray-400">عدد الفصول</h2>
            <p class="text-5xl font-bold mt-2 text-orange-500">{data.stats.chapters}</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h2 class="text-xl text-gray-400">عدد المستخدمين</h2>
            <p class="text-5xl font-bold mt-2 text-orange-500">{data.stats.users}</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h2 class="text-xl text-gray-400">عدد التعليقات</h2>
            <p class="text-5xl font-bold mt-2 text-orange-500">{data.stats.comments}</p>
        </div>
    </div>

    <div class="mt-12">
        <h2 class="text-2xl font-bold mb-4">أدوات المحتوى</h2>
        <div class="bg-gray-800 p-4 rounded-lg">
            <a href="/admin/add-chapter" class="block p-4 hover:bg-gray-700 rounded-lg">
                <h3 class="text-xl font-bold text-green-400">إضافة فصل جديد</h3>
                <p class="text-gray-400">أداة لإضافة فصل كامل بصفحاته تلقائيًا.</p>
            </a>
        </div>
    </div>
    
    <div class="mt-12">
        <h2 class="text-2xl font-bold mb-4">إدارة الموقع</h2>
        <div class="bg-gray-800 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/admin/mangas" class="block p-4 hover:bg-gray-700 rounded-lg">
                <h3 class="text-xl font-bold text-blue-400">إدارة المانجا</h3>
                <p class="text-gray-400 mt-1">تعديل وحذف المانجا الموجودة.</p>
            </a>
            <a href="/admin/users" class="block p-4 hover:bg-gray-700 rounded-lg">
                <h3 class="text-xl font-bold text-purple-400">إدارة المستخدمين</h3>
                <p class="text-gray-400 mt-1">عرض المستخدمين، تغيير أدوارهم، وحظرهم.</p>
            </a>
            <a href="/admin/comments" class="block p-4 hover:bg-gray-700 rounded-lg">
                <h3 class="text-xl font-bold text-red-400">إدارة التعليقات</h3>
                <p class="text-gray-400 mt-1">عرض وحذف التعليقات من الموقع.</p>
            </a>
        </div>
    </div>
</div>