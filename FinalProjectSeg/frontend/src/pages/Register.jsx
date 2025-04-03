import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({ email: "", username: "", password: "" });
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();  // Usamos navigate para redirigir después del registro

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones simples
    if (!formData.email || !formData.username || !formData.password) {
      setMessage({ type: "error", text: "Todos los campos son obligatorios" });
      return;
    }

    // Validación de email
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(formData.email)) {
      setMessage({ type: "error", text: "Email no válido" });
      return;
    }

    // Validación de password (mínimo 6 caracteres)
    if (formData.password.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    // Simulación de envío al backend
    try {
      const response = await fetch("https://back-pf-seg.onrender.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Registro exitoso" });
        setFormData({ email: "", username: "", password: "" });

        // Redirigir al Login después de un registro exitoso
        setTimeout(() => {
          navigate("/login");
        }, 1500); // Redirige después de 1.5 segundos para mostrar el mensaje de éxito
      } else {
        setMessage({ type: "error", text: data.message || "Error en el registro" });
      }
    } catch (error) {
        error
      setMessage({ type: "error", text: "Error en el servidor" });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Registro</h2>
        {message && (
          <div className={`p-2 mb-4 text-white rounded ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>{message.text}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={handleChange} 
            className="w-full p-2 border rounded" 
            required 
          />
          <input 
            type="text" 
            name="username" 
            placeholder="Username" 
            value={formData.username} 
            onChange={handleChange} 
            className="w-full p-2 border rounded" 
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleChange} 
            className="w-full p-2 border rounded" 
            required 
          />
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Registrarse
          </button>
        </form>
        <p className="mt-4 text-center">
          Ya tienes una cuenta?{" "}
          <span 
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Inicia Sesión
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;