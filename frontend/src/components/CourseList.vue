<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import StatusMessage from './StatusMessage.vue';
import { useCoursesStore } from '@/stores/courses';
import { useNotificationsStore } from '@/stores/notifications';

const coursesStore = useCoursesStore();
const notifications = useNotificationsStore();
const { courses, loading, error } = storeToRefs(coursesStore);

const deletingId = ref('');

async function deleteCourse(course) {
  const count = course.enrollmentCount || 0;
  const warning = count ? ` ${count} enrollment(s) will also be removed.` : '';
  if (!window.confirm(`Delete course ${course.courseId} – ${course.name}?${warning}`)) return;

  deletingId.value = course._id;
  try {
    const { enrollmentsRemoved } = await coursesStore.deleteCourse(course._id);
    const extra = enrollmentsRemoved ? ` ${enrollmentsRemoved} enrollment(s) removed.` : '';
    notifications.success(`Course ${course.courseId} deleted.${extra}`);
  } catch (err) {
    notifications.error(`Could not delete ${course.courseId}: ${err.message}`);
  } finally {
    deletingId.value = '';
  }
}
</script>

<template>
  <section class="card" aria-labelledby="course-list-heading">
    <div class="card-header">
      <h2 id="course-list-heading">All courses</h2>
      <span v-if="courses.length" class="badge" :aria-label="`${courses.length} courses`">{{ courses.length }}</span>
    </div>

    <div aria-live="polite">
      <StatusMessage v-if="loading && !courses.length" type="loading" message="Loading courses…" />
      <StatusMessage v-else-if="error" type="error" :message="error" @retry="coursesStore.fetchCourses()" />
      <StatusMessage v-else-if="!courses.length" type="empty" message="No courses yet. Add one using the form." />
      <div v-else class="table-wrapper">
        <table class="table-responsive">
          <thead>
            <tr>
              <th scope="col">Course ID</th>
              <th scope="col">Course name</th>
              <th scope="col">Enrolled</th>
              <th scope="col" class="actions"><span class="visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in courses" :key="course._id">
              <td data-label="Course ID"><strong>{{ course.courseId }}</strong></td>
              <td data-label="Course name">{{ course.name }}</td>
              <td data-label="Enrolled">
                <RouterLink
                  :to="{ name: 'enrollments', query: { course: course._id } }"
                  :aria-label="`View ${course.enrollmentCount || 0} students enrolled in ${course.courseId}`"
                >
                  {{ course.enrollmentCount || 0 }} student(s)
                </RouterLink>
              </td>
              <td class="actions">
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  :disabled="deletingId === course._id"
                  :aria-label="`Delete course ${course.courseId}`"
                  @click="deleteCourse(course)"
                >
                  {{ deletingId === course._id ? 'Deleting…' : 'Delete' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
