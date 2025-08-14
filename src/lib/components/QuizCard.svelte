<script lang="ts">
	// هذا المكون يستقبل "خاصية" واحدة وهي بيانات الاختبار لعرضها
	export let quiz;
</script>

<a
	href="/quizzes/{quiz.slug}"
	class="group transform overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-transform duration-300 hover:-translate-y-2 flex flex-col"
>
	<div class="relative h-48 w-full">
		<img
			src={quiz.cover_image_url || '/placeholder.png'}
			alt={quiz.title}
			class="h-full w-full object-cover"
			loading="lazy"
		/>
		<!-- svelte-ignore element_invalid_self_closing_tag -->
		<div
			class="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent"
		/>
		<div class="absolute top-2 right-2 flex gap-2">
			<span class="rounded-full bg-blue-500/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
				{quiz.difficulty}
			</span>
			<span class="rounded-full bg-purple-500/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
				{quiz.category}
			</span>
		</div>
	</div>
	<div class="flex flex-grow flex-col p-6 text-right">
		<h2 class="text-2xl font-bold text-white transition-colors group-hover:text-orange-400">
			{quiz.title}
		</h2>
		<p class="mt-2 flex-grow text-gray-400 line-clamp-2">{quiz.description}</p>
		<span class="mt-4 text-xs text-gray-500">
			تم الإنشاء: {new Date(quiz.created).toLocaleDateString('ar-EG')}
		</span>
	</div>
</a>