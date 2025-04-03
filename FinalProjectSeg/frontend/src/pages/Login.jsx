import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Make sure the path is correct

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth(); // This should work if useAuth is properly exported

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (email && password) {
      try {
        const response = await fetch("https://back-pf-seg.onrender.com/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
  
        const data = await response.json();
        console.log("Respuesta del backend:", data); // Verificar que `qrCode` existe
  
        if (response.ok) {
          setShowMFA(true);
          setQrCode(data.qrCode); // Ahora se recibe correctamente
          setMessage(null);
        } else {
          setMessage({ type: "error", text: data.message || "Credenciales incorrectas" });
        }
      } catch (error) {
        error 
        setMessage({ type: "error", text: "Error en el servidor" });
      }
    } else {
      setMessage({ type: "error", text: "Por favor, ingresa todos los datos" });
    }
  };
  
  const handleVerifyMFA = async () => {
    if (mfaCode) {
      try {
        const response = await fetch("https://back-pf-seg.onrender.com/api/verify-mfa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, mfaCode }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage({ type: "success", text: "Acceso concedido" });
          login(); // Asegúrate de que esta función se llame correctamente
          setTimeout(() => {
            navigate("/home");
          }, 1500);
        } else {
          setMessage({ type: "error", text: data.message || "Código MFA incorrecto" });
        }
      } catch (error) {
        error
        setMessage({ type: "error", text: "Error en la verificación MFA" });
      }
    } else {
      setMessage({ type: "error", text: "Por favor, ingresa el código MFA" });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
        {message && (
          <div className={`p-2 mb-4 text-white rounded ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full p-3 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
          >
            Iniciar Sesión
          </button>
        </form>
        <p className="mt-4 text-center">
          No tienes una cuenta?{" "}
          <span 
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Registrate
          </span>
        </p>
      </div>
      {showMFA && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h3 className="text-xl font-bold mb-4">Escanea el QR-Code para obtener tu codigo MFA</h3>
            {qrCode && <img src={qrCode} alt="Código QR MFA" className="mx-auto mb-4" />}
            <input
              type="text"
              placeholder="Código MFA"
              className="w-full p-3 border rounded mb-3"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              required
            />
            <button
              onClick={handleVerifyMFA}
              className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
            >
              Verificar Código
            </button>
          </div>
        </div>
      )}
    </div>
  );
}