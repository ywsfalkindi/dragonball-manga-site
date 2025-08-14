<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';
	import QuizCard from '$lib/components/QuizCard.svelte'; // 1. استيراد المكون الجديد

	export let data: PageData;

	// متغير لتتبع ما إذا كنا نقوم بتحميل المزيد من العناصر
	let loadingMore = false;

	// دالة للذهاب إلى الصفحة التالية
	async function loadMore() {
		loadingMore = true;
		const nextPage = data.currentPage + 1;

		// نقوم ببناء رابط الصفحة التالية مع الحفاظ على كل الفلاتر الحالية
		const url = new URL(window.location.href);
		url.searchParams.set('page', nextPage.toString());

		// نستخدم goto مع خيار noScroll لمنع الصفحة من القفز للأعلى
		await goto(url.toString(), { noScroll: true, keepFocus: true });
		loadingMore = false;
	}

	// هذه الدالة ستقوم بتحديث الرابط عند تغيير أي فلتر
	function applyFilters(event: { currentTarget: any; }) {
		const form = event.currentTarget;
		const formData = new FormData(form);
		// نحذف متغير الصفحة لكي نبدأ من الصفحة الأولى عند كل فلترة جديدة
		formData.delete('page');
		const params = new URLSearchParams(formData as any);
		goto(`?${params.toString()}`, { keepFocus: true });
	}

	// دالة لمسح جميع الفلاتر والعودة للوضع الافتراضي
	function clearFilters() {
		goto('/quizzes');
	}
</script>

<svelte:head>
	<title>ساحة اختبارات Z</title>
	<meta name="description" content="اختبر معلوماتك في عالم دراغون بول وأثبت أنك من نخبة المحاربين!" />
</svelte:head>

{#if $navigating}
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div class="fixed top-0 left-0 right-0 h-1 bg-orange-500 z-50 animate-pulse" transition:fade />
{/if}

<div class="p-8 font-[Tajawal]">
	<div class="container mx-auto" dir="rtl">
		<h1 class="mb-8 text-center text-4xl font-bold text-orange-400">ساحة اختبارات Z</h1>
		<p class="mx-auto mb-12 max-w-2xl text-center text-lg text-gray-300">
			هل تعتقد أنك تعرف كل شيء عن عالم دراغون بول؟ اختبر معلوماتك وأثبت أنك من نخبة المحاربين!
		</p>

		<form method="GET" on:submit|preventDefault={applyFilters} class="mb-12 rounded-lg bg-gray-800 p-4">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
				<div class="md:col-span-2">
					<label for="search" class="block text-sm font-medium text-gray-300 mb-1">ابحث عن اختبار</label>
					<input
						type="search"
						name="search"
						id="search"
						placeholder="مثال: قصة فيجيتا..."
						value={data.currentSearch}
						class="w-full appearance-none rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
					/>
				</div>

				<div>
					<label for="category" class="block text-sm font-medium text-gray-300 mb-1">التصنيف</label>
					<select
						name="category"
						id="category"
						class="w-full appearance-none rounded-lg bg-gray-700 px-4 py-2 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
					>
						<option value="">كل التصنيفات</option>
						{#each data.categories as category}
							<option value={category} selected={data.currentCategory === category}>{category}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="difficulty" class="block text-sm font-medium text-gray-300 mb-1">مستوى الصعوبة</label>
					<select
						name="difficulty"
						id="difficulty"
						class="w-full appearance-none rounded-lg bg-gray-700 px-4 py-2 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
					>
						<option value="">كل المستويات</option>
						{#each data.difficulties as difficulty}
							<option value={difficulty} selected={data.currentDifficulty === difficulty}>{difficulty}</option>
						{/each}
					</select>
				</div>
                
                <div class="flex gap-2 col-span-full md:col-span-1 md:col-start-4">
                    <button type="submit" class="flex-grow rounded-lg bg-orange-600 px-6 py-2 font-bold text-white transition-colors hover:bg-orange-700">
                        تصفية
                    </button>
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button type="button" on:click={clearFilters} class="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-500" title="مسح الفلاتر">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    </button>
                </div>
			</div>
		</form>

		{#if data.quizzes.length > 0}
			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each data.quizzes as quiz (quiz.id)}
					<div in:fade={{ duration: 300, delay: 100 }}>
						<QuizCard {quiz} />
					</div>
				{/each}
			</div>

			{#if data.currentPage < data.totalPages}
				<div class="mt-12 text-center">
					<button
						on:click={loadMore}
						disabled={loadingMore}
						class="rounded-lg bg-orange-700 px-8 py-3 font-bold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-600"
					>
						{loadingMore ? 'جاري التحميل...' : 'تحميل المزيد من الاختبارات'}
					</button>
				</div>
			{/if}
		{:else}
			<div class="rounded-lg bg-gray-800 py-24 text-center">
				<p class="text-2xl text-gray-400">لا توجد اختبارات تطابق خياراتك الحالية.</p>
				<p class="mt-4 text-gray-500">حاول تغيير فلاتر البحث أو اضغط على زر المسح للبدء من جديد!</p>
			</div>
		{/if}
	</div>
</div>