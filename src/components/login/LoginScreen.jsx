import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/brasao-diadema.png"

const LoginScreen = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    console.log('Tentando fazer login com:', { username, password });
    
    try {
      console.log('Iniciando requisição de login...');
      console.log('Enviando requisição para o servidor...');
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username,
          password,
        }),
      });
      
      console.log('Resposta do servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      const responseData = await response.text();
      console.log('Status da resposta:', response.status);
      console.log('Cabeçalhos da resposta:', Object.fromEntries(response.headers.entries()));
      console.log('Conteúdo da resposta:', responseData);
      
      if (!response.ok) {
        let errorMsg = "Usuário ou senha inválidos";
        try {
          const errorData = JSON.parse(responseData);
          errorMsg = errorData.detail || errorMsg;
        } catch (e) {
          console.error('Erro ao fazer parse da resposta de erro:', e);
        }
        throw new Error(errorMsg);
      }
      
      // Se o login for bem-sucedido, armazena as informações do usuário e o token
      let userData;
      try {
        userData = JSON.parse(responseData);
        console.log('Dados do usuário recebidos:', userData);
        
        localStorage.setItem("user", JSON.stringify({
          username: userData.username || username,
          name: userData.name || username
        }));
        
        // Armazena o token de acesso
        if (userData.access_token) {
          console.log('Token de acesso recebido, armazenando...');
          localStorage.setItem("token", userData.access_token);
          console.log('Token armazenado com sucesso');
        } else {
          console.warn('Nenhum token de acesso recebido na resposta');
        }
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta:', parseError);
        throw new Error('Resposta do servidor em formato inválido');
      }
      
      // Se chegou aqui, o login foi bem-sucedido
      console.log('Login bem-sucedido! Redirecionando...');
      localStorage.setItem("isAuthenticated", "true");
      
      // Obtém a URL de redirecionamento salva anteriormente ou usa '/home' como padrão
      const redirectTo = localStorage.getItem('redirectAfterLogin') || '/home';
      console.log('Redirecionando para:', redirectTo);
      
      // Remove a URL de redirecionamento do localStorage
      localStorage.removeItem('redirectAfterLogin');
      
      // Navega para a rota desejada
      navigate(redirectTo, { replace: true });
      
      // Força um reload da página para garantir que todos os estados sejam reiniciados
      // Isso é importante para garantir que o contexto de autenticação seja atualizado
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (err) {
      console.error('Erro durante o login:', err);
      setError(err.message || "Erro ao fazer login. Verifique o console para mais detalhes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-screen" className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <img src={Logo} alt="Logo" style={{ width: 32, height: 32 }} />
            <h1>FUMAPIS</h1>
          </div>
          <p className="subtitle">Sistema de Gestão Eleitoral</p>
          <p className="location">Secretaria de Habitação e Desenvolvimento Urbano</p>
          <p className="location">Diadema/SP</p>
        </div>
        <form id="login-form" className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuário"
              required
              disabled={loading}
              autoComplete="username"
            />
            <i className="fas fa-user"></i>
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              disabled={loading}
              autoComplete="current-password"
            />
            <i className="fas fa-lock"></i>
          </div>
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading || !username || !password}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Carregando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
          {error && (
            <div id="login-error" className="error-message" style={{ display: "block" }}>
              {error}
            </div>
          )}
        </form>
        <div className="login-footer">
          <p>Acesso restrito a usuários autorizados</p>
          <div className="system-info">
            <span>v1.0.0</span> • <span id="current-date"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
