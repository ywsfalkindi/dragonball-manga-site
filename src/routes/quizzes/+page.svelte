<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';
	import QuizCard from '$lib/components/QuizCard.svelte';
	// سنضيف هذا المكون الجديد بعد قليل
	import QuizCardSkeleton from '$lib/components/QuizCardSkeleton.svelte';

	export let data: PageData;

	// --- 1. متغيرات محلية لإدارة الحالة بشكل تفاعلي ---
	let quizzes = data.quizzes;
	let currentPage = data.currentPage;
	let totalPages = data.totalPages;
	let loadingMore = false;
	// لتتبع حالة التحميل الأولية للصفحة
	let initialLoading = true;

	// --- 2. دالة Debounce لتأخير البحث التلقائي ---
	function debounce<T extends (...args: any[]) => any>(func: T, timeout = 500) {
		let timer: ReturnType<typeof setTimeout>;
		return (...args: Parameters<T>) => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				func(...args);
			}, timeout);
		};
	}

	// --- 3. دوال جديدة لتطبيق الفلاتر بذكاء ---
	function applyFilters(form: HTMLFormElement) {
		const formData = new FormData(form);
		formData.delete('page'); // نبدأ دائماً من صفحة 1 عند الفلترة
		const params = new URLSearchParams(formData as any);
		goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
	}

	// ننشئ نسخة "مُؤخرة" من دالة تطبيق الفلاتر
	const debouncedApplyFilters = debounce((form) => applyFilters(form));

	function handleFormInput(event: Event) {
		const form = event.currentTarget as HTMLFormElement;
		// البحث سيعمل بعد التوقف عن الكتابة بنصف ثانية
		debouncedApplyFilters(form);
	}

	function handleFormChange(event: Event) {
		const form = event.currentTarget as HTMLFormElement;
		// الفلترة بالتصنيف والمستوى ستكون فورية
		applyFilters(form);
	}

	// --- 4. دالة "تحميل المزيد" الجديدة والمحسنة ---
	async function loadMore() {
		if (loadingMore || currentPage >= totalPages) return;
		loadingMore = true;

		const nextPage = currentPage + 1;
		const url = new URL(window.location.href);
		url.pathname = '/api/quizzes'; // نستهدف مسار الـ API الذي أنشأناه
		url.searchParams.set('page', nextPage.toString());

		try {
			const response = await fetch(url.toString());
			const newResult = await response.json();

			if (newResult && newResult.items) {
				// الأهم: نضيف الاختبارات الجديدة إلى القائمة الحالية ولا نستبدلها
				quizzes = [...quizzes, ...newResult.items];
				currentPage = newResult.page;
			}
		} catch (err) {
			console.error('Failed to load more quizzes:', err);
		} finally {
			loadingMore = false;
		}
	}

	// --- 5. مراقبة تغيير الفلاتر لإعادة تعيين قائمة الاختبارات ---
	// هذا السطر السحري يعيد تعيين القائمة عند كل فلترة جديدة من الخادم
	$: if (data.quizzes) {
		quizzes = data.quizzes;
		currentPage = data.currentPage;
		totalPages = data.totalPages;
		initialLoading = false; // نوقف حالة التحميل الأولية
	}

	function clearFilters() {
		goto('/quizzes');
	}
</script>

<svelte:head>
	<title>ساحة اختبارات Z</title>
	<meta
		name="description"
		content="اختبر معلوماتك في عالم دراغون بول وأثبت أنك من نخبة المحاربين!"
	/>
</svelte:head>

{#if $navigating}
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div class="fixed top-0 right-0 left-0 z-50 h-1 animate-pulse bg-orange-500" transition:fade />
{/if}

<div class="p-8 font-[Tajawal]">
	<div class="container mx-auto" dir="rtl">
		<h1 class="mb-8 text-center text-4xl font-bold text-orange-400">ساحة اختبارات Z</h1>
		<p class="mx-auto mb-12 max-w-2xl text-center text-lg text-gray-300">
			هل تعتقد أنك تعرف كل شيء عن عالم دراغون بول؟ اختبر معلوماتك وأثبت أنك من نخبة المحاربين!
		</p>

		<form
			method="GET"
			on:submit|preventDefault={(e) => applyFilters(e.currentTarget)}
			class="mb-12 rounded-lg bg-gray-800 p-4"
		>
			<div class="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
				<div class="md:col-span-2">
					<label for="search" class="mb-1 block text-sm font-medium text-gray-300"
						>ابحث عن اختبار</label
					>
					<input
						type="search"
						name="search"
						id="search"
						placeholder="مثال: قصة فيجيتا..."
						value={data.currentSearch}
						on:input={handleFormInput}
						class="w-full appearance-none rounded-lg bg-gray-700 px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="category" class="mb-1 block text-sm font-medium text-gray-300">التصنيف</label>
					<select
						name="category"
						id="category"
						on:change={handleFormChange}
						class="w-full appearance-none rounded-lg bg-gray-700 px-4 py-2 pr-8 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
					>
						<option value="">كل التصنيفات</option>
						{#each data.categories as category}
							<option value={category} selected={data.currentCategory === category}
								>{category}</option
							>
						{/each}
					</select>
				</div>

				<div>
					<label for="difficulty" class="mb-1 block text-sm font-medium text-gray-300"
						>مستوى الصعوبة</label
					>
					<select
						name="difficulty"
						id="difficulty"
						class="w-full appearance-none rounded-lg bg-gray-700 px-4 py-2 pr-8 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
					>
						<option value="">كل المستويات</option>
						{#each data.difficulties as difficulty}
							<option value={difficulty} selected={data.currentDifficulty === difficulty}
								>{difficulty}</option
							>
						{/each}
					</select>
				</div>

				<div class="col-span-full flex gap-2 md:col-span-1 md:col-start-4">
					<button
						type="submit"
						class="flex-grow rounded-lg bg-orange-600 px-6 py-2 font-bold text-white transition-colors hover:bg-orange-700"
					>
						تصفية
					</button>
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<button
						type="button"
						on:click={clearFilters}
						class="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-500"
						title="مسح الفلاتر"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-rotate-ccw"
							><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path
								d="M3 3v5h5"
							/></svg
						>
					</button>
				</div>
			</div>
		</form>

		{#if initialLoading || ($navigating && quizzes.length === 0)}
			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each Array(8) as _}
					<QuizCardSkeleton />
				{/each}
			</div>
		{:else if quizzes.length > 0}
			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each quizzes as quiz (quiz.id)}
					<div in:fade={{ duration: 300, delay: 100 }}>
						<QuizCard {quiz} />
					</div>
				{/each}
			</div>

			{#if currentPage < totalPages}
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

			{#if loadingMore}
				<div class="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each Array(4) as _}
						<QuizCardSkeleton />
					{/each}
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
