<script setup>
import { computed, useId } from 'vue';

/** Labeled, accessible <select> with placeholder, hint, and validation message. */
defineOptions({ inheritAttrs: false });

const props = defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true }, // [{ value, label }]
  placeholder: { type: String, default: 'Select…' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: false },
});

const model = defineModel({ type: String, default: '' });

const id = useId();
const hintId = computed(() => (props.hint ? `${id}-hint` : undefined));
const errorId = computed(() => (props.error ? `${id}-error` : undefined));
const describedBy = computed(() => [hintId.value, errorId.value].filter(Boolean).join(' ') || undefined);
</script>

<template>
  <div class="field">
    <label :for="id">
      {{ label }}
      <span v-if="required" class="required" aria-hidden="true">*</span>
    </label>
    <select
      :id="id"
      v-model="model"
      v-bind="$attrs"
      :required="required"
      :aria-invalid="error ? 'true' : 'false'"
      :aria-describedby="describedBy"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <span v-if="hint" :id="hintId" class="hint">{{ hint }}</span>
    <span v-if="error" :id="errorId" class="error-text">{{ error }}</span>
  </div>
</template>
