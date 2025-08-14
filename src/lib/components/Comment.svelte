<script lang="ts">
	import { enhance } from '$app/forms';
	import type { RecordModel } from 'pocketbase';
	import type { CommentType } from '$lib/types';

	export let comment: CommentType;
	export let user: RecordModel | null;

	let showReplyForm = false;
</script>

<article class="flex space-x-4 rtl:space-x-reverse">
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
		<div class="rounded-lg bg-gray-800 p-4">
			<p class="font-bold text-orange-400">{comment.user?.username || 'مستخدم محذوف'}</p>
			<div class="prose prose-invert mt-2 text-gray-300">
				{@html comment.content}
			</div>
		</div>
		<div class="mt-2 flex items-center gap-4 text-xs text-gray-400">
			<form method="POST" action="?/toggleLike" use:enhance>
				<input type="hidden" name="commentId" value={comment.id} />
				<button type="submit" class="flex items-center gap-1 hover:text-white">
					<span>{comment.likes.length || 0}</span>
					<span
						class={user && user.id && comment.likes.includes(user.id) ? 'text-red-500' : ''}
						>❤️</span
					>
				</button>
			</form>

			{#if user}
				<button on:click={() => (showReplyForm = !showReplyForm)} class="hover:text-white">
					رد
				</button>
			{/if}

			<span>{new Date(comment.created).toLocaleString('ar')}</span>
		</div>

		{#if showReplyForm}
			<form method="POST" action="?/addComment" use:enhance class="mt-4 ml-4 rtl:mr-4">
				<input type="hidden" name="parentId" value={comment.id} />
				<textarea
					name="content"
					rows="2"
					placeholder="اكتب ردك..."
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white focus:border-orange-500 focus:outline-none"
					required
				></textarea>
				<button
					type="submit"
					class="mt-2 rounded bg-orange-600 px-4 py-1 text-sm font-bold text-white hover:bg-orange-700"
				>
					إرسال الرد
				</button>
			</form>
		{/if}

		{#if comment.replies && comment.replies.length > 0}
			<div
				class="mt-4 space-y-4 border-r-2 border-gray-700 pr-4 rtl:border-r-0 rtl:border-l-2 rtl:pr-0 rtl:pl-4"
			>
				{#each comment.replies as reply}
					<svelte:self comment={reply} {user} />
				{/each}
			</div>
		{/if}
	</div>
</article>