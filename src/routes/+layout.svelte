<script lang="ts">
    import type { LayoutData } from './$types';
    import "../app.css";
    import { navigating } from '$app/stores';
	export let data: LayoutData;
</script>

{#if $navigating}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
        <div class="w-16 h-16 border-4 border-t-orange-500 border-gray-600 rounded-full animate-spin"></div>
    </div>
{/if}

<div class="min-h-screen bg-gray-900 text-white font-[Tajawal]">
    <nav class="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-50">
        <div class="container mx-auto flex justify-between items-center flex-wrap gap-4">
            <a href="/" class="text-2xl font-bold text-orange-500 hover:text-orange-400">
                موقع دراغون بول
            </a>
            <div class="text-sm">
                {#if data.user}
                    <div class="flex items-center gap-x-4">
                        <span class="hidden sm:inline">أهلاً بك، {data.user.email}</span>
                        <a href="/profile" class="py-2 px-4 bg-orange-600 rounded hover:bg-orange-700 whitespace-nowrap">ملفي الشخصي</a>
                    </div>
                {:else}
                    <div class="flex items-center gap-x-2">
                        <a href="/login" class="py-2 px-4 hover:bg-gray-700 rounded whitespace-nowrap">تسجيل الدخول</a>
                        <a href="/signup" class="py-2 px-4 bg-orange-600 rounded hover:bg-orange-700 whitespace-nowrap">إنشاء حساب</a>
                    </div>
                {/if}
            </div>
        </div>
    </nav>
    <slot />
</div>