<script lang="ts">
	import type { PageData, ActionData } from './$types';
	export let data: PageData;
	export let form: ActionData;
	let { userDetails } = data;
	let activeTab = 'stats'; // 'stats', 'comments', 'history'
</script>

<svelte:head>
	<title>تفاصيل المستخدم: {data.userDetails.username}</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 p-8 font-[Tajawal] text-white">
	<a href="/admin/users" class="mb-8 block text-blue-400 hover:underline">
		&larr; العودة إلى قائمة المستخدمين
	</a>
	<h1 class="mb-2 text-4xl font-bold">ملف {data.userDetails.username}</h1>
	<p class="mb-8 text-gray-400">
		تاريخ الانضمام: {new Date(data.userDetails.created).toLocaleDateString('ar')}
	</p>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<div class="space-y-8 lg:col-span-2">
			<div class="border-b border-gray-700">
				<nav class="-mb-px flex gap-6" aria-label="Tabs">
					<button
						on:click={() => (activeTab = 'stats')}
						class="{activeTab === 'stats'
							? 'border-orange-500 text-orange-400'
							: 'border-transparent text-gray-400 hover:border-gray-500 hover:text-white'} border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap"
					>
						الإحصائيات والنشاط
					</button>
					<button
						on:click={() => (activeTab = 'comments')}
						class="{activeTab === 'comments'
							? 'border-orange-500 text-orange-400'
							: 'border-transparent text-gray-400 hover:border-gray-500 hover:text-white'} border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap"
					>
						آخر التعليقات
					</button>
				</nav>
			</div>

			{#if activeTab === 'stats'}
				<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
					<h2 class="mb-4 text-2xl font-bold">إحصائيات</h2>
					<div class="grid grid-cols-3 gap-4 text-center">
						<div>
							<p class="text-4xl font-bold text-orange-500">{data.stats.totalFavorites}</p>
							<p class="text-gray-400">مانجا مفضلة</p>
						</div>
						<div>
							<p class="text-4xl font-bold text-blue-500">{data.stats.totalChaptersRead}</p>
							<p class="text-gray-400">فصل مقروء</p>
						</div>
						<div>
							<p class="text-4xl font-bold text-green-500">{data.stats.totalComments}</p>
							<p class="text-gray-400">تعليق</p>
						</div>
					</div>
				</div>

				<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
					<h2 class="mb-4 text-2xl font-bold">كرات التنين</h2>
					<div class="flex items-center justify-center gap-4">
						{#each { length: 7 } as _, i}
							{@const ballNum = i + 1}
							{@const hasBall = data.collectedBalls.includes(ballNum)}
							<img
								src={`/dragonballs/db_${ballNum}.png`}
								alt="كرة رقم {ballNum}"
								class="h-12 w-12 transition-opacity {hasBall
									? 'opacity-100'
									: 'opacity-20 grayscale'}"
								title={hasBall ? 'تم جمعها' : 'مفقودة'}
							/>
						{/each}
					</div>
				</div>

				<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
					<h2 class="mb-4 text-2xl font-bold">آخر الفصول المقروءة</h2>
					<div class="space-y-2">
						{#each data.latestReadHistory as record}
							<div class="text-gray-300">
								- قراءة الفصل #{record.expand?.chapter.chapter_number} من مانجا
								<a
									href="/manga/{record.expand?.manga.slug}"
									class="text-orange-400 hover:underline"
								>
									{record.expand?.manga.title}
								</a>
							</div>
						{:else}
							<p class="text-gray-400">لا يوجد سجل قراءة حديث.</p>
						{/each}
					</div>
				</div>
			{:else if activeTab === 'comments'}
				<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
					<h2 class="mb-4 text-2xl font-bold">آخر 10 تعليقات</h2>
					<div class="space-y-4">
						{#each data.latestComments as comment}
							<div class="rounded bg-gray-700/50 p-3">
								<p class="text-sm text-gray-300">{@html comment.content}</p>
								<p class="mt-2 text-xs text-blue-400">
									في الفصل #{comment.expand?.chapter.chapter_number}
								</p>
							</div>
						{:else}
							<p class="text-gray-400">لم يقم المستخدم بكتابة أي تعليقات.</p>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div class="space-y-8">
			<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
				<h2 class="mb-4 text-2xl font-bold">تعديل البيانات</h2>
				<form method="POST" action="?/updateUser" class="space-y-4">
					<div>
						<label for="username" class="mb-1 block text-gray-300">اسم المستخدم</label>
						<input
							type="text"
							name="username"
							id="username"
							bind:value={userDetails.username}
							class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
						/>
					</div>
					<div>
						<label for="title" class="mb-1 block text-gray-300">اللقب (اختياري)</label>
						<input
							type="text"
							name="title"
							id="title"
							bind:value={userDetails.title}
							class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
						/>
					</div>
					{#if form?.updateError}
						<p class="text-sm text-red-500">{form.updateError}</p>
					{/if}
					{#if form?.updateSuccess}
						<p class="text-sm text-green-500">{form.updateSuccess}</p>
					{/if}
					<button type="submit" class="w-full rounded bg-blue-600 py-2 font-bold hover:bg-blue-700">
						حفظ التغييرات
					</button>
				</form>
			</div>

			<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
				<h2 class="mb-4 text-2xl font-bold">إجراءات</h2>
				<form method="POST" action="?/requestPasswordReset" class="space-y-4">
					{#if form?.resetError}
						<p class="text-sm text-red-500">{form.resetError}</p>
					{/if}
					{#if form?.resetSuccess}
						<p class="text-sm text-green-500">{form.resetSuccess}</p>
					{/if}
					<button
						type="submit"
						class="w-full rounded bg-yellow-600 py-2 font-bold hover:bg-yellow-700"
					>
						إرسال رابط إعادة تعيين كلمة المرور
					</button>
				</form>
			</div>
		</div>
	</div>
</div>
