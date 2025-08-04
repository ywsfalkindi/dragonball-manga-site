<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<svelte:head><title>لوحة التحكم</title></svelte:head>

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white">
	<h1 class="text-4xl font-bold mb-8 text-right">لوحة التحكم</h1>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<div class="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
			<h2 class="text-xl text-gray-400">عدد المانجا</h2>
			<p class="text-5xl font-bold mt-2 text-orange-500">{data.stats.mangas}</p>
		</div>
		<div class="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
			<h2 class="text-xl text-gray-400">عدد الفصول</h2>
			<p class="text-5xl font-bold mt-2 text-orange-500">{data.stats.chapters}</p>
		</div>
		<div class="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
			<h2 class="text-xl text-gray-400">عدد المستخدمين</h2>
			<p class="text-5xl font-bold mt-2 text-orange-500">{data.stats.users}</p>
		</div>
		<div class="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
			<h2 class="text-xl text-gray-400">عدد التعليقات</h2>
			<p class="text-5xl font-bold mt-2 text-orange-500">{data.stats.comments}</p>
		</div>
	</div>

	<div class="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
		<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
			<h2 class="text-2xl font-bold mb-4 text-right">أحدث المستخدمين المسجلين</h2>
			<div class="space-y-4">
				{#each data.latestUsers as user}
                    <div class="flex flex-row-reverse justify-between items-center bg-gray-700/50 p-3 rounded-lg text-right">
						<div>
							<p class="font-semibold">{user.username}</p>
							<p class="text-sm text-gray-400">{user.email}</p>
						</div>
						<a href="/admin/users/{user.id}" class="text-blue-400 hover:underline text-sm ml-4">
							عرض التفاصيل
						</a>
					</div>
				{:else}
					<p class="text-gray-400 text-right">لا يوجد مستخدمون جدد.</p>
				{/each}
			</div>
		</div>

		<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
			<h2 class="text-2xl font-bold mb-4 text-right">تعليقات بانتظار الموافقة</h2>
			<div class="space-y-4">
				{#each data.latestComments as comment}
					<div class="bg-gray-700/50 p-3 rounded-lg">
                        <div class="flex flex-row-reverse justify-between items-start text-right">
							<div>
								<p class="font-semibold text-orange-400">
									{comment.expand?.user?.username || 'مستخدم محذوف'}
								</p>
								<p class="text-sm text-gray-400 mt-1 line-clamp-2">{@html comment.content}</p>
							</div>
							<a href="/admin/comments" class="text-blue-400 hover:underline text-sm whitespace-nowrap ml-4">
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
		<h2 class="text-2xl font-bold mb-4 text-right">أدوات المحتوى</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-800 p-4 rounded-lg text-right">
			<a href="/admin/mangas" class="block p-4 hover:bg-gray-700 rounded-lg">
				<h3 class="text-xl font-bold text-blue-400">إدارة المانجا</h3>
				<p class="text-gray-400 mt-1">إضافة، تعديل، وحذف المانجا الموجودة.</p>
			</a>
			<a href="/admin/add-chapter" class="block p-4 hover:bg-gray-700 rounded-lg">
				<h3 class="text-xl font-bold text-green-400">إضافة فصل جديد</h3>
				<p class="text-gray-400">أداة لإضافة فصل كامل بصفحاته تلقائيًا.</p>
			</a>
		</div>
	</div>

	<div class="mt-12">
		<h2 class="text-2xl font-bold mb-4 text-right">إدارة الموقع</h2>
		<div class="bg-gray-800 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
			<a href="/admin/users" class="block p-4 hover:bg-gray-700 rounded-lg">
				<h3 class="text-xl font-bold text-purple-400">إدارة المستخدمين</h3>
				<p class="text-gray-400 mt-1">عرض المستخدمين، تغيير أدوارهم، وحظرهم.</p>
			</a>
			<a href="/admin/comments" class="block p-4 hover:bg-gray-700 rounded-lg">
				<h3 class="text-xl font-bold text-red-400">إدارة التعليقات</h3>
				<p class="text-gray-400 mt-1">عرض، تعديل، وحذف التعليقات من الموقع.</p>
			</a>
		</div>
	</div>
</div>