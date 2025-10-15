<template>
  <div>
    <!-- Filtros -->
    <div class="flex flex-wrap items-center justify-between mb-4 gap-2">
      <div class="flex flex-wrap gap-2 items-center relative">
        <!-- Fecha -->
        <input
          type="date"
          v-model="filters.date"
          @change="getAppointments"
          class="border rounded px-2 py-1"
        />

        <!-- Buscador de doctores -->
        <div class="relative">
          <input
            type="text"
            v-model="filters.doctorName"
            @input="onDoctorInput"
            placeholder="Buscar doctor..."
            class="border rounded px-2 py-1 w-48"
          />

          <!-- Dropdown dinámico -->
          <ul
            v-if="showDoctorList"
            class="absolute z-10 bg-white border rounded shadow-md w-full max-h-40 overflow-y-auto"
          >
            <li
              v-for="(doc, index) in filteredDoctors"
              :key="index"
              @click="selectDoctor(doc)"
              class="px-2 py-1 hover:bg-blue-100 cursor-pointer"
            >
              {{ doc }}
            </li>
            <li
              v-if="filteredDoctors.length === 0"
              class="px-2 py-1 text-gray-400 text-sm"
            >
              No hay coincidencias
            </li>
          </ul>
        </div>

        <!-- Estado -->
        <select
          v-model="filters.status"
          @change="getAppointments"
          class="border rounded px-2 py-1"
        >
          <option value="">Todos</option>
          <option value="scheduled">Programadas</option>
          <option value="completed">Completadas</option>
          <option value="cancelled">Canceladas</option>
        </select>

        <!-- Limpiar -->
        <button
          @click="clearFilters"
          class="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
        >
          Limpiar
        </button>
      </div>

      <!-- Nueva cita -->
      <button
        @click="openForm(null)"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        ➕ Nueva cita
      </button>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto border rounded-lg shadow-sm">
      <table class="min-w-full bg-white border">
        <thead class="bg-blue-100 text-blue-700">
          <tr>
            <th class="p-2 border">Paciente</th>
            <th class="p-2 border">Doctor</th>
            <th class="p-2 border">Fecha</th>
            <th class="p-2 border">Inicio</th>
            <th class="p-2 border">Fin</th>
            <th class="p-2 border">Estado</th>
            <th class="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="appt in paginatedAppointments"
            :key="appt._id"
            class="hover:bg-gray-50"
          >
            <td class="p-2 border">{{ appt.patientName }}</td>
            <td class="p-2 border">{{ appt.doctorName }}</td>
            <td class="p-2 border">{{ formatDate(appt.date) }}</td>
            <td class="p-2 border">{{ appt.startTime }}</td>
            <td class="p-2 border">{{ appt.endTime }}</td>
            <td class="p-2 border">
              <span
                class="px-2 py-1 rounded text-white text-sm"
                :class="statusClass(appt.status)"
              >
                {{ appt.status }}
              </span>
            </td>
            <td class="p-2 border text-center space-x-2">
              <button
                @click="openForm(appt)"
                class="text-blue-600 hover:underline"
              >
                Editar
              </button>
              <button
                @click="deleteAppointment(appt._id)"
                class="text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </td>
          </tr>

          <tr v-if="paginatedAppointments.length === 0">
            <td colspan="7" class="text-center p-4 text-gray-500">
              No hay citas que coincidan con los filtros.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="flex justify-between items-center mt-4">
      <div class="text-sm text-gray-600">
        Página {{ currentPage }} de {{ totalPages }}
      </div>

      <div class="flex gap-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          ◀
        </button>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          ▶
        </button>
      </div>
    </div>

    <!-- Formulario modal -->
    <AppointmentForm
      v-if="showForm"
      :appointment="selected"
      @close="closeForm"
      @saved="getAppointments"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "../services/api";
import AppointmentForm from "./AppointmentForm.vue";

/* ------------------ DATA ------------------ */
const appointments = ref([]);
const allDoctors = ref([]);
const filters = ref({ date: "", doctorName: "", status: "" });
const showDoctorList = ref(false);
const showForm = ref(false);
const selected = ref(null);

/* PAGINACIÓN */
const itemsPerPage = 7;
const currentPage = ref(1);

const totalPages = computed(() =>
  Math.ceil(appointments.value.length / itemsPerPage)
);

const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return appointments.value.slice(start, end);
});

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

/* ------------------ OBTENER CITAS ------------------ */
async function getAppointments() {
  try {
    const params = {};
    if (filters.value.date) params.date = filters.value.date;
    if (filters.value.doctorName.trim())
      params.doctorName = filters.value.doctorName.trim();
    if (filters.value.status) params.status = filters.value.status;

    const res = await api.get("/appointments", { params });

    appointments.value = res.data.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Actualizar lista de doctores únicos
    const doctorsSet = new Set(res.data.map((a) => a.doctorName));
    allDoctors.value = Array.from(doctorsSet);

    // Reiniciar a página 1 cada vez que se actualiza la lista
    currentPage.value = 1;
  } catch (error) {
    console.error("Error al obtener citas:", error);
  }
}

/* ------------------ AUTOCOMPLETADO ------------------ */
const filteredDoctors = computed(() => {
  if (!filters.value.doctorName) return allDoctors.value;
  return allDoctors.value.filter((d) =>
    d.toLowerCase().includes(filters.value.doctorName.toLowerCase())
  );
});

function onDoctorInput() {
  showDoctorList.value = true;
}

function selectDoctor(name) {
  filters.value.doctorName = name;
  showDoctorList.value = false;
  getAppointments();
}

/* ------------------ UTILIDADES ------------------ */
function clearFilters() {
  filters.value = { date: "", doctorName: "", status: "" };
  getAppointments();
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("es-PE", { timeZone: "UTC" });
}

function statusClass(status) {
  return {
    scheduled: "bg-blue-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  }[status];
}

function openForm(appt) {
  selected.value = appt;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
}

async function deleteAppointment(id) {
  if (confirm("¿Seguro que deseas eliminar esta cita?")) {
    await api.delete(`/appointments/${id}`);
    getAppointments();
  }
}

onMounted(getAppointments);

// Cerrar dropdown si se hace clic fuera
document.addEventListener("click", (e) => {
  if (!e.target.closest(".relative")) showDoctorList.value = false;
});
</script>
