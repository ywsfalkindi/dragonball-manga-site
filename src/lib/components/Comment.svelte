<script lang="ts">
	import { enhance } from '$app/forms';
	import type { RecordModel } from 'pocketbase';
	import type { CommentType } from '$lib/types';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';

	export let comment: CommentType;
	export let user: RecordModel | null;
	export let chapterId: string;
	let showReplyForm = false;

	let replyContent = '';
	let isReplying = false;
	let replyError: string | null = null;
	let isDeleted = false; // لإخفاء التعليق عند الحذف

	async function handleReplySubmit() {
		if (!replyContent.trim()) {
			replyError = 'الرد لا يمكن أن يكون فارغاً';
			return;
		}
		if (isReplying) return;

		isReplying = true;
		replyError = null;

		try {
			const response = await fetch(`/api/comments/${chapterId}`, {
				// نستخدم chapterId الذي أضفناه
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: replyContent,
					parentComment: comment.id // ID التعليق الأب
				})
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.error || 'حدث خطأ ما');
			}

			const newReply = await response.json();

			// الخطوة 2: أضفه إلى مصفوفة الردود الخاصة بالتعليق الأب
			if (!comment.replies) {
				comment.replies = [];
			}
			// نضع الرد الجديد في بداية القائمة ليظهر أولاً
			comment.replies = [newReply, ...comment.replies];

			// الخطوة 3: إفراغ الفورم وإغلاقه
			replyContent = '';
			showReplyForm = false;

			// await invalidateAll(); // <--- ✨ تم حذف هذا السطر

			// --- ✨ نهاية الإصلاح ✨ ---
		} catch (err: any) {
			console.error('Failed to submit reply:', err);
			replyError = err.message || 'فشل إرسال الرد';
		} finally {
			isReplying = false;
		}
	}

	let editing = false;
	let editedContent = comment.content.replace(/<br\s*\/?>/gi, '\n');

	// ✨ إضافة: تعريف دالة تأكيد الحذف
	const handleDelete: SubmitFunction = ({ cancel }) => {
		if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
			cancel();
			return; // ✨ إضافة: إيقاف التنفيذ إذا ألغى المستخدم
		}

		// هذا هو السر: `return` هي التي تعمل بعد إرسال الفورم
		return async ({ result }) => {
			if (result.type === 'success' && result.data?.deleteSuccess) {
				// ✨ نجح الحذف! قم بإخفاء التعليق فوراً ✨
				isDeleted = true;
			} else if (result.type === 'failure') {
				// @ts-ignore
				alert(result.data?.error || 'فشل حذف التعليق');
			}
		};
	};
	const handleEdit: SubmitFunction = () => {
		// هذا يعمل بعد الإرسال
		return async ({ result }) => {
			if (result.type === 'success' && result.data?.editSuccess) {
				// ✨ نجح التعديل! قم بتحديث المحتوى فوراً ✨
				comment.content = result.data.newContent;
				// وقم بإغلاق وضع التعديل
				editing = false;
			} else if (result.type === 'failure') {
				// @ts-ignore
				alert(result.data?.error || 'فشل تعديل التعليق');
			}
		};
	};
	const handleLike: SubmitFunction = () => {
		// هذا يعمل بعد الإرسال
		return async ({ result }) => {
			if (result.type === 'success' && result.data?.likeSuccess) {
				// ✨ نجح الإعجاب! قم بتحديث قائمة الإعجابات فوراً ✨
				comment.likes = result.data.newLikes;
			} else if (result.type === 'failure') {
				// @ts-ignore
				alert(result.data?.error || 'يجب تسجيل الدخول أولاً');
			}
		};
	};
</script>

{#if !isDeleted}
	<article class="flex flex-row-reverse space-x-4 space-x-reverse">
		<div class="flex-shrink-0">
			{#if comment.user?.avatarUrl}
				<img
					src={comment.user.avatarUrl}
					alt="الصورة الرمزية لـ {comment.user.username}"
					class="h-12 w-12 rounded-full border-2 border-gray-700 object-cover"
				/>
			{:else}
				<div
					class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 font-bold text-white"
				>
					{#if comment.user}
						{(comment.user.username || '?').charAt(0).toUpperCase()}
					{:else}
						؟
					{/if}
				</div>
			{/if}
		</div>

		<div class="flex-grow">
			<div
				class="rounded-lg p-4"
				class:bg-gray-800={!comment.user?.isAdmin}
				class:bg-blue-950={comment.user?.isAdmin}
				class:border={comment.user?.isAdmin}
				class:border-blue-700={comment.user?.isAdmin}
			>
				<p class="flex items-center justify-end gap-2 text-right font-bold text-orange-400">
					<span>{comment.user?.username || 'مستخدم محذوف'}</span>
					{#if comment.user?.isAdmin}
						<span class="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
							مشرف
						</span>
					{/if}
				</p>

				{#if editing}
					<form method="POST" action="?/editComment" use:enhance={handleEdit}>
						<input type="hidden" name="commentId" value={comment.id} />
						<textarea
							name="content"
							bind:value={editedContent}
							class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-right text-white"
							rows="3"
						></textarea>
						<div class="mt-2 flex items-center justify-end gap-2">
							<button type="submit" class="rounded bg-green-600 px-3 py-1 text-sm text-white">
								حفظ
							</button>
							<button
								type="button"
								on:click={() => (editing = false)}
								class="rounded bg-gray-600 px-3 py-1 text-sm text-white">إلغاء</button
							>
						</div>
					</form>
				{:else}
					<div class="prose prose-invert mt-2 text-right text-gray-300">
						{@html comment.content}
					</div>
				{/if}
			</div>

			<div class="mt-2 flex items-center justify-end gap-4 text-xs text-gray-400">
				<span>
					{new Date(comment.created).toLocaleString('ar-OM', {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
						minute: '2-digit'
					})}
				</span>

				{#if user && user.id === comment.user?.id}
					<form method="POST" action="?/deleteComment" use:enhance={handleDelete}>
						<input type="hidden" name="commentId" value={comment.id} />
						<button type="submit" class="text-red-500 hover:text-red-400"> حذف </button>
					</form>
					<button on:click={() => (editing = true)} class="hover:text-white"> تعديل </button>
				{/if}

				{#if user}
					<button on:click={() => (showReplyForm = !showReplyForm)} class="hover:text-white">
						رد
					</button>
				{/if}

				<form method="POST" action="?/toggleLike" use:enhance={handleLike}>
					<input type="hidden" name="commentId" value={comment.id} />
					<button type="submit" class="flex items-center gap-1 hover:text-white">
						<span>{comment.likes.length || 0}</span>
						<span class={user && user.id && comment.likes.includes(user.id) ? 'text-red-500' : ''}
							>❤️</span
						>
					</button>
				</form>
			</div>

			{#if showReplyForm}
				<form on:submit|preventDefault={handleReplySubmit} class="mt-4 mr-4 text-right">
					<div class="mb-2 border-r-4 border-gray-600 pr-3 text-sm text-gray-400">
						<p class="font-bold text-gray-300">ردًا على {comment.user?.username || 'مستخدم'}:</p>
						<blockquote class="line-clamp-2 italic opacity-80">
							{@html comment.content}
						</blockquote>
					</div>
					<textarea
						name="content"
						rows="2"
						placeholder="اكتب ردك..."
						class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-right text-white focus:border-orange-500 focus:outline-none"
						required
						bind:value={replyContent}
						disabled={isReplying}
					></textarea>
					{#if replyError}
						<p class="mt-2 text-sm text-red-500">{replyError}</p>
					{/if}
					<div class="mt-2 flex items-center justify-end gap-2">
						<button
							type="submit"
							class="rounded bg-orange-600 px-4 py-1 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
							disabled={isReplying}
						>
							{isReplying ? '...' : 'إرسال الرد'}
						</button>
						<button
							type="button"
							on:click={() => (showReplyForm = false)}
							class="rounded bg-gray-600 px-4 py-1 text-sm font-bold text-white hover:bg-gray-500"
						>
							إلغاء
						</button>
					</div>
				</form>
			{/if}

			{#if comment.replies && comment.replies.length > 0}
				<div class="mt-4 space-y-4 border-r-2 border-gray-700 pr-4">
					{#each comment.replies as reply}
						<svelte:self comment={reply} {user} />
					{/each}
				</div>
			{/if}
		</div>
	</article>
{/if}
