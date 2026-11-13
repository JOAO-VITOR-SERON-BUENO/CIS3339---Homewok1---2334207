import { ref } from 'vue';
import { defineStore } from 'pinia';

/** App-wide toast notifications shown by <ToastRegion>. */
export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref([]);
  let nextId = 1;

  function dismiss(id) {
    items.value = items.value.filter((item) => item.id !== id);
  }

  function notify(type, message, timeout = type === 'error' ? 8000 : 4000) {
    const id = nextId++;
    items.value.push({ id, type, message });
    if (timeout) setTimeout(() => dismiss(id), timeout);
    return id;
  }

  return {
    items,
    dismiss,
    success: (message) => notify('success', message),
    error: (message) => notify('error', message),
  };
});
