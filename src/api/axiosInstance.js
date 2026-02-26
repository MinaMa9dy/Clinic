import axios from 'axios';

const api = axios.create({
  baseURL: 'https://myclinicbe.runasp.net/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
