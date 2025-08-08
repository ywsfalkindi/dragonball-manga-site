<script lang="ts">
	import type { PageData } from './$types';
	
	export let data: PageData;
</script>

<svelte:head>
	<title>اختبارات دراغون بول</title>
</svelte:head>

<div class="p-8 font-[Tajawal]">
	<div class="container mx-auto">
		<h1 class="text-4xl font-bold mb-8 text-center text-orange-400">ساحة اختبارات Z</h1>
		<p class="text-lg text-gray-300 text-center mb-12 max-w-2xl mx-auto">
			هل تعتقد أنك تعرف كل شيء عن عالم دراغون بول؟ اختبر معلوماتك وأثبت أنك من نخبة المحاربين!
		</p>

		{#if data.quizzes.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{#each data.quizzes as quiz (quiz.id)}
					<a href="/quizzes/{quiz.slug}" class="bg-gray-800 rounded-lg shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300">
						<div class="manga-card-image-container relative">
							<img src={quiz.cover_image_url || '/placeholder.png'} alt={quiz.title} class="w-full h-full object-cover"/>
							<div class="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors"></div>
						</div>
						<div class="p-6 text-right">
							<h2 class="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">{quiz.title}</h2>
							<p class="text-gray-400 mt-2 line-clamp-2">{quiz.description}</p>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16 bg-gray-800 rounded-lg">
				<p class="text-2xl text-gray-400">لا توجد اختبارات متاحة حاليًا.</p>
				<p class="text-gray-500 mt-2">يعمل فريقنا على تجهيز المزيد من التحديات، عد قريبًا!</p>
			</div>
		{/if}
	</div>
</div>