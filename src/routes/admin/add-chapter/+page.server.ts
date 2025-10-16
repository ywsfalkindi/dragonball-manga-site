import { fail } from '@sveltejs/kit';
import { JSDOM } from 'jsdom';
import { mangasSchema } from '$lib/schemas'; // تم التأكد من وجود هذا التعريف
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad, Actions, RequestEvent } from './$types'; // تم استيراد الأنواع اللازمة
import DOMPurify from 'dompurify';

const ALLOWED_DOMAINS = [
	'https://onepiecechapters.com',
	'https://ww8.read-naruto.com'
];

export const load: PageServerLoad = async ({ locals }) => {
	const form = await superValidate(zod(mangasSchema));

	const getMangas = async () => {
		try {
			// الآن 'pb' معرف بشكل صحيح
			const mangas = structuredClone(
				await locals.pb.collection('mangas').getFullList(undefined, { sort: '-created' })
			);
			return mangas;
		} catch (err) {
			console.log('Error: ', err);
		}
	};

	return {
		form,
		mangas: await getMangas()
	};
};

// تم تحديد نوع 'event' بشكل صريح
export const actions: Actions = {
	add: async (event: RequestEvent) => {
		const form = await superValidate(event, zod(mangasSchema));
		const data = await event.request.formData();
		const mangaId = data.get('manga') as string;
		const url = data.get('url') as string;
		const title = data.get('title') as string;
		const chapter_number = data.get('chapter_number') as string;

		const isAllowed = ALLOWED_DOMAINS.some((domain) => url.startsWith(domain));

		if (!isAllowed) {
			return fail(400, {
				error: 'هذا النطاق غير مسموح به. يرجى استخدام رابط من النطاقات الموثوقة فقط.'
			});
		}

		try {
			const res = await fetch(url);
			const html = await res.text();
			const window = new JSDOM(html).window;
			const purify = DOMPurify(window);
			const sanitizedHtml = purify.sanitize(html);
			const dom = new JSDOM(sanitizedHtml).window.document;
			const images = Array.from(dom.querySelectorAll('img')).map((img) => img.src);

			// الآن 'pb' معرف بشكل صحيح
			const record = await event.locals.pb.collection('chapters').create({
				manga: mangaId,
				title: title,
				chapter_number: chapter_number,
				pages: images
			});
		} catch (err) {
			console.log('Error: ', err);
			return message(form, 'Something went wrong');
		}

		return message(form, 'Chapter added successfully');
	}
};