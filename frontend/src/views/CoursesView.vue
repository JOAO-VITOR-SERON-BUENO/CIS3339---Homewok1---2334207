<script setup>
import { onMounted } from 'vue';
import CourseForm from '@/components/CourseForm.vue';
import CourseList from '@/components/CourseList.vue';
import { useCoursesStore } from '@/stores/courses';

const coursesStore = useCoursesStore();

onMounted(() => coursesStore.fetchCourses());
</script>

<template>
  <div>
    <header class="page-header">
      <h1>Courses</h1>
      <p>Add, list, and delete courses.</p>
    </header>
    <div class="page-grid">
      <CourseForm />
      <CourseList />
    </div>
  </div>
</template>
