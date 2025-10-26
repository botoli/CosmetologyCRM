const BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Authentication
  login: `${BASE_URL}/auth/login`,
  adminLogin: `${BASE_URL}/auth/admin-login`,
  register: `${BASE_URL}/auth/register`,
  logout: `${BASE_URL}/auth/logout`,
  me: `${BASE_URL}/auth/me`,

  // Bookings
  createBooking: `${BASE_URL}/bookings`,
  getUserBookings: `${BASE_URL}/bookings/my`,
  getAllBookings: `${BASE_URL}/bookings`,
  getBookingById: (id: string) => `${BASE_URL}/bookings/${id}`,
  updateBooking: (id: string) => `${BASE_URL}/bookings/${id}`,
  cancelBooking: (id: string) => `${BASE_URL}/bookings/${id}`,

  // Services
  getServices: `${BASE_URL}/services`,
  createService: `${BASE_URL}/services`,
  updateService: (id: string) => `${BASE_URL}/services/${id}`,
  deleteService: (id: string) => `${BASE_URL}/services/${id}`,
  toggleService: (id: string) => `${BASE_URL}/services/${id}/toggle`,

  // Clients
  getClients: `${BASE_URL}/clients`,
  getClientById: (id: string) => `${BASE_URL}/clients/${id}`,
  updateClient: (id: string) => `${BASE_URL}/clients/${id}`,
  getClientHistory: (id: string) => `${BASE_URL}/clients/${id}/history`,

  // Telegram
  linkTelegram: `${BASE_URL}/telegram/link`,
  unlinkTelegram: `${BASE_URL}/telegram/unlink`,
  sendNotification: `${BASE_URL}/telegram/notify`,
  checkLink: (code: string) => `${BASE_URL}/telegram/check-link/${code}`,

  // Health check
  health: `${BASE_URL}/health`,
};

export default API_ENDPOINTS;
