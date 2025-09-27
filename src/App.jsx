import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "../styles-diadema.css";
import LoadingScreen from "./components/LoadingScreen";
import LoginScreen from "./components/login/LoginScreen";
import InitialLoader from "./components/InitialLoader";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/Home";
import Dashboard from "./components/dashboard/Dashboard";
import Consultar from "./components/eleitores/Consultar";
import Cadastrar from "./components/cadEleitores/Cadastrar";
import Importar from "./components/upload/Importar";
import Usuarios from "./components/Usuarios";
import Relatorios from "./components/Relatorios";
import AppLayout from "./components/AppLayout";
import EleitoresProvider from "./context/EleitoresProvider";

function App() {
  return (
    <Router>
      <EleitoresProvider>
        <Routes>
          <Route path="/loading" element={<LoadingScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          
          {/* Rotas protegidas */}
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/consultar" element={<Consultar />} />
            <Route path="/cadastrar" element={<Cadastrar />} />
            <Route path="/importar" element={<Importar />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/relatorios" element={<Relatorios />} />
            
            {/* Redireciona a rota raiz para /home quando autenticado */}
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Route>
          
          <Route path="/" element={<InitialLoader />} />
          
          {/* Rota de fallback para páginas não encontradas */}
          <Route path="*" element={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              flexDirection: 'column',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1a237e' }}>404</h1>
              <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Página não encontrada</p>
              <a 
                href="/home" 
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1a237e',
                  color: 'white',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: '#303f9f'
                  }
                }}
              >
                Voltar para o Início
              </a>
            </div>
          } />
        </Routes>
      </EleitoresProvider>
    </Router>
  );
}

export default App;
