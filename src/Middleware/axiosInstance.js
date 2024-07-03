import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:3000', // Replace with your API base URL
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const refreshToken = async () => {
  try {
    const oldToken = localStorage.getItem('token');
    if (!oldToken) {
      throw new Error('No token found');
    }

    console.log('Refreshing token...');
    const response = await axios.post('http://127.0.0.1:3000/api/auth/refresh-token', null, {
      headers: {
        'Authorization': `${oldToken}` // Ensure 'Bearer ' prefix if required by your server
      }
    });

    const { token: newToken } = response.data;

    // Update token in localStorage immediately
    localStorage.setItem('token', newToken);

    // Optional: Trigger a state update if using React or similar framework
    // dispatch({ type: 'SET_TOKEN', payload: newToken });
  } catch (error) {
    localStorage.removeItem('token');
  }
};

// Set interval to refresh token every 55 minutes
setInterval(() => {
  refreshToken();
}, 55 * 60 * 1000);

export default axiosInstance;
