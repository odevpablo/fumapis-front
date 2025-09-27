import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Logo from "../assets/brasao-diadema.png";
import "./Navbar.css";

const AppLayout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav style={{
        background: '#1a237e', 
        color: '#fff', 
        padding: '16px 32px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        boxShadow: '0 5px 5px rgb(255, 174, 0)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={Logo} alt="Logo" style={{ width: 32, height: 32 }} />
          <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>FUMAPIS</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/consultar" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Consultar
          </NavLink>
          <NavLink 
            to="/cadastrar" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Cadastrar Eleitores
          </NavLink>
          <NavLink 
            to="/importar" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Importar
          </NavLink>
          <NavLink 
            to="/usuarios" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Usuários
          </NavLink>
          <NavLink 
            to="/relatorios" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Relatórios
          </NavLink>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            marginRight: 8,
            padding: '4px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px'
          }}>
            <i className="fas fa-user" style={{ fontSize: '14px' }}></i>
            <span style={{ fontSize: '14px' }}>{user.name}</span>
          </div>
        )}
        <button 
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.borderColor = 'white';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          }}
        >
          <i className="fas fa-sign-out-alt"></i>
          Sair
        </button>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.2)', margin: '0 8px' }}></div>
        </div>
      </div>
      </nav>
      <div style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
