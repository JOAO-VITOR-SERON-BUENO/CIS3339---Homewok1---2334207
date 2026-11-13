import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/api/client';
import { useEnrollmentsStore } from './enrollments';

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref([]);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref('');

  async function fetchCourses() {
    loading.value = true;
    error.value = '';
    try {
      courses.value = await api.get('/courses');
      loaded.value = true;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  /** Adds a course. Throws ApiError (e.g. 409 duplicate) for the caller to display. */
  async function addCourse(course) {
    const { course: created } = await api.post('/courses', course);
    courses.value = [...courses.value, { ...created, enrollmentCount: 0 }].sort((a, b) =>
      a.courseId.localeCompare(b.courseId)
    );
    return created;
  }

  /** Deletes a course; the server also removes its enrollments. */
  async function deleteCourse(id) {
    const result = await api.delete(`/courses/${id}`);
    courses.value = courses.value.filter((c) => c._id !== id);
    useEnrollmentsStore().handleCourseDeleted(id);
    return result;
  }

  /** Keeps enrollment counts in sync after enroll/unenroll actions. */
  function adjustEnrollmentCount(courseId, delta) {
    const course = courses.value.find((c) => c._id === courseId);
    if (course) course.enrollmentCount = Math.max(0, (course.enrollmentCount || 0) + delta);
  }

  return {
    courses,
    loading,
    loaded,
    error,
    fetchCourses,
    addCourse,
    deleteCourse,
    adjustEnrollmentCount,
  };
});
