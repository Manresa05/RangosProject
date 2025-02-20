require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS para permitir peticiones desde el frontend
app.use(cors());
app.use(express.json());

// Configuración de la base de datos PostgreSQL en Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Endpoint para manejar el login
app.post("/login", async (req, res) => {
  const { usuario, password } = req.body;

  try {
    // Buscar el usuario en la base de datos
    const result = await pool.query("SELECT * FROM user WHERE username = $1", [usuario]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Comparar la contraseña encriptada
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        res.json({ success: true, message: "Login exitoso" });
      } else {
        res.status(401).json({ success: false, message: "Contraseña incorrecta" });
      }
    } else {
      res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
