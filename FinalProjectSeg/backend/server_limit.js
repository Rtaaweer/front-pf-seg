require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const QRCode = require("qrcode");
const { saveLog } = require("./utils/logger");

const serviceAccount = require("./firebaseConfig.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();
const app = express();
app.use(express.json());
app.use(cors());

// Contador de peticiones para stats
let petitionCount = 0;

// Verificar si se usa Rate Limit según argumento de inicio
const useRateLimit = process.argv.includes("--rate-limit");
if (useRateLimit) {
  const rateLimit = require("express-rate-limit");
  console.log("Rate Limit ACTIVADO");

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Demasiadas solicitudes desde esta IP, por favor intenta más tarde."
  });
  app.use(globalLimiter);

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Demasiados intentos de inicio de sesión, intenta más tarde."
  });
  app.use("/api/login", loginLimiter);
} else {
  console.log("Rate Limit DESACTIVADO");
}

// Endpoint para obtener estadísticas de peticiones
app.get("/api/stats", (req, res) => {
  petitionCount++;
  res.json({ petitions: petitionCount, message: "Datos del servidor con Rate Limit" });
});

// Ruta para iniciar sesión con generación de QR para MFA
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;

    if (!email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const snapshot = await db.collection("usuarios").where("email", "==", email).get();
    if (snapshot.empty) {
      await saveLog(email, "/api/login", "LOGIN_ERROR", "Usuario no encontrado", ip);
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await saveLog(email, "/api/login", "LOGIN_ERROR", "Contraseña incorrecta", ip);
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const mfaCode = crypto.randomInt(100000, 999999).toString();
    activeMfaCodes.set(email, mfaCode);
    console.log(`Código MFA para ${email}: ${mfaCode}`);

    // Generar QR con el código MFA
    const qrCodeDataUrl = await QRCode.toDataURL(mfaCode);

    await saveLog(email, "/api/login", "LOGIN_ATTEMPT", "Código MFA enviado", ip);
    res.status(200).json({ message: "Código MFA generado", email, qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error("Error en /api/login:", error);
    await saveLog(null, "/api/login", "LOGIN_ERROR", error.message, req.ip);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

const activeMfaCodes = new Map();

// Ruta para verificar MFA
app.post("/api/verify-mfa", async (req, res) => {
  try {
    const { email, mfaCode } = req.body;
    const ip = req.ip;

    if (!email || !mfaCode) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const storedCode = activeMfaCodes.get(email);
    if (!storedCode || storedCode !== mfaCode) {
      await saveLog(email, "/api/verify-mfa", "MFA_ERROR", "Código MFA inválido", ip);
      return res.status(401).json({ message: "Código MFA inválido o expirado" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    activeMfaCodes.delete(email);

    await saveLog(email, "/api/verify-mfa", "MFA_SUCCESS", "Autenticación exitosa", ip);
    res.status(200).json({ message: "Autenticación exitosa", token });
  } catch (error) {
    console.error("Error en /api/verify-mfa:", error);
    await saveLog(null, "/api/verify-mfa", "MFA_ERROR", error.message, req.ip);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

app.get("/api/getLogs", async (req, res) => {
  try {
    const logsRef = db.collection("logs");
    const snapshot = await logsRef.orderBy("timestamp", "desc").get();

    if (snapshot.empty) {
      await saveLog(null, "/api/getLogs", "LOGS_WARNING", "No se encontraron logs", req.ip);
      return res.status(404).json({ message: "No se encontraron logs" });
    }

    const logs = snapshot.docs.map(doc => doc.data());
    await saveLog(null, "/api/getLogs", "LOGS_SUCCESS", "Logs obtenidos exitosamente", req.ip);
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error al obtener los logs:", error);
    await saveLog(null, "/api/getLogs", "LOGS_ERROR", error.message, req.ip);
    res.status(500).json({ message: "Error al obtener los logs" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
