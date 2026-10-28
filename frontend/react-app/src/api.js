import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sos_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function contatoDaApi(row) {
  return {
    id: row.id_contato,
    name: row.nome,
    phone: row.telefone,
    relation: row.parentesco,
    userId: row.id_usuario,
  };
}
