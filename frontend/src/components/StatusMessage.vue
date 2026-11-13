<script setup>
/** Inline status block for loading, error, and empty states. */
defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'error', 'loading', 'empty'].includes(value),
  },
  message: { type: String, required: true },
});

defineEmits(['retry']);
</script>

<template>
  <div v-if="type === 'error'" class="alert alert-error status" role="alert">
    <span>{{ message }}</span>
    <button type="button" class="btn btn-secondary btn-sm" @click="$emit('retry')">Try again</button>
  </div>
  <div v-else-if="type === 'loading'" class="status status--loading" role="status">
    <span class="spinner" aria-hidden="true"></span>
    <span>{{ message }}</span>
  </div>
  <div v-else-if="type === 'empty'" class="empty-state">
    <slot name="icon" />
    <p>{{ message }}</p>
    <slot />
  </div>
  <div v-else class="alert alert-info" role="status">{{ message }}</div>
</template>

<style scoped>
.status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.status--loading {
  justify-content: flex-start;
  padding: 1rem 0;
  color: var(--color-text-muted);
}

.spinner {
  width: 1.1rem;
  height: 1.1rem;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
