import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration: number;
}

function createToastStore() {
    const { subscribe, update } = writable<Toast[]>([]);

    return {
        subscribe,
        add: (type: ToastType, message: string, duration = 4000) => {
            const id = Math.random().toString(36).substr(2, 9);
            update((toasts) => [...toasts, { id, type, message, duration }]);
        },
        remove: (id: string) => {
            update((toasts) => toasts.filter((t) => t.id !== id));
        },
        success: (message: string, duration = 4000) => {
            toastStore.add('success', message, duration);
        },
        error: (message: string, duration = 5000) => {
            toastStore.add('error', message, duration);
        },
        info: (message: string, duration = 4000) => {
            toastStore.add('info', message, duration);
        },
        warning: (message: string, duration = 4000) => {
            toastStore.add('warning', message, duration);
        }
    };
}

export const toasts = createToastStore();
export const toastStore = toasts;
