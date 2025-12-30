import axios from 'axios';

// Create Axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const userDataString = localStorage.getItem('rideconnect_current_user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData?.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear user data and redirect to login
      localStorage.removeItem('rideconnect_current_user');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH API ============

export interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// ============ RIDES API ============

export interface RideFilters {
  source: string;
  destination: string;
  date?: string;
  minPrice?: number;
}

export const postRide = async (rideData: any) => {
  const response = await api.post('/rides/post', rideData);
  return response.data;
};

export const searchRides = async (filters: RideFilters) => {
  const params = new URLSearchParams();
  params.append('source', filters.source);
  params.append('destination', filters.destination);
  if (filters.date) params.append('date', filters.date);
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  
  const response = await api.get(`/rides/search?${params.toString()}`);
  return response.data;
};

export const getAllRides = async () => {
  const response = await api.get('/rides/all');
  return response.data;
};

export const getMyRides = async () => {
  const response = await api.get('/rides/my-rides');
  return response.data;
};

export const cancelRide = async (id: number) => {
  const response = await api.put(`/rides/${id}/cancel`);
  return response.data;
};

// ============ BOOKINGS API ============

export const bookRide = async (rideId: number, seats: number) => {
  const response = await api.post(`/bookings/book?rideId=${rideId}&seats=${seats}`);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get('/bookings/my-bookings');
  return response.data;
};

export const cancelBooking = async (id: number) => {
  const response = await api.put(`/bookings/${id}/cancel`);
  return response.data;
};

// ============ PAYMENTS API ============

export const createOrder = async (bookingId: number) => {
  const response = await api.post('/payments/create-order', { bookingId });
  return response.data;
};

export const verifyPayment = async (data: any) => {
  const response = await api.post('/payments/verify', data);
  return response.data;
};

export const getTransactionHistory = async () => {
  const response = await api.get('/payments/history');
  return response.data;
};

// ============ USER API ============

export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.put('/users/profile', data);
  return response.data;
};

// Export the axios instance for custom requests
export default api;
