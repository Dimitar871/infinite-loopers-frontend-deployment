import { writable } from 'svelte/store';

export const isOpen = writable(false);
export const modalMessage = writable('');
export const modalType = writable('success');
export const selectedTask = writable(null);

export function openModal(message, type) {
    modalMessage.set(message);
    modalType.set(type);
    isOpen.set(true);
}

export function closeModal() {
    isOpen.set(false);
}
