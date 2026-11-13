<script setup>
import { RouterLink } from 'vue-router';

const links = [
  { to: '/students', label: 'Students' },
  { to: '/courses', label: 'Courses' },
  { to: '/enrollments', label: 'Enrollments' },
];
</script>

<template>
  <header class="app-header">
    <div class="container app-header__inner">
      <RouterLink to="/" class="brand">
        <img src="/favicon.svg" alt="" width="28" height="28" />
        <span>Student Management</span>
      </RouterLink>
      <nav aria-label="Main navigation">
        <ul class="nav-list">
          <li v-for="link in links" :key="link.to">
            <RouterLink :to="link.to" class="nav-link" active-class="nav-link--active">
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.app-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-block: 0.75rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-text);
  text-decoration: none;
}

.nav-list {
  display: flex;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.nav-link {
  display: inline-block;
  padding: 0.5rem 0.9rem;
  border-radius: var(--radius);
  color: var(--color-text-muted);
  text-decoration: none;
  font-weight: 500;
}

.nav-link:hover {
  background: var(--color-bg);
  color: var(--color-text);
}

.nav-link--active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
</style>
