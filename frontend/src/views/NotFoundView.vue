<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <section class="card empty-state">
    <h1>Page not found</h1>
    <p>The page you are looking for does not exist.</p>
    <RouterLink to="/students" class="btn btn-primary">Go to Students</RouterLink>
  </section>
</template>
