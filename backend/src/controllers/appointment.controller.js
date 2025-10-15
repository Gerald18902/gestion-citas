const Appointment = require("../models/Appointment");
const { isOverlapping } = require("../utils/timeUtils");

// Buscar conflictos
async function findConflicts({ doctorName, date, startTime, endTime, excludeId }) {
  const query = { doctorName, date: new Date(date) };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await Appointment.find(query);

  return existing.filter((appt) =>
    isOverlapping(startTime, endTime, appt.startTime, appt.endTime)
  );
}

// Crear cita
exports.createAppointment = async (req, res) => {
  try {
    const { patientName, doctorName, date, startTime, endTime, reason, status } = req.body;

    // Validaciones básicas
    if (!patientName || !doctorName || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Campos obligatorios faltantes." });
    }

    if (endTime <= startTime) {
      return res.status(400).json({ message: "La hora de fin debe ser posterior a la de inicio." });
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const selectedDate = new Date(date).setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ message: "La fecha no puede ser anterior a hoy." });
    }

    // Validar solapamientos
    const conflicts = await findConflicts({ doctorName, date, startTime, endTime });
    if (conflicts.length > 0) {
      return res.status(409).json({ message: "Conflicto de horario detectado", conflicts });
    }

    const newAppointment = await Appointment.create({
      patientName,
      doctorName,
      date,
      startTime,
      endTime,
      reason,
      status,
    });

    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ message: "Error al crear cita", error: error.message });
  }
};

// Listar citas
exports.getAppointments = async (req, res) => {
  try {
    const { date, doctorName, status } = req.query;
    const filters = {};
    if (date) filters.date = new Date(date);
    if (doctorName) filters.doctorName = doctorName;
    if (status) filters.status = status;

    const appointments = await Appointment.find(filters).sort({ date: 1, startTime: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener citas", error: error.message });
  }
};

// Obtener una cita
exports.getAppointmentById = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Cita no encontrada" });
    res.json(appt);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener cita", error: error.message });
  }
};

// Actualizar cita
exports.updateAppointment = async (req, res) => {
  try {
    const { patientName, doctorName, date, startTime, endTime, reason, status } = req.body;
    const { id } = req.params;

    const conflicts = await findConflicts({ doctorName, date, startTime, endTime, excludeId: id });
    if (conflicts.length > 0) {
      return res.status(409).json({ message: "Conflicto de horario detectado", conflicts });
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { patientName, doctorName, date, startTime, endTime, reason, status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Cita no encontrada" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar cita", error: error.message });
  }
};

// Eliminar cita
exports.deleteAppointment = async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Cita no encontrada" });
    res.json({ message: "Cita eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar cita", error: error.message });
  }
};

// Endpoint /conflicts/check
exports.checkConflicts = async (req, res) => {
  try {
    const { doctorName, date, startTime, endTime, excludeId } = req.query;
    const conflicts = await findConflicts({ doctorName, date, startTime, endTime, excludeId });
    res.json(conflicts);
  } catch (error) {
    res.status(500).json({ message: "Error al verificar conflictos", error: error.message });
  }
};
