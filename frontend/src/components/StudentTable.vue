<script setup>
defineProps({
  students: { type: Array, required: true },
  caption: { type: String, default: '' },
  deletingId: { type: String, default: '' },
});

defineEmits(['delete']);
</script>

<template>
  <div class="table-wrapper">
    <table class="table-responsive">
      <caption v-if="caption">{{ caption }}</caption>
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
        <tr v-for="student in students" :key="student._id">
          <td data-label="Name">{{ student.name }}</td>
          <td data-label="Student ID">{{ student.studentId }}</td>
          <td data-label="Phone">{{ student.phone }}</td>
          <td data-label="ZIP">{{ student.zip }}</td>
          <td class="actions">
            <button
              type="button"
              class="btn btn-danger btn-sm"
              :disabled="deletingId === student._id"
              :aria-label="`Delete student ${student.name}`"
              @click="$emit('delete', student)"
            >
              {{ deletingId === student._id ? 'Deleting…' : 'Delete' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
