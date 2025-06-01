import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Menu Items
export const getMenuItems = (category) => api.get(`/menu-items?category=${category}`);

// Orders
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getOrders = () => api.get('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const updateOrder = (id, orderData) => api.put(`/orders/${id}`, orderData);

// Clients
export const createClient = (clientData) => api.post('/clients', clientData);
export const getClient = (phone) => api.get(`/clients/${phone}`);
export const updateClient = (phone, clientData) => api.put(`/clients/${phone}`, clientData);

export default api;