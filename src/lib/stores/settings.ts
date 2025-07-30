import { writable } from 'svelte/store';

// الوضع الافتراضي هو 'vertical' (عمودي)
export const readingMode = writable('vertical');
export const pageDisplayMode = writable('single'); // الخيارات: 'single' أو 'double'
