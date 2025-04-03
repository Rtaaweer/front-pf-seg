const admin = require("firebase-admin");
const serviceAccount = require("./firebaseConfig.json"); // Archivo con credenciales

// Inicializar Firebase solo si no está ya inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

module.exports = { db, admin };
