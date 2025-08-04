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

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white">
	<a href="/admin" class="text-blue-400 hover:underline mb-8 block text-right">
		&larr; العودة إلى لوحة التحكم
	</a>
	<h1 class="text-4xl font-bold mb-4 text-right">إدارة التعليقات</h1>

	<div class="flex border-b border-gray-700 mb-6 justify-end">
		<button
			on:click={() => (activeTab = 'pending')}
			class="py-2 px-4 transition-colors {activeTab === 'pending'
				? 'border-b-2 border-orange-500 text-orange-500'
				: 'text-gray-400 hover:text-white'}"
		>
			بانتظار الموافقة ({pendingComments.length})
		</button>
		<button
			on:click={() => (activeTab = 'approved')}
			class="py-2 px-4 transition-colors {activeTab === 'approved'
				? 'border-b-2 border-orange-500 text-orange-500'
				: 'text-gray-400 hover:text-white'}"
		>
			الموافق عليها ({approvedComments.length})
		</button>
	</div>

	<div class="space-y-6">
		{#each (activeTab === 'pending' ? pendingComments : approvedComments) as comment (comment.id)}
			<div
				class="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-row-reverse items-start gap-4 text-right"
			>
				<div class="flex-grow">
					<div class="flex items-center gap-3 mb-2 justify-end">
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
								class="w-full bg-gray-700 p-2 rounded"
							/>
							{#if form?.editError && editingId === comment.id}
								<p class="text-red-500 text-sm mt-1">{form.editError}</p>
							{/if}
							<div class="flex gap-2 mt-2 justify-end">
								<button type="submit" class="bg-green-600 text-sm py-1 px-3 rounded">حفظ</button>
								<button
									on:click={() => (editingId = null)}
									type="button"
									class="bg-gray-600 text-sm py-1 px-3 rounded"
								>
									إلغاء
								</button>
							</div>
						</form>
					{:else}
						<div class="text-gray-300 prose prose-invert max-w-none">
							{@html comment.content}
						</div>
					{/if}

					{#if comment.expand?.chapter}
						<div class="text-xs text-blue-400 mt-2">
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

				<div class="flex flex-col gap-2 flex-shrink-0">
					{#if activeTab === 'pending'}
						<form method="POST" action="?/approveComment" use:enhance={handleEnhance}>
							<input type="hidden" name="commentId" value={comment.id} />
							<button
								type="submit"
								class="bg-green-600 text-white w-full py-1 px-3 rounded text-sm hover:bg-green-700"
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
						class="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
					>
						تعديل
					</button>
					<form method="POST" action="?/deleteComment" use:enhance={handleEnhance}>
						<input type="hidden" name="commentId" value={comment.id} />
						<button
							type="submit"
							class="bg-red-600 text-white w-full py-1 px-3 rounded text-sm hover:bg-red-700"
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