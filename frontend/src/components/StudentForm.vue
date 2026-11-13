<script setup>
import { computed, reactive, ref, useTemplateRef } from 'vue';
import FormField from './FormField.vue';
import { useStudentsStore } from '@/stores/students';
import { useNotificationsStore } from '@/stores/notifications';

const studentsStore = useStudentsStore();
const notifications = useNotificationsStore();

const emptyForm = () => ({ name: '', studentId: '', phone: '', zip: '' });
const form = reactive(emptyForm());
const errors = reactive({});
const submitting = ref(false);
const formError = ref('');
const formRef = useTemplateRef('formEl');

// Client-side rules mirror the server's Mongoose schema.
const rules = {
  name: (v) => (!v ? 'Name is required' : v.length > 100 ? 'Name must be at most 100 characters' : ''),
  studentId: (v) => (!v ? 'Student ID is required' : !/^\d{1,10}$/.test(v) ? 'Student ID must be 1 to 10 digits' : ''),
  phone: (v) =>
    !v ? 'Phone number is required' : !/^[0-9()+\-.\s]{7,20}$/.test(v) ? 'Enter a valid phone number, e.g. 555-1234' : '',
  zip: (v) => (!v ? 'ZIP code is required' : !/^\d{5}(-\d{4})?$/.test(v) ? 'ZIP code must be 5 digits, e.g. 77001' : ''),
};

const hasErrors = computed(() => Object.values(errors).some(Boolean));

function validate() {
  for (const [field, rule] of Object.entries(rules)) {
    errors[field] = rule(form[field].trim());
  }
  return !hasErrors.value;
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
    const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
    const student = await studentsStore.addStudent(payload);
    notifications.success(`Student ${student.name} (${student.studentId}) added.`);
    Object.assign(form, emptyForm());
    Object.keys(errors).forEach((key) => (errors[key] = ''));
    formRef.value?.querySelector('input')?.focus();
  } catch (err) {
    if (err.status === 409) {
      errors.studentId = err.message;
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
  <section class="card" aria-labelledby="add-student-heading">
    <h2 id="add-student-heading">Add a student</h2>
    <p class="muted">Fields marked <span class="required">*</span> are required.</p>
    <form ref="formEl" class="form" novalidate @submit.prevent="submit">
      <FormField v-model="form.name" label="Name" required autocomplete="name" :error="errors.name" />
      <FormField
        v-model="form.studentId"
        label="Student ID"
        required
        inputmode="numeric"
        hint="Digits only, e.g. 1001"
        :error="errors.studentId"
      />
      <FormField
        v-model="form.phone"
        label="Phone"
        type="tel"
        required
        autocomplete="tel"
        hint="e.g. 555-1234"
        :error="errors.phone"
      />
      <FormField
        v-model="form.zip"
        label="ZIP code"
        required
        inputmode="numeric"
        autocomplete="postal-code"
        hint="e.g. 77001"
        :error="errors.zip"
      />
      <div v-if="formError" class="alert alert-error" role="alert">{{ formError }}</div>
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Adding…' : 'Add student' }}
      </button>
    </form>
  </section>
</template>
