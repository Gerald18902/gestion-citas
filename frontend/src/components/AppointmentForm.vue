<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
      <h2 class="text-xl font-bold mb-4">
        {{ appointment ? "Editar cita" : "Nueva cita" }}
      </h2>

      <!-- MENSAJES DE ERROR -->
      <div v-if="errors.length" class="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-3">
        <ul class="list-disc ml-5">
          <li v-for="(err, i) in errors" :key="i">{{ err }}</li>
        </ul>
      </div>

      <form @submit.prevent="validateAndSave" class="space-y-3">
        <input
          v-model="form.patientName"
          placeholder="Paciente"
          class="w-full border rounded px-2 py-1"
          required
        />
        <input
          v-model="form.doctorName"
          placeholder="Doctor"
          class="w-full border rounded px-2 py-1"
          required
        />
        <input
          type="date"
          v-model="form.date"
          class="w-full border rounded px-2 py-1"
          required
        />
        <div class="flex gap-2">
          <TimeSelect v-model="form.startTime" label="Hora de inicio" class="flex-1" />
          <TimeSelect v-model="form.endTime" label="Hora de fin" class="flex-1" />
        </div>
        <textarea
          v-model="form.reason"
          placeholder="Motivo"
          class="w-full border rounded px-2 py-1"
        ></textarea>

        <select v-model="form.status" class="w-full border rounded px-2 py-1">
          <option value="scheduled">Programada</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>

        <div class="flex justify-end gap-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-3 py-1 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </form>

      <!-- CONFLICTOS -->
      <ConflictAlert
        v-if="conflicts.length"
        :conflicts="conflicts"
        @close="conflicts = []"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref } from "vue";
import { api } from "../services/api";
import ConflictAlert from "./ConflictAlert.vue";
import TimeSelect from "./TimeSelect.vue"

const props = defineProps({ appointment: Object });
const emit = defineEmits(["close", "saved"]);

const form = reactive({
  patientName: "",
  doctorName: "",
  date: "",
  startTime: "",
  endTime: "",
  reason: "",
  status: "scheduled",
});

const errors = ref([]);
const conflicts = ref([]);

// Cuando se abre el formulario
watch(
  () => props.appointment,
  (val) => {
    if (val) Object.assign(form, val);
    else
      Object.assign(form, {
        patientName: "",
        doctorName: "",
        date: "",
        startTime: "",
        endTime: "",
        reason: "",
        status: "scheduled",
      });
    errors.value = [];
    conflicts.value = [];
  },
  { immediate: true }
);

function validateAndSave() {
  errors.value = [];

  // Validar fecha >= hoy
  const today = new Date().setHours(0, 0, 0, 0);
  const selected = new Date(form.date).setHours(0, 0, 0, 0);
  if (selected < today) {
    errors.value.push("La fecha no puede ser anterior a hoy.");
  }

  // Validar hora fin > inicio
  if (form.endTime <= form.startTime) {
    errors.value.push("La hora de fin debe ser posterior a la de inicio.");
  }

  if (errors.value.length) return; // si hay errores, no continuar

  // Verificar solapamientos con backend antes de guardar
  checkConflicts();
}

async function checkConflicts() {
  try {
    const params = {
      doctorName: form.doctorName,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
    };
    if (props.appointment?._id) params.excludeId = props.appointment._id;

    const res = await api.get("/appointments/conflicts/check", { params });
    if (res.data.length > 0) {
      conflicts.value = res.data;
    } else {
      saveAppointment();
    }
  } catch (err) {
    console.error("Error al verificar conflictos:", err);
    saveAppointment();
  }
}

async function saveAppointment() {
  try {

    if (props.appointment) {
      await api.put(`/appointments/${props.appointment._id}`, form);
    } else {
      await api.post("/appointments", form);
    }
    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Error al guardar cita:", err);
    alert("Error al guardar cita");
  }
}
</script>
