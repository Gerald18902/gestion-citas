<template>
  <div class="bg-red-100 border border-red-400 text-red-700 p-3 rounded mt-3">
    <p class="font-bold mb-2">Conflictos detectados:</p>
    <ul class="list-disc ml-6">
      <li v-for="c in conflicts" :key="c._id">
        {{ c.doctorName }} — {{ formatDate(c.date) }} {{ c.startTime }} - {{ c.endTime }}
      </li>
    </ul>
    <button
      @click="$emit('close')"
      class="mt-2 text-sm text-blue-700 underline"
    >
      Cerrar
    </button>
  </div>
</template>

<script setup>
const props = defineProps({ conflicts: Array });

function formatDate(date) {
  return new Date(date).toLocaleDateString("es-PE");
}
</script>
