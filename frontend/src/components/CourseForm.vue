<script setup>
import { reactive, ref, useTemplateRef } from 'vue';
import FormField from './FormField.vue';
import { useCoursesStore } from '@/stores/courses';
import { useNotificationsStore } from '@/stores/notifications';

const coursesStore = useCoursesStore();
const notifications = useNotificationsStore();

const form = reactive({ courseId: '', name: '' });
const errors = reactive({ courseId: '', name: '' });
const submitting = ref(false);
const formError = ref('');
const formRef = useTemplateRef('formEl');

// Client-side rules mirror the server's Mongoose schema.
function validate() {
  const courseId = form.courseId.trim();
  const name = form.name.trim();
  errors.courseId = !courseId
    ? 'Course ID is required'
    : courseId.length > 20
      ? 'Course ID must be at most 20 characters'
      : !/^[A-Za-z0-9 -]+$/.test(courseId)
        ? 'Use only letters, digits, spaces, and hyphens'
        : '';
  errors.name = !name ? 'Course name is required' : name.length > 150 ? 'Course name must be at most 150 characters' : '';
  return !errors.courseId && !errors.name;
}

function focusFirstInvalid() {
  formRef.value?.querySelector('[aria-invalid="true"]')?.focus();
}

async function submit() {
  formError.value = '';
  if (!validate()) {
    focusFirstInvalid();
    return;
  }

  submitting.value = true;
  try {
    const course = await coursesStore.addCourse({ courseId: form.courseId.trim(), name: form.name.trim() });
    notifications.success(`Course ${course.courseId} added.`);
    form.courseId = '';
    form.name = '';
    formRef.value?.querySelector('input')?.focus();
  } catch (err) {
    if (err.status === 409) {
      errors.courseId = err.message;
    } else if (err.details) {
      Object.assign(errors, err.details);
    }
    formError.value = err.message;
    focusFirstInvalid();
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section class="card" aria-labelledby="add-course-heading">
    <h2 id="add-course-heading">Add a course</h2>
    <p class="muted">Fields marked <span class="required">*</span> are required.</p>
    <form ref="formEl" class="form" novalidate @submit.prevent="submit">
      <FormField v-model="form.courseId" label="Course ID" required hint="e.g. CIS 3339" :error="errors.courseId" />
      <FormField
        v-model="form.name"
        label="Course name"
        required
        hint="e.g. Enterprise Applications Development"
        :error="errors.name"
      />
      <div v-if="formError" class="alert alert-error" role="alert">{{ formError }}</div>
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Adding…' : 'Add course' }}
      </button>
    </form>
  </section>
</template>
