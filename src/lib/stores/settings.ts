import { writable } from 'svelte/store';

// 'vertical' هو الوضع الافتراضي (التمرير العمودي)
// 'horizontal' هو الوضع الجديد (صفحة بصفحة)
export const readingMode = writable('vertical');