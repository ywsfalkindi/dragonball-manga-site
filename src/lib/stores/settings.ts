import { writable } from 'svelte/store';

// الوضع الافتراضي هو 'vertical' (عمودي)
export const readingMode = writable('vertical');