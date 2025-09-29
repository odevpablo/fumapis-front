const config = {
  // Em desenvolvimento, usamos o proxy do Vite (/api)
  // Em produção, usamos a URL completa da API
  API_URL: import.meta.env.PROD 
    ? 'https://api.fumapis.org' 
    : '/api',
  
  // Identificação do ambiente
  env: import.meta.env.MODE || 'development'
};

export default config;
