<script lang="ts">
	import type { PageData, ActionData, SubmitFunction } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	export let data: PageData;
	export let form: ActionData;

	let { approvedComments, pendingComments } = data;
	let activeTab: 'pending' | 'approved' = pendingComments.length > 0 ? 'pending' : 'approved';

	let editingId: string | null = null;
	let editingContent = '';

	const handleEnhance: SubmitFunction = ({ action, formData }) => {
		const commentId = formData.get('commentId') as string;

		if (action.pathname.endsWith('/deleteComment')) {
			approvedComments = approvedComments.filter((c) => c.id !== commentId);
			pendingComments = pendingComments.filter((c) => c.id !== commentId);
		}
		if (action.pathname.endsWith('/approveComment')) {
			const commentToMove = pendingComments.find((c) => c.id === commentId);
			if (commentToMove) {
				pendingComments = pendingComments.filter((c) => c.id !== commentId);
				approvedComments = [commentToMove, ...approvedComments];
			}
		}

		return async ({ result }) => {
			if (result.type === 'failure') {
				// @ts-ignore
				alert(result.data?.error || result.data?.editError || 'حدث خطأ ما');
				await invalidateAll();
			}
			if (result.type === 'success' && result.status === 200) {
				editingId = null;
				if (action.pathname.endsWith('/editComment')) {
					const updatedContent = formData.get('content') as string;
					const listToUpdate = approvedComments.find((c) => c.id === commentId)
						? approvedComments
						: pendingComments;
					const commentIndex = listToUpdate.findIndex((c) => c.id === commentId);
					if (commentIndex > -1) {
						listToUpdate[commentIndex].content = updatedContent;
					}
				}
			}
		};
	};
</script>

<svelte:head>
	<title>إدارة التعليقات</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 p-8 font-[Tajawal] text-white">
	<a href="/admin" class="mb-8 block text-right text-blue-400 hover:underline">
		&larr; العودة إلى لوحة التحكم
	</a>
	<h1 class="mb-4 text-right text-4xl font-bold">إدارة التعليقات</h1>

	<div class="mb-6 flex justify-end border-b border-gray-700">
		<button
			on:click={() => (activeTab = 'pending')}
			class="px-4 py-2 transition-colors {activeTab === 'pending'
				? 'border-b-2 border-orange-500 text-orange-500'
				: 'text-gray-400 hover:text-white'}"
		>
			بانتظار الموافقة ({pendingComments.length})
		</button>
		<button
			on:click={() => (activeTab = 'approved')}
			class="px-4 py-2 transition-colors {activeTab === 'approved'
				? 'border-b-2 border-orange-500 text-orange-500'
				: 'text-gray-400 hover:text-white'}"
		>
			الموافق عليها ({approvedComments.length})
		</button>
	</div>

	<div class="space-y-6">
		{#each activeTab === 'pending' ? pendingComments : approvedComments as comment (comment.id)}
			<div
				class="flex flex-row-reverse items-start gap-4 rounded-lg bg-gray-800 p-4 text-right shadow-lg"
			>
				<div class="flex-grow">
					<div class="mb-2 flex items-center justify-end gap-3">
						<span class="font-bold text-orange-400">
							{comment.expand?.user?.username || 'مستخدم محذوف'}
						</span>
						<span class="text-xs text-gray-400">
							{new Date(comment.created).toLocaleString('ar')}
						</span>
					</div>

					{#if editingId === comment.id}
						<form method="POST" action="?/editComment" use:enhance={handleEnhance}>
							<input type="hidden" name="commentId" value={comment.id} />
							<!-- svelte-ignore element_invalid_self_closing_tag -->
							<textarea
								name="content"
								bind:value={editingContent}
								rows="3"
								class="w-full rounded bg-gray-700 p-2"
							/>
							{#if form?.editError && editingId === comment.id}
								<p class="mt-1 text-sm text-red-500">{form.editError}</p>
							{/if}
							<div class="mt-2 flex justify-end gap-2">
								<button type="submit" class="rounded bg-green-600 px-3 py-1 text-sm">حفظ</button>
								<button
									on:click={() => (editingId = null)}
									type="button"
									class="rounded bg-gray-600 px-3 py-1 text-sm"
								>
									إلغاء
								</button>
							</div>
						</form>
					{:else}
						<div class="prose prose-invert max-w-none text-gray-300">
							{@html comment.content}
						</div>
					{/if}

					{#if comment.expand?.chapter}
						<div class="mt-2 text-xs text-blue-400">
							<a
								href="/manga/{comment.expand.chapter.expand.manga.slug}/{comment.expand.chapter
									.chapter_number}"
								class="hover:underline"
								target="_blank"
							>
								في: {comment.expand.chapter.expand.manga.title} - فصل #
								{comment.expand.chapter.chapter_number}
							</a>
						</div>
					{/if}
				</div>

				<div class="flex flex-shrink-0 flex-col gap-2">
					{#if activeTab === 'pending'}
						<form method="POST" action="?/approveComment" use:enhance={handleEnhance}>
							<input type="hidden" name="commentId" value={comment.id} />
							<button
								type="submit"
								class="w-full rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
							>
								موافقة
							</button>
						</form>
					{/if}
					<button
						on:click={() => {
							editingId = comment.id;
							editingContent = comment.content.replace(/<br\s*\/?>/gi, '\n');
						}}
						class="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
					>
						تعديل
					</button>
					<form method="POST" action="?/deleteComment" use:enhance={handleEnhance}>
						<input type="hidden" name="commentId" value={comment.id} />
						<button
							type="submit"
							class="w-full rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
						>
							حذف
						</button>
					</form>
				</div>
			</div>
		{:else}
			<p class="text-center text-gray-400 py-10">
				{activeTab === 'pending' ? 'لا توجد تعليقات تنتظر المراجعة.' : 'لا توجد تعليقات لعرضها.'}
			</p>
		{/each}
	</div>
</div>

<style>
	.prose {
		max-width: none;
	}
</style>
