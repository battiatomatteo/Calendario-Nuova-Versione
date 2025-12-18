import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Pulisci eventuali dati di sessione
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('tipoUtente');
    localStorage.removeItem('username');

    // Reindirizza alla pagina di login e sostituisci la history
    navigate("/", { replace: true });
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;
