import { writable } from 'svelte/store';

// الوضع الافتراضي هو 'vertical' (عمودي)
export const readingMode = writable('vertical');
export const pageDisplayMode = writable('single'); // الخيارات: 'single' أو 'double'

// ✨ إضافات جديدة ✨
// الخيارات: 'black', 'white', 'sepia'
export const readerBackgroundColor = writable('black'); 
// الخيارات: 'fit-width', 'fit-height', 'original'
export const imageFitMode = writable('fit-width');