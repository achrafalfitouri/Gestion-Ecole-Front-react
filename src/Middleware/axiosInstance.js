import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:3000'; // Replace with your API base URL
const TOKEN_STORAGE_KEY = 'token';
const REFRESH_INTERVAL_MS = 55 * 60 * 1000; // Refresh token every 20 seconds (adjust as needed)

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

// Function to refresh the token
const refreshToken = async () => {
  try {
    const oldToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!oldToken) {
      throw new Error('No token found');
    }

    console.log('Refreshing token...');
    const response = await axios.post(`${BASE_URL}/api/auth/refresh-token`, null, {
      headers: {
        'Authorization': `${oldToken}`, // Ensure 'Bearer' prefix if required by your server
      },
    });

    const { token: newToken } = response.data;

    // Update token in localStorage
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);

    // Optional: Trigger a state update if using React or similar framework
    // dispatch({ type: 'SET_TOKEN', payload: newToken });
  } catch (error) {
    console.error('Failed to refresh token:', error);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.location.href = '/login'; // Redirect to login page
  }
};

// Set interval to refresh token periodically
setInterval(refreshToken, REFRESH_INTERVAL_MS);

export default axiosInstance;
