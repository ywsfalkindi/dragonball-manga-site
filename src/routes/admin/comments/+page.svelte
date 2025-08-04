<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	// ✨ التصحيح: تم استيراد الأنواع من المسار الصحيح ✨
	import type { SubmitFunction, ActionResult } from '@sveltejs/kit';

	export let data: PageData;

	let comments = data.comments;

	// تحديث الواجهة فورًا بعد الحذف الناجح بدون إعادة تحميل الصفحة
	const handleEnhance: SubmitFunction = ({ formData }) => {
		const commentId = formData.get('commentId');
		// Optimistically remove the comment from the UI
		comments = comments.filter((c) => c.id !== commentId);

		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'failure') {
				// If the deletion fails, revert the UI and show an alert
				comments = data.comments; // Restore original comments
				alert(result.data?.error || 'حدث خطأ ما');
			}
			// On success, the UI is already updated, so no action is needed.
		};
	};
</script>

<svelte:head>
	<title>إدارة التعليقات</title>
</svelte:head>

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white">
	<a href="/admin" class="text-blue-400 hover:underline mb-8 block">&larr; العودة إلى لوحة التحكم</a>
	<h1 class="text-4xl font-bold mb-8">إدارة التعليقات</h1>

	<div class="space-y-6">
		{#if comments.length > 0}
			{#each comments as comment (comment.id)}
				<div class="bg-gray-800 p-4 rounded-lg shadow-lg flex items-start gap-4">
					<div class="flex-grow">
						<div class="flex items-center gap-3 mb-2">
							<span class="font-bold text-orange-400"
								>{comment.expand?.user?.username || 'مستخدم محذوف'}</span
							>
							<span class="text-xs text-gray-400">
								{new Date(comment.created).toLocaleString('ar')}
							</span>
						</div>
						<div class="text-gray-300 prose prose-invert">{@html comment.content}</div>
						<div class="text-xs text-blue-400 mt-2">
							{#if comment.expand?.chapter?.expand?.manga && comment.expand?.chapter}
								<a
									href="/manga/{comment.expand.chapter.expand.manga.slug}/{comment.expand.chapter
										.chapter_number}"
									class="hover:underline"
								>
									في: {comment.expand.chapter.expand.manga.title} - فصل #{comment.expand.chapter
										.chapter_number}
								</a>
							{/if}
						</div>
					</div>
					<form method="POST" action="?/deleteComment" use:enhance={handleEnhance}>
						<input type="hidden" name="commentId" value={comment.id} />
						<button
							type="submit"
							class="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition-colors"
						>
							حذف
						</button>
					</form>
				</div>
			{:else}
				<p class="text-center text-gray-400 py-10">لا توجد تعليقات لعرضها.</p>
			{/each}
		{:else}
			<p class="text-center text-gray-400 py-10">لا توجد تعليقات لعرضها.</p>
		{/if}
	</div>
</div>

<style>
	.prose {
		max-width: none;
	}
</style>