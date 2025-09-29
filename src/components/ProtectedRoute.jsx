import React, { useEffect, useState } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";

// Função utilitária para checar autenticação
function isAuthenticated() {
  return localStorage.getItem("isAuthenticated") === "true";
}

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const auth = isAuthenticated();
    setIsAuth(auth);
    
    if (!auth) {
      // Salva a URL atual para redirecionar após o login
      localStorage.setItem('redirectAfterLogin', location.pathname);
    }
  }, [location]);

  // Mostra um loader enquanto verifica a autenticação
  if (isAuth === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #1a237e',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Se estiver autenticado, renderiza as rotas filhas
  return children || <Outlet />;
};

export default ProtectedRoute;
