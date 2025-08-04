<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<svelte:head>
	<title>إدارة المستخدمين</title>
</svelte:head>

<div class="p-8 font-[Tajawal] bg-gray-900 min-h-screen text-white">
	<a href="/admin" class="text-blue-400 hover:underline mb-8 block">&larr; العودة إلى لوحة التحكم</a>
	<h1 class="text-4xl font-bold mb-8">إدارة المستخدمين</h1>

	<div class="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
		<table class="w-full text-right">
			<thead class="bg-gray-700">
				<tr>
					<th class="p-4">اسم المستخدم</th>
					<th class="p-4">البريد الإلكتروني</th>
					<th class="p-4">مسؤول</th>
					<th class="p-4">محظور</th>
					<th class="p-4">تاريخ الإنشاء</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-700">
				{#each data.users as user (user.id)}
					<tr class="hover:bg-gray-700/50">
						<td class="p-4 font-semibold">{user.username}</td>
						<td class="p-4 text-gray-400">{user.email}</td>
						<td class="p-4">
							<form method="POST" action="?/toggleAdmin" class="inline-block">
								<input type="hidden" name="userId" value={user.id} />
								<input type="hidden" name="isAdmin" value={user.isAdmin} />
								<button
									type="submit"
									class="px-3 py-1 text-sm rounded-full transition-colors
                                    {user.isAdmin
										? 'bg-green-500 text-white hover:bg-green-600'
										: 'bg-gray-600 text-gray-300 hover:bg-gray-500'}"
								>
									{user.isAdmin ? 'نعم' : 'لا'}
								</button>
							</form>
						</td>
						<td class="p-4">
							<form method="POST" action="?/toggleBan" class="inline-block">
								<input type="hidden" name="userId" value={user.id} />
								<input type="hidden" name="isBanned" value={user.banned} />
								<button
									type="submit"
									class="px-3 py-1 text-sm rounded-full transition-colors
                                    {user.banned
										? 'bg-red-500 text-white hover:bg-red-600'
										: 'bg-gray-600 text-gray-300 hover:bg-gray-500'}"
								>
									{user.banned ? 'نعم' : 'لا'}
								</button>
							</form>
						</td>
						<td class="p-4 text-gray-400">
							{new Date(user.created).toLocaleDateString('ar')}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>