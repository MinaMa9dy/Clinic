import axios from 'axios';

const api = axios.create({
  baseURL: 'https://myclinicbe.runasp.net/api',
  // baseURL: 'https://localhost:7219/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Track whether we are currently refreshing to avoid infinite loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already tried to refresh on this request
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');
      const expiredToken = localStorage.getItem('token');

      // If no refresh token stored, go straight to login
      if (!refreshToken || !expiredToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('doctor');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // If already refreshing, queue this request until the refresh completes
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the backend refresh endpoint
        const response = await axios.post(
          `${api.defaults.baseURL}/Auth/RefreshToken`,
          { token: expiredToken, refreshToken }
        );

        const newToken = response.data.token;
        const newRefreshToken = response.data.refreshToken;

        // Store the new tokens
        localStorage.setItem('token', newToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Update doctor info if fullName/email changed
        const doctorStr = localStorage.getItem('doctor');
        if (doctorStr && response.data.fullName) {
          const doctor = JSON.parse(doctorStr);
          doctor.fullName = response.data.fullName;
          doctor.email = response.data.email;
          localStorage.setItem('doctor', JSON.stringify(doctor));
        }

        // Process any requests that were queued while refreshing
        processQueue(null, newToken);

        // Retry the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear everything and redirect to login
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('doctor');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 403 Forbidden — role mismatch, go to login
    if (error.response && error.response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('doctor');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Backend returns Result<T> with isSuccess on error status codes
    if (error.response && error.response.data && typeof error.response.data.isSuccess !== 'undefined') {
      return Promise.resolve(error.response);
    }

    if (error.response && error.response.data && error.response.data.message) {
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  }
);

export default api;
