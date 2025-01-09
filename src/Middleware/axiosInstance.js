import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:3005'; // Replace with your API base URL
const TOKEN_STORAGE_KEY = 'token';

// Create an axios instance with base URL
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor to attach token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers['Authorization'] = `${token}`; // Ensure 'Bearer' prefix if required by your server
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
