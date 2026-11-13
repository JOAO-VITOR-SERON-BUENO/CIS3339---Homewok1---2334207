<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import SelectField from './SelectField.vue';
import StatusMessage from './StatusMessage.vue';
import { useStudentsStore } from '@/stores/students';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useNotificationsStore } from '@/stores/notifications';

const studentsStore = useStudentsStore();
const coursesStore = useCoursesStore();
const enrollmentsStore = useEnrollmentsStore();
const notifications = useNotificationsStore();

const { sortedStudents, loading: studentsLoading, error: studentsError } = storeToRefs(studentsStore);
const { courses, loading: coursesLoading, error: coursesError } = storeToRefs(coursesStore);

const form = reactive({ studentId: '', courseId: '' });
const errors = reactive({ studentId: '', courseId: '' });
const submitting = ref(false);
const formError = ref('');

// Options come from the backend data loaded into the Pinia stores.
const studentOptions = computed(() =>
  sortedStudents.value.map((s) => ({ value: s._id, label: `${s.name} (${s.studentId})` }))
);
const courseOptions = computed(() => courses.value.map((c) => ({ value: c._id, label: `${c.courseId} – ${c.name}` })));

const loading = computed(() => studentsLoading.value || coursesLoading.value);
const loadError = computed(() => studentsError.value || coursesError.value);
const missingData = computed(() => !sortedStudents.value.length || !courses.value.length);

// Clear selections that no longer exist (e.g. after a delete).
watch(studentOptions, (opts) => {
  if (form.studentId && !opts.some((o) => o.value === form.studentId)) form.studentId = '';
});
watch(courseOptions, (opts) => {
  if (form.courseId && !opts.some((o) => o.value === form.courseId)) form.courseId = '';
});

function reload() {
  studentsStore.fetchStudents();
  coursesStore.fetchCourses();
}

async function submit() {
  formError.value = '';
  errors.studentId = form.studentId ? '' : 'Select a student';
  errors.courseId = form.courseId ? '' : 'Select a course';
  if (errors.studentId || errors.courseId) return;

  submitting.value = true;
  try {
    const { message } = await enrollmentsStore.enroll(form.studentId, form.courseId);
    notifications.success(`${message}.`);
    form.studentId = '';
  } catch (err) {
    formError.value = err.message;
    // A 404 means the student/course was deleted elsewhere; refresh the options.
    if (err.status === 404) reload();
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section class="card" aria-labelledby="enroll-heading">
    <h2 id="enroll-heading">Enroll a student</h2>

    <StatusMessage v-if="loading && missingData" type="loading" message="Loading students and courses…" />
    <StatusMessage v-else-if="loadError" type="error" :message="loadError" @retry="reload" />
    <StatusMessage v-else-if="missingData" type="empty" message="You need at least one student and one course to enroll.">
      <p>
        <RouterLink v-if="!sortedStudents.length" to="/students">Add a student</RouterLink>
        <span v-if="!sortedStudents.length && !courses.length"> · </span>
        <RouterLink v-if="!courses.length" to="/courses">Add a course</RouterLink>
      </p>
    </StatusMessage>

    <form v-else class="form" novalidate @submit.prevent="submit">
      <SelectField
        v-model="form.studentId"
        label="Student"
        required
        placeholder="Select a student"
        :options="studentOptions"
        :error="errors.studentId"
        @change="errors.studentId = ''"
      />
      <SelectField
        v-model="form.courseId"
        label="Course"
        required
        placeholder="Select a course"
        :options="courseOptions"
        :error="errors.courseId"
        @change="errors.courseId = ''"
      />
      <div v-if="formError" class="alert alert-error" role="alert">{{ formError }}</div>
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Enrolling…' : 'Enroll student' }}
      </button>
    </form>
  </section>
</template>
