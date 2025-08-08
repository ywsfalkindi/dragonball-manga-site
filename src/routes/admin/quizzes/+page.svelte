<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<svelte:head><title>إدارة الاختبارات</title></svelte:head>

<div class="p-8 font-[Tajawal] text-white">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-4xl font-bold">إدارة الاختبارات</h1>
		<a href="/admin/quizzes/create" class="bg-green-600 py-2 px-4 rounded hover:bg-green-700 transition-colors">
			+ إضافة اختبار جديد
		</a>
	</div>

	{#if form?.message}
		<p class="mb-4 text-center p-2 rounded {form.success ? 'bg-green-500' : 'bg-red-500'}">{form.message}</p>
	{/if}

	<div class="bg-gray-800 shadow-lg rounded-lg overflow-x-auto">
		<table class="w-full text-right">
			<thead>
				<tr class="bg-gray-700">
					<th class="p-4">العنوان</th>
					<th class="p-4">Slug</th>
					<th class="p-4">الحالة</th>
					<th class="p-4">تاريخ الإنشاء</th>
					<th class="p-4">إجراءات</th>
				</tr>
			</thead>
			<tbody>
    {#each data.quizzes as quiz (quiz.id)}
        <tr class="border-b border-gray-700 hover:bg-gray-700/50">
            <td class="p-4 font-semibold">{quiz.title}</td>
            <td class="p-4 font-mono text-gray-400">{quiz.slug}</td>
            <td class="p-4">
                <span class="px-2 py-1 text-xs rounded-full {quiz.published ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}">
                    {quiz.published ? 'منشور' : 'مسودة'}
                </span>
            </td>
            <td class="p-4 text-gray-400">{new Date(quiz.created).toLocaleDateString('ar-EG')}</td>
            <td class="p-4 flex gap-2">
                <a href="/admin/quizzes/{quiz.id}" class="text-blue-400 hover:underline">تعديل</a>
                
                <form method="POST" action="?/deleteQuiz" use:enhance 
                      on:submit={(event) => {
                          if (!confirm('هل أنت متأكد من حذف هذا الاختبار وكل أسئلته؟')) {
                              event.preventDefault(); // منع إرسال الفورم إذا ضغط المستخدم على "إلغاء"
                          }
                      }}>
                    <input type="hidden" name="id" value={quiz.id} />
                    <button type="submit" class="text-red-400 hover:underline">
                        حذف
                    </button>
                </form>
                </td>
        </tr>
    {:else}
        <tr>
            <td colspan="5" class="p-8 text-center text-gray-400">لا توجد اختبارات حتى الآن.</td>
        </tr>
    {/each}
</tbody>
		</table>
	</div>
</div>