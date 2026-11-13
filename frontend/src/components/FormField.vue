<script setup>
import { computed, useId } from 'vue';

/** Labeled, accessible text input with hint and validation message support. */
const props = defineProps({
  label: { type: String, required: true },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: false },
});

defineOptions({ inheritAttrs: false });

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
    <input
      :id="id"
      v-model="model"
      v-bind="$attrs"
      :required="required"
      :aria-invalid="error ? 'true' : 'false'"
      :aria-describedby="describedBy"
    />
    <span v-if="hint" :id="hintId" class="hint">{{ hint }}</span>
    <span v-if="error" :id="errorId" class="error-text">{{ error }}</span>
  </div>
</template>
