import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fos-backend-8xu6.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  registerFarmer: (data) => api.post('/auth/register-farmer', data),
  verifyOTP: (phoneNumber, otp) => api.post('/auth/verify-otp', { phoneNumber, otp }),
  requestOTP: (phoneNumber) => api.post('/auth/request-otp', { phoneNumber }),
  adminLogin: (phoneNumber, otp) => api.post('/auth/admin-login', { phoneNumber, otp })
};

export const farmerAPI = {
  submitOrder: (fertilizerId) => api.post('/farmer/submit-order', { fertilizerId }),
  getMyOrders: () => api.get('/farmer/my-orders'),
  getFertilizers: () => api.get('/farmer/fertilizers'),
  getProfile: () => api.get('/farmer/profile')
};

export const adminAPI = {
  getOrders: (status = '', page = 1) => api.get('/admin/orders', { params: { status, page } }),
  approveOrder: (orderId, remarks = '') => api.post(`/admin/approve-order/${orderId}`, { remarks }),
  declineOrder: (orderId, remarks) => api.post(`/admin/decline-order/${orderId}`, { remarks }),
  getMetrics: () => api.get('/admin/metrics'),
  getFertilizers: () => api.get('/admin/fertilizers'),
  addFertilizer: (data) => api.post('/admin/fertilizers', data),
  updateFertilizer: (fertilizerId, data) => api.put(`/admin/fertilizers/${fertilizerId}`, data)
};

export default api;
