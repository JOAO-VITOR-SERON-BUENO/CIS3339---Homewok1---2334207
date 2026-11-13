<script setup>
import { storeToRefs } from 'pinia';
import { useNotificationsStore } from '@/stores/notifications';

const notifications = useNotificationsStore();
const { items } = storeToRefs(notifications);
</script>

<template>
  <div class="toast-region" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div
        v-for="item in items"
        :key="item.id"
        class="toast alert"
        :class="item.type === 'error' ? 'alert-error' : 'alert-success'"
        :role="item.type === 'error' ? 'alert' : 'status'"
      >
        <span>{{ item.message }}</span>
        <button type="button" class="toast__close" aria-label="Dismiss notification" @click="notifications.dismiss(item.id)">
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-region {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  left: 1rem;
  z-index: 50;
  display: grid;
  gap: 0.5rem;
  justify-items: end;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 420px;
  width: 100%;
  box-shadow: var(--shadow);
  pointer-events: auto;
  background-clip: padding-box;
}

.toast span {
  flex: 1;
}

.toast__close {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.25rem;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
