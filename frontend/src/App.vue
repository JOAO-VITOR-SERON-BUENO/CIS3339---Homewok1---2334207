<script setup>
import { RouterView } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import ToastRegion from '@/components/ToastRegion.vue';
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <AppHeader />
  <main id="main-content" class="container" tabindex="-1">
    <RouterView />
  </main>
  <footer class="app-footer">
    <div class="container">CIS 3339 · Student Management System</div>
  </footer>
  <ToastRegion />
</template>
