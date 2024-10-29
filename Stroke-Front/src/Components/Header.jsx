
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';  

const Header = () => {
  return (
    <header className="header d-flex justify-content-between align-items-center p-3 shadow">
      {/* Mostrar el Logo a la izquierda */}
      <div className="header-logo">
        <Link to="/">
          <img src="/Stroke.png" alt="Logo" style={{ height: '70px' }} />
        </Link>
      </div>

      {/* Menú en el centro */}
      <nav className="header-menu">
        <ul className="d-flex list-unstyled mb-0">
          <li className="mx-3">
            <Link to="/Inicio" className="text-decoration-none">Inicio</Link>
          </li>
          <li className="mx-3">
            <Link to="/Test" className="text-decoration-none">Test</Link>
          </li>
          <li className="mx-3">
            <Link to="/Práctica" className="text-decoration-none">Práctica</Link>
          </li>
          <li className="mx-3">
            <Link to="/Historial" className="text-decoration-none">Historial</Link>
          </li>
        </ul>
      </nav>

      {/* Icono de perfil a la derecha */}
      <div className="header-profile">
        <Link to="/profile">
          <FaUserCircle size={40} color="#333" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
