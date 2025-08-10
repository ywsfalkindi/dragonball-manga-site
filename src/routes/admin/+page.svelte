<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<svelte:head>
	<title>لوحة التحكم</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 p-8 font-[Tajawal] text-white">
	<div class="mb-8 flex flex-row-reverse items-center justify-between">
		<h1 class="text-4xl font-bold">لوحة التحكم</h1>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-lg bg-gray-800 p-6 text-center shadow-lg">
			<h2 class="text-xl text-gray-400">عدد المانجا</h2>
			<p class="mt-2 text-5xl font-bold text-orange-500">{data.stats.mangas}</p>
		</div>
		<div class="rounded-lg bg-gray-800 p-6 text-center shadow-lg">
			<h2 class="text-xl text-gray-400">عدد الفصول</h2>
			<p class="mt-2 text-5xl font-bold text-orange-500">{data.stats.chapters}</p>
		</div>
		<div class="rounded-lg bg-gray-800 p-6 text-center shadow-lg">
			<h2 class="text-xl text-gray-400">عدد المستخدمين</h2>
			<p class="mt-2 text-5xl font-bold text-orange-500">{data.stats.users}</p>
		</div>
		<div class="rounded-lg bg-gray-800 p-6 text-center shadow-lg">
			<h2 class="text-xl text-gray-400">عدد التعليقات</h2>
			<p class="mt-2 text-5xl font-bold text-orange-500">{data.stats.comments}</p>
		</div>
	</div>

	<div class="mt-12">
		<h2 class="mb-4 text-right text-2xl font-bold">تحليلات الموقع</h2>
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
				<h3 class="mb-4 text-right text-xl font-bold">المستخدمون الجدد (آخر 7 أيام)</h3>
				<div class="py-8 text-center text-gray-400">[رسم بياني لتوضيح نمو المستخدمين]</div>
			</div>
			<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
				<h3 class="mb-4 text-right text-xl font-bold">المانجا الأكثر قراءة (هذا الشهر)</h3>
				<ul class="space-y-2 text-right">
					{#each data.mostReadMangas as manga}
						<li class="text-gray-300">{manga.title} - {manga.reads} قراءة</li>
					{:else}
						<li class="text-gray-400">لا توجد بيانات كافية بعد.</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>

	<div class="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
		<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
			<h2 class="mb-4 text-right text-2xl font-bold">أحدث المستخدمين المسجلين</h2>
			<div class="space-y-4">
				{#each data.latestUsers as user}
					<div
						class="flex flex-row-reverse items-center justify-between rounded-lg bg-gray-700/50 p-3 text-right"
					>
						<div>
							<p class="font-semibold">{user.username}</p>
							<p class="text-sm text-gray-400">{user.email}</p>
						</div>
						<a href="/admin/users/{user.id}" class="ml-4 text-sm text-blue-400 hover:underline">
							عرض التفاصيل
						</a>
					</div>
				{:else}
					<p class="text-gray-400 text-right">لا يوجد مستخدمون جدد.</p>
				{/each}
			</div>
		</div>

		<div class="rounded-lg bg-gray-800 p-6 shadow-lg">
			<h2 class="mb-4 text-right text-2xl font-bold">تعليقات بانتظار الموافقة</h2>
			<div class="space-y-4">
				{#each data.latestComments as comment}
					<div class="rounded-lg bg-gray-700/50 p-3">
						<div class="flex flex-row-reverse items-start justify-between text-right">
							<div>
								<p class="font-semibold text-orange-400">
									{comment.expand?.user?.username || 'مستخدم محذوف'}
								</p>
								<p class="mt-1 line-clamp-2 text-sm text-gray-400">{@html comment.content}</p>
							</div>
							<a
								href="/admin/comments"
								class="ml-4 text-sm whitespace-nowrap text-blue-400 hover:underline"
							>
								إلى التعليقات
							</a>
						</div>
					</div>
				{:else}
					<p class="text-gray-400 text-right">لا توجد تعليقات تنتظر المراجعة حاليًا.</p>
				{/each}
			</div>
		</div>
	</div>

	<div class="mt-12">
		<h2 class="mb-4 text-right text-2xl font-bold">أدوات المحتوى</h2>
		<div class="grid grid-cols-1 gap-4 rounded-lg bg-gray-800 p-4 text-right md:grid-cols-3">
			<a href="/admin/quizzes" class="block rounded-lg p-4 hover:bg-gray-700">
				<h3 class="text-xl font-bold text-cyan-400">إدارة الاختبارات</h3>
				<p class="mt-1 text-gray-400">إضافة وتعديل وحذف الاختبارات وأسئلتها.</p>
			</a>

			<a href="/admin/mangas" class="block rounded-lg p-4 hover:bg-gray-700">
				<h3 class="text-xl font-bold text-blue-400">إدارة المانجا</h3>
				<p class="mt-1 text-gray-400">إضافة، تعديل، وحذف المانجا والفصول.</p>
			</a>
			<a href="/admin/add-chapter" class="block rounded-lg p-4 hover:bg-gray-700">
				<h3 class="text-xl font-bold text-green-400">إضافة فصل جديد</h3>
				<p class="text-gray-400">أداة لإضافة فصل كامل بصفحاته تلقائيًا.</p>
			</a>
			<a href="/admin/media" class="block rounded-lg p-4 hover:bg-gray-700">
				<h3 class="text-xl font-bold text-yellow-400">إدارة الوسائط</h3>
				<p class="mt-1 text-gray-400">عرض الصور المرفوعة وحذف غير المستخدم منها.</p>
			</a>
		</div>
	</div>

	<div class="mt-12">
		<h2 class="mb-4 text-right text-2xl font-bold">إدارة الموقع</h2>
		<div class="grid grid-cols-1 gap-4 rounded-lg bg-gray-800 p-4 text-right md:grid-cols-3">
			<a href="/admin/users" class="block rounded-lg p-4 hover:bg-gray-700">
				<h3 class="text-xl font-bold text-purple-400">إدارة المستخدمين</h3>
				<p class="mt-1 text-gray-400">عرض المستخدمين، تغيير أدوارهم، وحظرهم.</p>
			</a>
			<a href="/admin/comments" class="block rounded-lg p-4 hover:bg-gray-700">
				<h3 class="text-xl font-bold text-red-400">إدارة التعليقات</h3>
				<p class="mt-1 text-gray-400">عرض، تعديل، وحذف التعليقات من الموقع.</p>
			</a>
			<a href="/admin/settings" class="block rounded-lg p-4 hover:bg-gray-700">
				<h3 class="text-xl font-bold text-teal-400">إعدادات الموقع</h3>
				<p class="mt-1 text-gray-400">التحكم في وضع الصيانة والإعلانات.</p>
			</a>
		</div>
	</div>
</div>
