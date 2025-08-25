import axios from 'axios';

// Devine l'URL de base de l'API selon l'environnement
const guessBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) return process.env.REACT_APP_API_BASE_URL;
  
  // En développement: si le frontend tourne sur localhost:3000, le backend est souvent sur 8000
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:8000/api'; // ✅ rapide et stable
    }
  }

  // Valeur par défaut
  return 'http://127.0.0.1:8000/api';
};

const API_BASE_URL = guessBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attache le jeton d'authentification si disponible
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Accept'] = 'application/json';
  return config;
});

// Gère les erreurs 401 globalement (redirection vers la page de connexion)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Extrait un message d'erreur lisible depuis une réponse Axios
export function extractApiError(e, fallback = 'Une erreur est survenue') {
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    (typeof e?.response?.data === 'string' ? e.response.data : null) ||
    e?.message ||
    fallback
  );
}

export default api;
