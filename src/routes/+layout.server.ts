import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    // نمرر بيانات المستخدم من الـ hooks إلى كل الصفحات
    return {
        user: locals.user || null
    };
};