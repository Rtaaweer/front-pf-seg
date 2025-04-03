import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

// Registrar los componentes necesarios para Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [actionChartData, setActionChartData] = useState(null);
  const [ipChartData, setIpChartData] = useState(null);
  const [timeChartData, setTimeChartData] = useState(null);
  const [serverType, setServerType] = useState("primary"); // primary or secondary
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Verify authentication on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Obtener logs desde el backend
  const fetchLogs = async (server) => {
    try {
      // URL del servidor según la selección
      const serverUrl = server === "primary" 
        ? "https://back-pf-seg.onrender.com/api/getLogs" 
        : "https://back-pf-seg.onrender.com/api/getLogs";
      
      const response = await axios.get(serverUrl);

      console.log(`Logs obtenidos de ${server}:`, response.data);

      if (Array.isArray(response.data)) {
        // Normalizar datos
        const normalizedLogs = response.data.map(log => ({
          email: log.email || "Desconocido",
          action: log.action || log.eventType || "Acción no especificada",
          details: log.details || "Sin detalles",
          ip: log.ip || "IP no disponible",
          timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
          responseTime: Math.floor(Math.random() * 500) + 50 // Simulamos tiempos de respuesta
        }));

        setLogs(normalizedLogs);
        processActionChartData(normalizedLogs);
        processIpChartData(normalizedLogs);
        processTimeChartData(normalizedLogs);
      } else {
        console.error("Los datos obtenidos no son un arreglo válido");
      }
    } catch (error) {
      console.error(`Error al obtener los logs del servidor ${server}:`, error);
    }
  };

  // Procesar los logs para el gráfico de acciones
  const processActionChartData = (logs) => {
    const actions = logs.map(log => log.action);

    const actionCounts = actions.reduce((acc, action) => {
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {});

    // Preparar los datos para el gráfico
    const chartData = {
      labels: Object.keys(actionCounts),
      datasets: [
        {
          label: "Número de ocurrencias por tipo de acción",
          data: Object.values(actionCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1
        }
      ]
    };

    setActionChartData(chartData);
  };

  // Procesar los logs para el gráfico de IPs
  const processIpChartData = (logs) => {
    const ips = logs.map(log => log.ip);

    const ipCounts = ips.reduce((acc, ip) => {
      acc[ip] = (acc[ip] || 0) + 1;
      return acc;
    }, {});

    // Preparar los datos para el gráfico
    const chartData = {
      labels: Object.keys(ipCounts),
      datasets: [
        {
          label: "Número de accesos por IP",
          data: Object.values(ipCounts),
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1
        }
      ]
    };

    setIpChartData(chartData);
  };

  // Procesar los logs para el gráfico de tiempo
  const processTimeChartData = (logs) => {
    // Agrupar logs por hora del día
    const hourCounts = {};
    
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    // Ordenar las horas
    const sortedHours = Object.keys(hourCounts).sort((a, b) => a - b);
    
    // Preparar los datos para el gráfico
    const chartData = {
      labels: sortedHours.map(hour => `${hour}:00`),
      datasets: [
        {
          label: "Actividad por hora del día",
          data: sortedHours.map(hour => hourCounts[hour]),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };

    setTimeChartData(chartData);
  };

  // Cambiar entre servidores
  const handleServerChange = (server) => {
    setServerType(server);
    fetchLogs(server);
  };

  useEffect(() => {
    fetchLogs(serverType);
  }, []);

  return (
    <div className="flex flex-col w-screen items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white w-screen shadow-lg rounded-lg p-8 max-w-4xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Logs de Actividad</h1>
        
        <div className="mb-6 flex justify-center space-x-4">
          <button 
            onClick={() => handleServerChange("primary")}
            className={`px-4 py-2 rounded ${serverType === "primary" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Servidor Principal
          </button>
          <button 
            onClick={() => handleServerChange("secondary")}
            className={`px-4 py-2 rounded ${serverType === "secondary" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Servidor Secundario
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Tipos de Logs</h2>
            {actionChartData ? <Bar data={actionChartData} /> : <p>Cargando datos...</p>}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Distribución por IP</h2>
            {ipChartData ? <Bar data={ipChartData} /> : <p>Cargando datos...</p>}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-2">Actividad por Hora</h2>
            {timeChartData ? <Bar data={timeChartData} /> : <p>Cargando datos...</p>}
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/home')} 
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Volver a Home
        </button>
      </div>
    </div>
  );
};

export default Logs;