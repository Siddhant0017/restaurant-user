import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Menu Items
export const getMenuItems = async (category) => {
  try {
    const response = await api.get(`/menu-items?category=${category}`);
    console.log('Menu items response:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
};

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