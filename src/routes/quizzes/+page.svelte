<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	// ✨ تحسين: استلام قيم الفلترة الحالية لعرضها في النموذج
	$: ({ quizzes, currentCategory, currentDifficulty } = data);
</script>

<svelte:head>
	<title>اختبارات دراغون بول</title>
</svelte:head>

<div class="p-8 font-[Tajawal]">
	<div class="container mx-auto" dir="rtl">
		<h1 class="text-4xl font-bold mb-8 text-center text-orange-400">ساحة اختبارات Z</h1>
		<p class="text-lg text-gray-300 text-center mb-12 max-w-2xl mx-auto">
			هل تعتقد أنك تعرف كل شيء عن عالم دراغون بول ؟ اختبر معلوماتك وأثبت أنك من نخبة المحاربين !
		</p>

		<form
			method="GET"
			class="flex flex-wrap justify-center items-center gap-4 mb-12 p-4 bg-gray-800 rounded-lg"
		>
			<div class="flex-grow md:flex-grow-0">
				<label for="category" class="sr-only">التصنيف</label>
				<select
					name="category"
					id="category"
					class="w-full appearance-none bg-gray-700 text-white px-4 py-2 rounded-lg pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500"
				>
					<option value="" selected={currentCategory === ''}>كل التصنيفات</option>
					<option value="شخصيات" selected={currentCategory === 'شخصيات'}>شخصيات</option>
					<option value="أحداث" selected={currentCategory === 'أحداث'}>أحداث</option>
					<option value="تقنيات" selected={currentCategory === 'تقنيات'}>تقنيات</option>
					<option value="دراغون بول" selected={currentCategory === 'دراغون بول'}>دراغون بول</option>
					<option value="دراغون بول Z" selected={currentCategory === 'دراغون بول Z'}>دراغون بول Z</option>
					<option value="دراغون بول Super" selected={currentCategory === 'دراغون بول Super'}>دراغون بول Super</option>
				</select>
			</div>
			<div class="flex-grow md:flex-grow-0">
				<label for="difficulty" class="sr-only">مستوى الصعوبة</label>
				<select
					name="difficulty"
					id="difficulty"
					class="w-full appearance-none bg-gray-700 text-white px-4 py-2 rounded-lg pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500"
				>
					<option value="" selected={currentDifficulty === ''}>كل المستويات</option>
					<option value="سهل" selected={currentDifficulty === 'سهل'}>سهل</option>
					<option value="متوسط" selected={currentDifficulty === 'متوسط'}>متوسط</option>
					<option value="صعب" selected={currentDifficulty === 'صعب'}>صعب</option>
					<option value="خبير" selected={currentDifficulty === 'خبير'}>خبير</option>
				</select>
			</div>
			<button
				type="submit"
				class="w-full md:w-auto bg-orange-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-700 transition-colors"
			>
				تصفية
			</button>
		</form>

		{#if quizzes.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{#each quizzes as quiz (quiz.id)}
					<a
						href="/quizzes/{quiz.slug}"
						class="bg-gray-800 rounded-lg shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300"
					>
						<div class="manga-card-image-container relative">
							<img
								src={quiz.cover_image_url || '/placeholder.png'}
								alt={quiz.title}
								class="w-full h-full object-cover"
							/>
							<!-- svelte-ignore element_invalid_self_closing_tag -->
							<div
								class="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors"
							/>
							<div class="absolute top-2 right-2 flex gap-2">
								<span class="px-2 py-1 text-xs rounded-full bg-blue-500/80 text-white backdrop-blur-sm"
									>{quiz.difficulty}</span
								>
								<span class="px-2 py-1 text-xs rounded-full bg-purple-500/80 text-white backdrop-blur-sm"
									>{quiz.category}</span
								>
							</div>
						</div>
						<div class="p-6 text-right">
							<h2 class="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
								{quiz.title}
							</h2>
							<p class="text-gray-400 mt-2 line-clamp-2">{quiz.description}</p>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16 bg-gray-800 rounded-lg">
				<p class="text-2xl text-gray-400">لا توجد اختبارات تطابق خياراتك الحالية.</p>
				<p class="text-gray-500 mt-2">حاول تغيير فلاتر البحث أو عد قريبًا!</p>
			</div>
		{/if}
	</div>
</div>