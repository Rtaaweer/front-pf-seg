const { db } = require("../firebase");
const admin = require("firebase-admin");

const saveLog = async (email, endpoint, eventType, details, ip) => {
  try {
    await db.collection("logs").add({
      email,
      endpoint,
      eventType,
      details,
      ip,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Log guardado: ${eventType}`);
  } catch (error) {
    console.error("Error al guardar log:", error);
  }
};

module.exports = { saveLog };
