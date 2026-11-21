/**
 * Centralized API Client for Adelux Sports Club Management System
 * Connects frontend to all backend APIs (Auth, Sports, Bookings, Walk-ins, Call Logs, Staff, Schedules, Daily Activities, Super Admin)
 */

const API_BASE = '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { success: false, message: response.statusText };
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    error.errors = data.errors || [];
    throw error;
  }

  return data;
}

export const api = {
  // Authentication API
  auth: {
    login: async (credentials) => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      return res;
    },
    register: async (userData) => {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      return res;
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return request('/api/auth/logout', { method: 'POST' }).catch(() => {});
    },
    getUser: () => {
      const user = localStorage.getItem('user');
      try {
        return user ? JSON.parse(user) : null;
      } catch {
        return null;
      }
    },
    getToken: () => localStorage.getItem('token'),
  },

  // Sports & Court Configurations API
  sports: {
    getSports: () => request('/api/sports'),
    getSlots: (sport, date) => {
      const qs = new URLSearchParams({ sport, date }).toString();
      return request(`/api/sports/slots?${qs}`);
    },
    getPricing: (sport) => {
      const qs = sport ? `?sport=${encodeURIComponent(sport)}` : '';
      return request(`/api/sports/pricing${qs}`);
    },
  },

  // Court Bookings API
  bookings: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
      ).toString();
      return request(`/api/bookings${qs ? `?${qs}` : ''}`);
    },
    getMyBookings: () => request('/api/bookings/my-bookings'),
    getById: (id) => request(`/api/bookings/${id}`),
    createHold: (data) =>
      request('/api/bookings/hold', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    confirmHold: (data) =>
      request('/api/bookings/confirm', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    releaseHold: (id) =>
      request(`/api/bookings/hold/${id}`, {
        method: 'DELETE',
      }),
    cancel: (id) =>
      request(`/api/bookings/${id}/cancel`, {
        method: 'POST',
      }),
  },

  // Walk-ins Module API
  walkins: {
    register: (data) =>
      request('/walkins/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAll: (params = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
      ).toString();
      return request(`/walkins${qs ? `?${qs}` : ''}`);
    },
    getByPhone: (phone) => request(`/walkins/${phone}`),
    getStats: () => request('/walkins/stats'),
  },

  // Call Logs Module API
  callLogs: {
    create: (data) =>
      request('/call-logs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAll: (params = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
      ).toString();
      return request(`/call-logs${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/call-logs/${id}`),
  },

  // Staff Management API
  staff: {
    getAll: () => request('/staff'),
    getById: (id) => request(`/staff/${id}`),
  },

  // Staff Schedule Module API
  schedules: {
    create: (data) =>
      request('/schedules', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAll: (params = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
      ).toString();
      return request(`/schedules${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/schedules/${id}`),
    update: (id, data) =>
      request(`/schedules/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/schedules/${id}`, {
        method: 'DELETE',
      }),
  },

  // Daily Activities API
  dailyActivities: {
    get: (date) => request(`/daily-activities${date ? `?date=${date}` : ''}`),
  },

  // Contact / Message Inquiries (Logged as incoming inquiry in Call Logs)
  contact: {
    sendMessage: async ({ name, email, phone, subject, message }) => {
      // Ensure phone is 10 digits
      let sanitizedPhone = String(phone || '').replace(/\D/g, '');
      if (sanitizedPhone.length < 10) {
        sanitizedPhone = '9876543210'; // Default valid fallback if missing
      } else if (sanitizedPhone.length > 10) {
        sanitizedPhone = sanitizedPhone.slice(-10);
      }
      return request('/call-logs', {
        method: 'POST',
        body: JSON.stringify({
          callerName: name || 'Website Visitor',
          phone: sanitizedPhone,
          callType: 'INCOMING',
          purpose: subject ? `Contact Form: ${subject}` : 'Website General Inquiry',
          notes: `Email: ${email || 'N/A'}\nMessage: ${message || 'No additional details provided'}`,
        }),
      });
    },
  },

  // Super Admin API
  superAdmin: {
    getOverview: () => request('/api/super-admin/overview'),
    getModels: () => request('/api/super-admin/models'),
    getModelData: (model, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/api/super-admin/data/${model}${qs ? `?${qs}` : ''}`);
    },
  },

  // System Health
  health: () => request('/api/health'),
};

export default api;
