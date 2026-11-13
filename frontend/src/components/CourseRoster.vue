<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import SelectField from './SelectField.vue';
import StatusMessage from './StatusMessage.vue';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useNotificationsStore } from '@/stores/notifications';

const emit = defineEmits(['course-change']);

const coursesStore = useCoursesStore();
const enrollmentsStore = useEnrollmentsStore();
const notifications = useNotificationsStore();

const { courses } = storeToRefs(coursesStore);
const { selectedCourseId, rosterCourse, roster, loading, error } = storeToRefs(enrollmentsStore);

const removingId = ref('');

const courseOptions = computed(() => courses.value.map((c) => ({ value: c._id, label: `${c.courseId} – ${c.name}` })));

const selectedCourse = computed({
  get: () => selectedCourseId.value,
  set: (courseId) => {
    enrollmentsStore.fetchRoster(courseId);
    emit('course-change', courseId);
  },
});

async function unenroll(entry) {
  const { student } = entry;
  if (!window.confirm(`Remove ${student.name} from ${rosterCourse.value?.courseId}?`)) return;
  removingId.value = entry.enrollmentId;
  try {
    await enrollmentsStore.unenroll(entry.enrollmentId);
    notifications.success(`${student.name} removed from ${rosterCourse.value?.courseId}.`);
  } catch (err) {
    notifications.error(`Could not remove ${student.name}: ${err.message}`);
  } finally {
    removingId.value = '';
  }
}
</script>

<template>
  <section class="card" aria-labelledby="roster-heading">
    <div class="card-header">
      <h2 id="roster-heading">Course roster</h2>
      <span v-if="rosterCourse" class="badge" :aria-label="`${roster.length} students enrolled`">{{ roster.length }}</span>
    </div>

    <SelectField
      v-model="selectedCourse"
      label="Course"
      placeholder="Select a course to see its students"
      :options="courseOptions"
    />

    <div class="roster" aria-live="polite">
      <StatusMessage v-if="!selectedCourseId" type="info" message="Select a course to list the students enrolled in it." />
      <StatusMessage v-else-if="loading" type="loading" message="Loading enrolled students…" />
      <StatusMessage v-else-if="error" type="error" :message="error" @retry="enrollmentsStore.fetchRoster()" />
      <StatusMessage
        v-else-if="!roster.length"
        type="empty"
        :message="`No students are enrolled in ${rosterCourse?.courseId ?? 'this course'} yet.`"
      />
      <div v-else class="table-wrapper">
        <table class="table-responsive">
          <caption>Students enrolled in {{ rosterCourse.courseId }} – {{ rosterCourse.name }}</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Student ID</th>
              <th scope="col">Phone</th>
              <th scope="col">ZIP</th>
              <th scope="col" class="actions"><span class="visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in roster" :key="entry.enrollmentId">
              <td data-label="Name">{{ entry.student.name }}</td>
              <td data-label="Student ID">{{ entry.student.studentId }}</td>
              <td data-label="Phone">{{ entry.student.phone }}</td>
              <td data-label="ZIP">{{ entry.student.zip }}</td>
              <td class="actions">
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  :disabled="removingId === entry.enrollmentId"
                  :aria-label="`Remove ${entry.student.name} from ${rosterCourse.courseId}`"
                  @click="unenroll(entry)"
                >
                  {{ removingId === entry.enrollmentId ? 'Removing…' : 'Remove' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.roster {
  margin-top: 1rem;
}
</style>
