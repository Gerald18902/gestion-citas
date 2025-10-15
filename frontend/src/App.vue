<template>
  <div :class="['min-h-screen p-6 transition-colors duration-500', isDark ? 'bg-gray-900 text-black' : 'bg-gray-50 text-gray-900']">
    <!-- Barra superior -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-blue-600 dark:text-blue-400">
        Sistema de Gestión de Citas
      </h1>

      <button
        @click="toggleTheme"
        class="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded hover:opacity-80 transition"
      >
        <span v-if="isDark">☀️</span>
        <span v-else>🌙</span>
      </button>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-5xl mx-auto">
      <AppointmentList />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import AppointmentList from "./components/AppointmentList.vue";

const isDark = ref(false);

// Guardar preferencia en localStorage
onMounted(() => {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    isDark.value = true;
    document.documentElement.classList.add("dark");
  }
});

watch(isDark, (val) => {
  if (val) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
});

function toggleTheme() {
  isDark.value = !isDark.value;
}
</script>
