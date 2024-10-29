import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Screens/Login';  // Asegúrate de tener el componente Login
import Registro from './Screens/Registro'; // Crearás este componente
import Home from './Screens/Home';  // Crearás este componente

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/home" element={<Home />} /> 
      </Routes>
    </Router>
  );
};

export default App;
