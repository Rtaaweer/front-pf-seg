require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { saveLog } = require("./utils/logger");
const { db } = require("./firebase");

const app = express();
app.use(cors());
app.use(express.json());

const firebaseConfig = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig)
});

app.get("/", (req, res) => {
  res.send("Servidor corriendo...");
});

app.get("/api/getInfo", (req, res) => {
  res.json({
    nodeVersion: process.version,
    student: {
      name: "Ricardo Torres Jiménez",
      group: "IDGS11",
    },
  });
});

app.post("/api/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const ip = req.ip;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      email,
      username,
      password: hashedPassword,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("usuarios").add(newUser);
    await saveLog(email, "/api/register", "REGISTER_SUCCESS", "Usuario registrado", ip);

    res.status(201).json({ message: "Usuario registrado con éxito", id: docRef.id });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    await saveLog(null, "/api/register", "REGISTER_ERROR", error.message, req.ip);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

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

    const secret = speakeasy.generateSecret({ name: `MiApp (${email})` });
    const otpAuthURL = secret.otpauthURL || `otpauth://totp/MiApp:${email}?secret=${secret.base32}&issuer=MiApp`;
    await db.collection("usuarios").doc(userDoc.id).update({ mfaSecret: secret.base32 });

    QRCode.toDataURL(otpAuthURL, (err, qrCode) => {
      if (err) {
        console.error("Error generando QR:", err);
        return res.status(500).json({ message: "Error generando QR" });
      }
      res.status(200).json({ message: "Escanea este QR en tu app de autenticación", qrCode, email });
    });

    await saveLog(email, "/api/login", "LOGIN_ATTEMPT", "Código QR generado para MFA", ip);
  } catch (error) {
    console.error("Error en /api/login:", error);
    await saveLog(null, "/api/login", "LOGIN_ERROR", error.message, req.ip);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

const activeMfaCodes = new Map();

app.post("/api/verify-mfa", async (req, res) => {
  try {
    const { email, mfaCode } = req.body;
    const ip = req.ip;

    if (!email || !mfaCode) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const snapshot = await db.collection("usuarios").where("email", "==", email).get();
    if (snapshot.empty) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    if (!user.mfaSecret) {
      return res.status(401).json({ message: "MFA no configurado para este usuario" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: mfaCode,
      window: 1,
    });

    if (!verified) {
      await saveLog(email, "/api/verify-mfa", "MFA_ERROR", "Código MFA inválido", ip);
      return res.status(401).json({ message: "Código MFA inválido o expirado" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
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

app.post("/api/logout", async (req, res) => {
  try {
    const { email } = req.body;
    const ip = req.ip;

    // Log the logout action
    await saveLog(email, "/api/logout", "LOGOUT_SUCCESS", "Usuario cerró sesión", ip);

    // Respond with a success message
    res.status(200).json({ message: "Sesión cerrada exitosamente" });
  } catch (error) {
    console.error("Error en /api/logout:", error);
    await saveLog(null, "/api/logout", "LOGOUT_ERROR", error.message, req.ip);
    res.status(500).json({ message: "Error al cerrar sesión" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
