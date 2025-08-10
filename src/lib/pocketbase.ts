// src/lib/pocketbase.ts
import PocketBase from 'pocketbase';
// --- التعديل: استيراد المتغير من بيئة العمل ---
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

// --- التعديل: استخدام المتغير هنا ---
export const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
