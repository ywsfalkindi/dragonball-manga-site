<script lang="ts">
	import type { PageData, ActionData } from './$types';
	export let data: PageData;
	export let form: ActionData;

	let { userDetails } = data;
</script>

<svelte:head>
	<title>تفاصيل المستخدم: {data.userDetails.username}</title>
</svelte:head>

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white">
	<a href="/admin/users" class="text-blue-400 hover:underline mb-8 block">
		&larr; العودة إلى قائمة المستخدمين
	</a>
	<h1 class="text-4xl font-bold mb-2">ملف {data.userDetails.username}</h1>
	<p class="text-gray-400 mb-8">تاريخ الانضمام: {new Date(data.userDetails.created).toLocaleDateString('ar')}</p>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<div class="lg:col-span-2 space-y-8">
			<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
				<h2 class="text-2xl font-bold mb-4">إحصائيات</h2>
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

			<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
				<h2 class="text-2xl font-bold mb-4">كرات التنين</h2>
				<div class="flex justify-center items-center gap-4">
					{#each { length: 7 } as _, i}
						{@const ballNum = i + 1}
						{@const hasBall = data.collectedBalls.includes(ballNum)}
						<img
							src={`/dragonballs/db_${ballNum}.png`}
							alt="كرة رقم {ballNum}"
							class="w-12 h-12 transition-opacity {hasBall ? 'opacity-100' : 'opacity-20 grayscale'}"
							title={hasBall ? 'تم جمعها' : 'مفقودة'}
						/>
					{/each}
				</div>
			</div>

			<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
				<h2 class="text-2xl font-bold mb-4">آخر الفصول المقروءة</h2>
				<div class="space-y-2">
					{#each data.latestReadHistory as record}
						<div class="text-gray-300">
							- قراءة الفصل #{record.expand?.chapter.chapter_number} من مانجا
							<a href="/manga/{record.expand?.manga.slug}" class="text-orange-400 hover:underline">
								{record.expand?.manga.title}
							</a>
						</div>
					{:else}
						<p class="text-gray-400">لا يوجد سجل قراءة حديث.</p>
					{/each}
				</div>
			</div>
		</div>

		<div class="space-y-8">
			<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
				<h2 class="text-2xl font-bold mb-4">تعديل البيانات</h2>
				<form method="POST" action="?/updateUser" class="space-y-4">
					<div>
						<label for="username" class="block text-gray-300 mb-1">اسم المستخدم</label>
						<input
							type="text"
							name="username"
							id="username"
							bind:value={userDetails.username}
							class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
						/>
					</div>
					<div>
						<label for="title" class="block text-gray-300 mb-1">اللقب (اختياري)</label>
						<input
							type="text"
							name="title"
							id="title"
							bind:value={userDetails.title}
							class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
						/>
					</div>
					{#if form?.updateError}
						<p class="text-red-500 text-sm">{form.updateError}</p>
					{/if}
					{#if form?.updateSuccess}
						<p class="text-green-500 text-sm">{form.updateSuccess}</p>
					{/if}
					<button type="submit" class="w-full bg-blue-600 font-bold py-2 rounded hover:bg-blue-700">
						حفظ التغييرات
					</button>
				</form>
			</div>

			<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
				<h2 class="text-2xl font-bold mb-4">إجراءات</h2>
				<form method="POST" action="?/requestPasswordReset" class="space-y-4">
					{#if form?.resetError}
						<p class="text-red-500 text-sm">{form.resetError}</p>
					{/if}
					{#if form?.resetSuccess}
						<p class="text-green-500 text-sm">{form.resetSuccess}</p>
					{/if}
					<button type="submit" class="w-full bg-yellow-600 font-bold py-2 rounded hover:bg-yellow-700">
						إرسال رابط إعادة تعيين كلمة المرور
					</button>
				</form>
			</div>
		</div>
	</div>
</div>