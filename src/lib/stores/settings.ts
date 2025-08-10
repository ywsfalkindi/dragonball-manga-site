// src/lib/stores/settings.ts

import { persisted } from 'svelte-persisted-store';

// الوضع الافتراضي هو 'vertical' (عمودي)
export const readingMode = persisted('readingMode', 'vertical');

// الخيارات: 'single' أو 'double'
export const pageDisplayMode = persisted('pageDisplayMode', 'single');

// ✨ إضافات جديدة ✨
// الخيارات: 'black', 'white', '#f4e8d8'
export const readerBackgroundColor = persisted('readerBackgroundColor', 'black');

// الخيارات: 'fit-width', 'fit-height', 'original'
export const imageFitMode = persisted('imageFitMode', 'fit-width');
