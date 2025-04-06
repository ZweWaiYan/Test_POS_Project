import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const axiosInstance = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }else {
      window.location.href = '/';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401)) {
      localStorage.removeItem('token');
      window.location.href = '/';
  }
    return Promise.reject(error);
  }
);

export default axiosInstance;
