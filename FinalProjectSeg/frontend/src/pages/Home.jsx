import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Datos estáticos
  const studentName = "Ricardo Torres Jiménez";
  const teacherName = "Emmanuel Martínez Hernández";

  const handleLogout = async () => {
    try {
      const response = await fetch("https://back-pf-seg.onrender.com/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@example.com" }) // Replace with actual user email
      });

      if (response.ok) {
        // Clear authentication state
        logout();
        navigate("/login");
      } else {
        console.error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error en la solicitud de cierre de sesión:", error);
    }
  };

  return (
    <div className="flex flex-col w-screen items-center justify-center min-h-screen bg-gray-100 p-6 items-center">
      <div className="bg-white justify-center left shadow-lg rounded-lg p-8 max-w-lg text-center items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido</h1>
        <p className="text-lg text-gray-800 mb-2">
          TSU: <span className="font-semibold">{studentName}</span>
        </p>
        <p className="text-lg text-gray-800 mb-2">
          M.C.C. <span className="font-semibold">{teacherName}</span>
        </p>
        <p className="text-md text-gray-700 mb-6">
          Esta aplicación permite el registro y autenticación de usuarios con MFA,
          además de visualizar logs de actividad en gráficos.
        </p>
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition transform hover:scale-105"
          onClick={() => navigate("/logs")}
        >
          Ver Logs
        </button>
        <button
          className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition transform hover:scale-105"
          onClick={handleLogout}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Home;