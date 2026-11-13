import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/api/client';
import { useEnrollmentsStore } from './enrollments';

export const useStudentsStore = defineStore('students', () => {
  /** All students (used by the enrollment form's student selector). */
  const students = ref([]);
  const loading = ref(false);
  const error = ref('');
  const loaded = ref(false);

  /** Results of the most recent search on the Students page. */
  const searchResults = ref([]);
  const searchTerm = ref('');
  const searching = ref(false);
  const searchError = ref('');

  const sortedStudents = computed(() =>
    [...students.value].sort((a, b) => a.name.localeCompare(b.name))
  );

  async function fetchStudents() {
    loading.value = true;
    error.value = '';
    try {
      students.value = await api.get('/students');
      loaded.value = true;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  /** Searches by name (partial, case-insensitive) or exact student ID. */
  async function searchStudents(term) {
    searchTerm.value = term.trim();
    searching.value = true;
    searchError.value = '';
    try {
      const query = searchTerm.value ? `?search=${encodeURIComponent(searchTerm.value)}` : '';
      searchResults.value = await api.get(`/students${query}`);
    } catch (err) {
      searchError.value = err.message;
      searchResults.value = [];
    } finally {
      searching.value = false;
    }
  }

  /** Adds a student. Throws ApiError (e.g. 409 duplicate) for the caller to display. */
  async function addStudent(student) {
    const { student: created } = await api.post('/students', student);
    students.value.push(created);
    // Show the new student in the current list if it matches the active search.
    const term = searchTerm.value.toLowerCase();
    if (!term || created.name.toLowerCase().includes(term) || created.studentId === searchTerm.value) {
      searchResults.value = [...searchResults.value, created].sort((a, b) => a.name.localeCompare(b.name));
    }
    return created;
  }

  /** Deletes a student; the server also removes their enrollments. */
  async function deleteStudent(id) {
    const result = await api.delete(`/students/${id}`);
    students.value = students.value.filter((s) => s._id !== id);
    searchResults.value = searchResults.value.filter((s) => s._id !== id);
    useEnrollmentsStore().removeStudentFromRoster(id);
    return result;
  }

  return {
    students,
    sortedStudents,
    loading,
    loaded,
    error,
    searchResults,
    searchTerm,
    searching,
    searchError,
    fetchStudents,
    searchStudents,
    addStudent,
    deleteStudent,
  };
});
