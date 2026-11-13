<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import StudentTable from './StudentTable.vue';
import StatusMessage from './StatusMessage.vue';
import { useStudentsStore } from '@/stores/students';
import { useNotificationsStore } from '@/stores/notifications';

const studentsStore = useStudentsStore();
const notifications = useNotificationsStore();
const { searchResults, searchTerm, searching, searchError } = storeToRefs(studentsStore);

const query = ref(searchTerm.value);
const deletingId = ref('');

function search() {
  studentsStore.searchStudents(query.value);
}

function showAll() {
  query.value = '';
  studentsStore.searchStudents('');
}

async function deleteStudent(student) {
  if (!window.confirm(`Delete ${student.name} (${student.studentId})? Their enrollments will also be removed.`)) {
    return;
  }
  deletingId.value = student._id;
  try {
    const { enrollmentsRemoved } = await studentsStore.deleteStudent(student._id);
    const extra = enrollmentsRemoved ? ` ${enrollmentsRemoved} enrollment(s) removed.` : '';
    notifications.success(`Student ${student.name} deleted.${extra}`);
  } catch (err) {
    notifications.error(`Could not delete ${student.name}: ${err.message}`);
  } finally {
    deletingId.value = '';
  }
}
</script>

<template>
  <section class="card" aria-labelledby="search-heading">
    <div class="card-header">
      <h2 id="search-heading">Find students</h2>
    </div>

    <form class="inline-form" role="search" @submit.prevent="search">
      <div class="field">
        <label for="student-search">Name or student ID</label>
        <input id="student-search" v-model="query" type="search" placeholder="e.g. John or 1001" />
      </div>
      <button type="submit" class="btn btn-primary" :disabled="searching">Search</button>
      <button v-if="searchTerm" type="button" class="btn btn-secondary" @click="showAll">Show all</button>
    </form>

    <div class="results" aria-live="polite">
      <StatusMessage v-if="searching" type="loading" message="Loading students…" />
      <StatusMessage v-else-if="searchError" type="error" :message="searchError" @retry="search" />
      <StatusMessage
        v-else-if="!searchResults.length"
        type="empty"
        :message="searchTerm ? `No students match “${searchTerm}”.` : 'No students yet. Add one using the form.'"
      />
      <StudentTable
        v-else
        :students="searchResults"
        :deleting-id="deletingId"
        :caption="
          searchTerm
            ? `${searchResults.length} result(s) for “${searchTerm}”`
            : `All students (${searchResults.length})`
        "
        @delete="deleteStudent"
      />
    </div>
  </section>
</template>

<style scoped>
.results {
  margin-top: 1rem;
}
</style>
