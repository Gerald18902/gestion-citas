const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true, trim: true },
    doctorName: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // formato "HH:mm"
    endTime: { type: String, required: true },
    reason: { type: String, trim: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
