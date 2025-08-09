<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;

    function getRankClass(rank: number): string {
        if (rank === 1) return 'bg-yellow-500/10 text-yellow-300';
        if (rank === 2) return 'bg-gray-400/10 text-gray-200';
        if (rank === 3) return 'bg-orange-700/10 text-orange-400';
        return 'border-gray-700';
    }
</script>

<svelte:head>
    <title>لوحة الصدارة</title>
</svelte:head>

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white" dir="rtl">
    <div class="container mx-auto">
        <h1 class="text-4xl font-bold mb-2 text-center text-orange-400">لوحة صدارة المحاربين</h1>
        <p class="text-center text-gray-300 mb-12">
            شاهد ترتيب أقوى المقاتلين في الموقع بناءً على مستوى طاقتهم
        </p>

        <div class="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-2xl overflow-hidden" dir="rtl">
            <table class="w-full text-center">
                <thead class="bg-gray-700">
                    <tr>
                        <th class="p-4 w-20">الترتيب</th>
                        <th class="p-4">اسم المحارب</th>
                        <th class="p-4">مستوى الطاقة</th>
                        <th class="p-4">الخبرة (XP)</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.users as user, i}
                        {@const rank = i + 1}
                        <tr class="border-b transition-colors duration-300 {getRankClass(rank)}">
                            <td class="p-4 text-2xl font-bold">
                                {#if rank === 1}<span>🥇</span>{:else if rank === 2}<span>🥈</span>{:else if rank === 3}<span>🥉</span>{:else}<span>{rank}</span>{/if}
                            </td>
                            <td class="p-4 font-semibold text-center">
    <span>{user.displayName}</span>

    {#if user.title === 'محارب Z'}
        <div class="relative inline-block w-9 h-9 ml-2 align-middle" title="محارب Z">
            <video
                src="/images/z-warrior-medal.webm"
                autoplay
                loop
                muted
                playsinline
                class="absolute top-0 left-0 w-full h-full rounded-full object-cover"
            ></video>
        </div>
        {:else if user.title}
        <span class="text-xs ml-2 py-0.5 px-2 rounded-full bg-yellow-500 text-black align-middle">
            {user.title}
        </span>
    {/if}
</td>
                            <td class="p-4 text-lg font-mono text-green-400">{user.power_level}</td>
                            <td class="p-4 font-mono text-gray-400">{user.xp}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>