/* global process */

const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  env: process.env.REACT_APP_ENV || 'development'
};

export default config;
