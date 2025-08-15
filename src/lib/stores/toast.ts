// src/lib/stores/toast.ts
import { writable } from 'svelte/store';

interface ToastMessage {
    type: 'success' | 'error';
    message: string;
    id: number;
}

// هذا المتجر سيحتوي على قائمة الإشعارات التي ستظهر
export const toasts = writable<ToastMessage[]>([]);

/**
 * دالة لإضافة إشعار جديد إلى القائمة.
 * @param message - الرسالة التي ستظهر في الإشعار.
 * @param type - نوع الإشعار ('success' أو 'error').
 * @param duration - مدة بقاء الإشعار على الشاشة بالمللي ثانية.
 */
export function addToast(
    message: string,
    type: 'success' | 'error' = 'success',
    duration: number = 4000
) {
    const id = Date.now();

    // أضف الإشعار الجديد إلى بداية القائمة
    toasts.update((all) => [{ id, type, message }, ...all]);

    // قم بإزالة الإشعار بعد انتهاء المدة المحددة
    setTimeout(() => {
        toasts.update((all) => all.filter((t) => t.id !== id));
    }, duration);
}