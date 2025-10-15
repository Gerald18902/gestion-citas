<template>
  <div class="relative">
    <label class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <button
      type="button"
      @click="open = !open"
      class="w-full border rounded px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      {{ modelValue || 'Seleccionar hora' }}
    </button>

    <div
      v-if="open"
      class="absolute z-10 mt-1 max-h-48 overflow-y-auto bg-white border rounded shadow w-full"
    >
      <div
        v-for="time in times"
        :key="time"
        @click="select(time)"
        class="px-3 py-2 hover:bg-blue-100 cursor-pointer"
      >
        {{ time }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: String,
  label: String
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)

// genera intervalos de 30 minutos (puedes cambiar a 15)
const times = []
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hh = String(h).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    times.push(`${hh}:${mm}`)
  }
}

function select(time) {
  emit('update:modelValue', time)
  open.value = false
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.relative')) open.value = false
})
</script>
