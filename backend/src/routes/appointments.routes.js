const express = require("express");
const router = express.Router();
const controller = require("../controllers/appointment.controller");

router.post("/", controller.createAppointment);
router.get("/", controller.getAppointments);
router.get("/:id", controller.getAppointmentById);
router.put("/:id", controller.updateAppointment);
router.delete("/:id", controller.deleteAppointment);
router.get("/conflicts/check", controller.checkConflicts);

module.exports = router;
