<script setup>
import { onMounted } from 'vue';
import StudentForm from '@/components/StudentForm.vue';
import StudentSearch from '@/components/StudentSearch.vue';
import { useStudentsStore } from '@/stores/students';

const studentsStore = useStudentsStore();

onMounted(() => {
  // Refresh results for the current search (all students when empty).
  studentsStore.searchStudents(studentsStore.searchTerm);
});
</script>

<template>
  <div>
    <header class="page-header">
      <h1>Students</h1>
      <p>Add, search for, and delete students.</p>
    </header>
    <div class="page-grid">
      <StudentForm />
      <StudentSearch />
    </div>
  </div>
</template>
