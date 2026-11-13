<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EnrollmentForm from '@/components/EnrollmentForm.vue';
import CourseRoster from '@/components/CourseRoster.vue';
import { useStudentsStore } from '@/stores/students';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';

const route = useRoute();
const router = useRouter();
const studentsStore = useStudentsStore();
const coursesStore = useCoursesStore();
const enrollmentsStore = useEnrollmentsStore();

// Keep the selected roster course in the URL (?course=<id>) so it survives a refresh.
function onCourseChange(courseId) {
  router.replace({ query: courseId ? { course: courseId } : {} });
}

onMounted(async () => {
  // Selector options always come from the backend.
  await Promise.all([studentsStore.fetchStudents(), coursesStore.fetchCourses()]);

  const fromUrl = typeof route.query.course === 'string' ? route.query.course : '';
  const courseId = coursesStore.courses.some((c) => c._id === fromUrl) ? fromUrl : enrollmentsStore.selectedCourseId;
  if (courseId && coursesStore.courses.some((c) => c._id === courseId)) {
    enrollmentsStore.fetchRoster(courseId);
    if (courseId !== fromUrl) onCourseChange(courseId);
  } else {
    enrollmentsStore.fetchRoster('');
    if (fromUrl) onCourseChange('');
  }
});
</script>

<template>
  <div>
    <header class="page-header">
      <h1>Enrollments</h1>
      <p>Enroll students in courses and view each course's roster.</p>
    </header>
    <div class="page-grid">
      <EnrollmentForm />
      <CourseRoster @course-change="onCourseChange" />
    </div>
  </div>
</template>
