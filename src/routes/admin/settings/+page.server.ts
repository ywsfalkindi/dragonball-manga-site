// src/routes/admin/settings/+page.server.ts
import { pb } from '$lib/pocketbase';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

async function getSettings() {
	try {
		return await pb.collection('settings').getFirstListItem('');
	} catch (err) {
		// If settings don't exist, create them
		return await pb.collection('settings').create({ maintenanceMode: false });
	}
}

async function getAnnouncement() {
	try {
		return await pb.collection('announcements').getFirstListItem('');
	} catch (err) {
		return await pb.collection('announcements').create({ text: '', isActive: false });
	}
}

export const load: PageServerLoad = async () => {
	const [settings, announcement] = await Promise.all([getSettings(), getAnnouncement()]);
	return { settings, announcement };
};

export const actions: Actions = {
	toggleMaintenance: async () => {
		const currentSettings = await getSettings();
		await pb
			.collection('settings')
			.update(currentSettings.id, { maintenanceMode: !currentSettings.maintenanceMode });
		return { success: true };
	},

	updateAnnouncement: async ({ request }) => {
		const formData = await request.formData();
		const text = formData.get('text') as string;
		const isActive = formData.get('isActive') === 'on';

		const currentAnnouncement = await getAnnouncement();

		await pb.collection('announcements').update(currentAnnouncement.id, { text, isActive });
		return { success: 'تم تحديث الإعلان بنجاح!' };
	}
};
