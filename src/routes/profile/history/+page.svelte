<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { addToast } from '$lib/stores/toast';
	import { invalidateAll } from '$app/navigation';
	import type { ActionResult } from '@sveltejs/kit';
	import { fly } from 'svelte/transition';
	import { goto } from '$app/navigation';

	export let data: PageData;

	let deleting = new Set<string>();
	$: ({ history, searchTerm } = data);

	let selected = new Set<string>();
	let searchInputValue = data.searchTerm || '';
	let debounceTimer: ReturnType<typeof setTimeout>;

	function handleSearchInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const url = new URL(window.location.href);
			url.searchParams.set('q', searchInputValue);
			url.searchParams.set('page', '1'); // إعادة الترقيم إلى الصفحة 1 عند كل بحث جديد
			goto(url.toString(), { keepFocus: true, noScroll: true });
		}, 400); // ننتظر 400 مللي ثانية بعد توقف المستخدم عن الكتابة
	}

	function toggleSelection(id: string) {
		if (selected.has(id)) {
			selected.delete(id);
		} else {
			selected.add(id);
		}
		selected = selected;
	}

	function handleFormResult({
		result,
		formElement
	}: {
		result: ActionResult;
		formElement: HTMLFormElement;
	}) {
		if (result.type === 'success' && result.data?.message) {
			addToast(result.data.message, 'success');
			if (formElement.action.includes('deleteSelected')) {
				selected.clear();
				selected = selected;
			}
		} else if (result.type === 'failure' || (result.type === 'success' && !result.data?.success)) {
			addToast(result.data?.message || 'حدث خطأ ما', 'error');
		}
	}
</script>

<svelte:head>
	<title>سجل القراءة</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 p-4 font-[Tajawal] text-white md:p-8">
	<div class="container mx-auto max-w-4xl">
		<a href="/profile" class="mb-8 block text-blue-400 hover:underline"
			>&larr; العودة إلى الملف الشخصي</a
		>

		<div
			dir="rtl"
			class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
		>
			<h1 class="text-3xl font-bold md:text-4xl">سجل القراءة الخاص بي</h1>
			{#if data.history.totalItems > 0}
				<form
					method="POST"
					action="?/clearHistory"
					use:enhance={({ formElement, cancel }) => {
						if (
							!confirm(
								'هل أنت متأكد من رغبتك في مسح سجل القراءة بالكامل؟ لا يمكن التراجع عن هذا الإجراء.'
							)
						) {
							cancel();
						}

						return async ({ result }) => {
							handleFormResult({ result, formElement });
							await invalidateAll();
						};
					}}
				>
					<button
						type="submit"
						class="flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-1.5 text-sm font-semibold text-red-400 transition-colors duration-200 hover:border-red-500 hover:bg-red-500 hover:text-white"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M3 6h18" /><path
								d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
							/><line x1="10" y1="11" x2="10" y2="17" /><line
								x1="14"
								y1="11"
								x2="14"
								y2="17"
							/></svg
						>
						<span>مسح كل السجل</span>
					</button>
				</form>
			{/if}
		</div>

		<form method="GET" class="mb-8" dir="rtl">
			<div class="relative">
				<input
					type="search"
					name="q"
					placeholder="ابحث في سجلك..."
					class="w-full rounded-xl border-2 border-gray-700 bg-gray-800 p-3 pr-10 text-white transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
					bind:value={searchInputValue}
					on:input={handleSearchInput}
				/>
				<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
					<img src="/icons/radar.png" alt="Search" class="h-6 w-6" />
				</div>
			</div>
		</form>

		{#if selected.size > 0}
			<div dir="rtl" class="animate-fade-in mb-6 flex items-center gap-4">
				<form
					method="POST"
					action="?/deleteSelected"
					use:enhance={({ formElement }) => {
						return async ({ result }) => {
							handleFormResult({ result, formElement });
							// ✨✨ 2. هذا السطر يحل مشكلة عدم اختفاء العناصر المحذوفة ✨✨
							if (result.type === 'success') {
								await invalidateAll();
							}
						};
					}}
				>
					{#each [...selected] as id}
						<input type="hidden" name="ids" value={id} />
					{/each}
					<button
						type="submit"
						class="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:bg-red-500"
					>
						حذف ({selected.size}) سجلات محددة
					</button>
				</form>
				<button
					on:click={() => (selected = new Set())}
					class="text-sm text-gray-400 hover:underline">إلغاء التحديد</button
				>
			</div>
		{/if}

		<div class="rounded-lg" dir="rtl">
			<ul class="flex flex-col gap-4">
				{#each data.history.items as record (record.id)}
					<li
						transition:fly={{ y: 20, duration: 250 }}
						class="rounded-xl bg-gray-800 p-4 shadow-md ring-1 ring-white/5 transition-all duration-300 hover:shadow-lg {selected.has(
							record.id
						)
							? 'bg-orange-500/10 ring-orange-500'
							: 'hover:bg-gray-700/60'}"
					>
						<div class="flex items-start gap-4">
							<label class="relative flex h-8 w-8 cursor-pointer items-center justify-center">
								<input
									type="checkbox"
									checked={selected.has(record.id)}
									on:change={() => toggleSelection(record.id)}
									class="absolute h-full w-full cursor-pointer opacity-0"
								/>
								<img
									src="/icons/{selected.has(record.id) ? 'db-unchecked.png' : 'db-checked.png'}"
									alt="Select Record"
									class="h-7 w-7 transition-transform duration-200 ease-in-out {selected.has(
										record.id
									)
										? 'scale-110 -rotate-6'
										: 'scale-90'}"
								/>
							</label>
							<a href="/manga/{record.expand?.manga.slug}" class="flex-shrink-0">
								<img
									src={record.expand?.manga.cover_image_url || '/placeholder.png'}
									alt="غلاف {record.expand?.manga.title}"
									class="h-28 w-20 rounded-md object-cover shadow-md"
									loading="lazy"
								/>
							</a>

							<div class="flex-grow">
								<a
									href="/manga/{record.expand?.manga.slug}/{record.expand?.chapter.chapter_number}"
									class="text-lg font-bold hover:text-orange-400"
								>
									{record.expand?.manga.title} - الفصل {record.expand?.chapter.chapter_number}
								</a>
								<p class="mt-1 text-sm text-gray-400">
									{new Date(record.created).toLocaleDateString('ar-EG', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</p>

								<div class="mt-4 flex items-center gap-3 md:hidden">
									<a
										href="/manga/{record.expand?.manga.slug}/{record.expand?.chapter
											.chapter_number}"
										class="rounded-full bg-orange-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-500"
									>
										إعادة القراءة
									</a>
									<form
										method="POST"
										action="?/deleteRecord"
										class="m-0"
										use:enhance={({ formElement }) => {
											deleting.add(record.id);
											deleting = deleting;

											return async ({ result }) => {
												handleFormResult({ result, formElement });
												setTimeout(() => {
													deleting.delete(record.id);
													deleting = deleting;
													if (result.type === 'success') {
														invalidateAll();
													}
												}, 300);
											};
										}}
									>
										<input type="hidden" name="id" value={record.id} />
										<button
											type="submit"
											class="flex items-center gap-1.5 rounded-full bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
											disabled={deleting.has(record.id)}
										>
											{deleting.has(record.id) ? '...' : 'حذف'}
										</button>
									</form>
								</div>
							</div>

							<div class="hidden flex-shrink-0 flex-row items-center justify-center gap-3 md:flex">
								<a
									href="/manga/{record.expand?.manga.slug}/{record.expand?.chapter.chapter_number}"
									class="rounded-full border border-orange-500 px-4 py-1.5 text-sm font-semibold text-orange-500 transition hover:bg-orange-500 hover:text-white"
								>
									إعادة القراءة
								</a>
								<form
									method="POST"
									action="?/deleteRecord"
									class="m-0"
									use:enhance={({ formElement }) => {
										deleting.add(record.id);
										deleting = deleting;

										return async ({ result }) => {
											handleFormResult({ result, formElement });
											setTimeout(() => {
												deleting.delete(record.id);
												deleting = deleting;
												if (result.type === 'success') {
													invalidateAll();
												}
											}, 300);
										};
									}}
								>
									<input type="hidden" name="id" value={record.id} />
									<button
										type="submit"
										class="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold text-gray-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
										disabled={deleting.has(record.id)}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
											stroke-linecap="round"
											stroke-linejoin="round"
											><path d="M3 6h18" /><path
												d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
											/><line x1="10" y1="11" x2="10" y2="17" /><line
												x1="14"
												y1="11"
												x2="14"
												y2="17"
											/></svg
										>
										{deleting.has(record.id) ? '...' : 'حذف'}
									</button>
								</form>
							</div>
						</div>
					</li>
				{:else}
					<div
						class="flex h-64 flex-col items-center justify-center rounded-lg bg-gray-800 text-center"
					>
						<svg
							class="mb-4 h-16 w-16 text-gray-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z"
							/>
						</svg>
						<h3 class="text-xl font-semibold">سجل القراءة فارغ</h3>
						<p class="mt-1 text-gray-400">ابدأ بتصفح المانجا وسيظهر سجل قراءتك هنا</p>
					</div>
				{/each}
			</ul>
		</div>

		{#if data.history.totalPages > 1}
			<div class="mt-8 flex items-center justify-center gap-4">
				{#if data.history.page > 1}
					<a
						href="?page={data.history.page - 1}{data.searchTerm ? `&q=${data.searchTerm}` : ''}"
						class="rounded-md bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-orange-500"
						>السابقة</a
					>
				{/if}

				<span class="text-gray-400">
					صفحة {data.history.page} من {data.history.totalPages}
				</span>

				{#if data.history.page < data.history.totalPages}
					<a
						href="?page={data.history.page + 1}{data.searchTerm ? `&q=${data.searchTerm}` : ''}"
						class="rounded-md bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-orange-500"
						>التالية</a
					>
				{/if}
			</div>
		{/if}
	</div>
</div>
