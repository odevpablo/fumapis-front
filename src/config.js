// Configuração da API
const config = {
  // Em produção, usa HTTP diretamente (sem HTTPS)
  // Em desenvolvimento, usa o proxy do Vite (/api)
  API_URL: import.meta.env.PROD 
    ? 'https://api.fumapis.org'  // Alterado para HTTPS
    : '/api',
  
  // Configurações de CORS para requisições
  corsConfig: {
    mode: 'cors',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  },
  
  // Identificação do ambiente
  env: import.meta.env.MODE || 'development'
};

export default config;
