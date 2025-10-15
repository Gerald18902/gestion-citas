require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/db");

const app = express();
const port = process.env.PORT || 4000;

// Conexión a base de datos
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas base
app.get("/", (req, res) => {
  res.send("Servidor backend funcionando correctamente 🚀");
});

app.use("/api/appointments", require("./src/routes/appointments.routes"));

app.listen(port, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${port}`);
});
