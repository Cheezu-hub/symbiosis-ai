import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('symbiotech_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('symbiotech_token');
      localStorage.removeItem('symbiotech_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Waste APIs
export const wasteAPI = {
  getAll: () => api.get('/waste'),
  getById: (id) => api.get(`/waste/${id}`),
  create: (data) => api.post('/waste', data),
  update: (id, data) => api.put(`/waste/${id}`, data),
  delete: (id) => api.delete(`/waste/${id}`),
  search: (query) => api.get(`/waste/search?q=${query}`),
};

// Resource APIs
export const resourceAPI = {
  getAll: () => api.get('/resources'),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
  search: (query) => api.get(`/resources/search?q=${query}`),
};

// Match APIs
export const matchAPI = {
  getAll: () => api.get('/matches'),
  getById: (id) => api.get(`/matches/${id}`),
  accept: (id) => api.post(`/matches/${id}/accept`),
  reject: (id) => api.post(`/matches/${id}/reject`),
  getRecommendations: () => api.get('/matches/recommendations'),
};

// Impact APIs
export const impactAPI = {
  getMetrics: () => api.get('/impact/metrics'),
  getReport: (period) => api.get(`/impact/report?period=${period}`),
  calculate: (data) => api.post('/impact/calculate', data),
  getSustainabilityScore: () => api.get('/impact/sustainability-score'),
};

// Industry APIs
export const industryAPI = {
  getAll: () => api.get('/industries'),
  getById: (id) => api.get(`/industries/${id}`),
  getNetwork: () => api.get('/industries/network'),
  update: (id, data) => api.put(`/industries/${id}`, data),
};

// AI APIs
export const aiAPI = {
  getRecommendations: (wasteType) => api.get(`/ai/recommend/${encodeURIComponent(wasteType)}`),
  getSmartMatches: (wasteId) => api.get(`/ai/smart-match/${wasteId}`),
  getMatchScore: (wasteId, resourceId) => api.get(`/ai/match-score/${wasteId}/${resourceId}`),
  getOpportunities: (limit = 10) => api.get(`/ai/opportunities?limit=${limit}`),
  estimateImpact: (data) => api.post('/ai/impact-estimate', data),
  // ─── Trade Recommendation APIs ──────────────────────────────────────────
  getTradeRecommendations: (role = 'both', limit = 20) => api.get(`/ai/trade-recommendations?role=${role}&limit=${limit}`),
  getTradeScore: (wasteId, resourceId) => api.get(`/ai/trade-score/${wasteId}/${resourceId}`),
  getMatchPreview: (data) => api.post('/ai/match-preview', data),
  // ─── Run the full AI matching pass and persist results to DB ────────────
  runMatching: () => api.post('/ai/run-matching'),
  // ─── Personalized Demand-Driven Recommendations ─────────────────────────
  // Supply = all available waste from other companies
  // Demand = only the current user's own active resource requests
  getPersonalizedRecommendations: (topPerRequest = 5, minScore = 25) =>
    api.get(`/ai/personalized-recommendations?topPerRequest=${topPerRequest}&minScore=${minScore}`),
};

// Trade Requests APIs
export const tradeAPI = {
  getAll: (direction = 'all') => api.get(`/trade-requests?direction=${direction}`),
  getById: (id) => api.get(`/trade-requests/${id}`),
  create: (data) => api.post('/trade-requests', data),
  accept: (id) => api.post(`/trade-requests/${id}/accept`),
  reject: (id, reason) => api.post(`/trade-requests/${id}/reject`, { reason }),
};

// Transactions APIs
export const transactionAPI = {
  getAll: (role = 'all', limit = 50) => api.get(`/transactions?role=${role}&limit=${limit}`),
  getDashboard: () => api.get('/transactions/dashboard'),
  getById: (id) => api.get(`/transactions/${id}`),
};

// Notifications APIs
export const notificationAPI = {
  getAll: (limit = 50) => api.get(`/notifications?limit=${limit}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Finance APIs
export const financeAPI = {
  getDashboard: () => api.get('/finance/dashboard'),
  calculate: (data) => api.post('/finance/calculate', data),
  getVendorComparison: () => api.get('/finance/vendor-comparison'),
  getPlatformStats: () => api.get('/finance/platform-stats'),
};

export default api;