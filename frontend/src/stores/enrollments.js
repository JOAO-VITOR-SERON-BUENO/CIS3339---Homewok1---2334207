import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/api/client';
import { useCoursesStore } from './courses';

export const useEnrollmentsStore = defineStore('enrollments', () => {
  /** The course whose roster is displayed, and the students enrolled in it. */
  const selectedCourseId = ref('');
  const rosterCourse = ref(null);
  const roster = ref([]);
  const loading = ref(false);
  const error = ref('');

  async function fetchRoster(courseId = selectedCourseId.value) {
    selectedCourseId.value = courseId;
    roster.value = [];
    rosterCourse.value = null;
    error.value = '';
    if (!courseId) return;

    loading.value = true;
    try {
      const data = await api.get(`/enrollments?courseId=${encodeURIComponent(courseId)}`);
      // Ignore stale responses if the user picked another course meanwhile.
      if (courseId !== selectedCourseId.value) return;
      rosterCourse.value = data.course;
      roster.value = data.students;
    } catch (err) {
      if (courseId === selectedCourseId.value) error.value = err.message;
    } finally {
      if (courseId === selectedCourseId.value) loading.value = false;
    }
  }

  /** Enrolls a student. Throws ApiError (e.g. 409 duplicate) for the caller to display. */
  async function enroll(studentId, courseId) {
    const result = await api.post('/enrollments', { studentId, courseId });
    useCoursesStore().adjustEnrollmentCount(courseId, 1);
    if (courseId === selectedCourseId.value) await fetchRoster(courseId);
    return result;
  }

  async function unenroll(enrollmentId) {
    const result = await api.delete(`/enrollments/${enrollmentId}`);
    roster.value = roster.value.filter((entry) => entry.enrollmentId !== enrollmentId);
    useCoursesStore().adjustEnrollmentCount(result.enrollment.course, -1);
    return result;
  }

  /** Called after a student is deleted (their enrollments are cascaded server-side). */
  function removeStudentFromRoster(studentId) {
    roster.value = roster.value.filter((entry) => entry.student._id !== studentId);
  }

  /** Called after a course is deleted. */
  function handleCourseDeleted(courseId) {
    if (selectedCourseId.value === courseId) {
      selectedCourseId.value = '';
      rosterCourse.value = null;
      roster.value = [];
    }
  }

  return {
    selectedCourseId,
    rosterCourse,
    roster,
    loading,
    error,
    fetchRoster,
    enroll,
    unenroll,
    removeStudentFromRoster,
    handleCourseDeleted,
  };
});
