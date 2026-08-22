const BASE_URL = 'http://localhost:5000/api';

/**
 * Helper to perform HTTP fetch requests with JSON parsing and token injection
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
      const error = new Error(data.message || 'API request failed');
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (!err.status) {
      err.message = err.message || 'Network error connecting to backend server';
    }
    throw err;
  }
};

/* Authentication Endpoints */
export const authAPI = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me')
};

/* Trip Endpoints */
export const tripsAPI = {
  getTrips: () => request('/trips'),
  getTripById: (id) => request(`/trips/${id}`),
  createTrip: (tripData) => request('/trips', { method: 'POST', body: JSON.stringify(tripData) }),
  updateTrip: (id, tripData) => request(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(tripData) }),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' })
};

/* Trip Stop Endpoints */
export const stopsAPI = {
  getStops: (tripId) => request(`/trips/${tripId}/stops`),
  addStop: (tripId, stopData) => request(`/trips/${tripId}/stops`, { method: 'POST', body: JSON.stringify(stopData) }),
  updateStop: (tripId, stopId, stopData) => request(`/trips/${tripId}/stops/${stopId}`, { method: 'PUT', body: JSON.stringify(stopData) }),
  deleteStop: (tripId, stopId) => request(`/trips/${tripId}/stops/${stopId}`, { method: 'DELETE' }),
  reorderStops: (tripId, stopOrders) => request(`/trips/${tripId}/stops/reorder`, { method: 'PUT', body: JSON.stringify({ stopOrders }) })
};

/* Activity Endpoints */
export const activitiesAPI = {
  getActivities: (tripId) => request(`/trips/${tripId}/activities`),
  addActivity: (tripId, activityData) => request(`/trips/${tripId}/activities`, { method: 'POST', body: JSON.stringify(activityData) }),
  updateActivity: (tripId, activityId, activityData) => request(`/trips/${tripId}/activities/${activityId}`, { method: 'PUT', body: JSON.stringify(activityData) }),
  deleteActivity: (tripId, activityId) => request(`/trips/${tripId}/activities/${activityId}`, { method: 'DELETE' })
};

/* Expense Endpoints */
export const expensesAPI = {
  getExpenses: (tripId) => request(`/trips/${tripId}/expenses`),
  getExpenseSummary: (tripId) => request(`/trips/${tripId}/expenses/summary`),
  addExpense: (tripId, expenseData) => request(`/trips/${tripId}/expenses`, { method: 'POST', body: JSON.stringify(expenseData) }),
  updateExpense: (tripId, expenseId, expenseData) => request(`/trips/${tripId}/expenses/${expenseId}`, { method: 'PUT', body: JSON.stringify(expenseData) }),
  deleteExpense: (tripId, expenseId) => request(`/trips/${tripId}/expenses/${expenseId}`, { method: 'DELETE' })
};

/* Destination Discovery Endpoints */
export const destinationsAPI = {
  getDestinations: () => request('/destinations'),
  getDestinationById: (id) => request(`/destinations/${id}`),
  searchDestinations: (q) => request(`/destinations?search=${encodeURIComponent(q)}`)
};

/* Gemini AI Service Endpoints */
export const aiAPI = {
  generateTripPlan: (params) => request('/ai/trip-plan/generate', { method: 'POST', body: JSON.stringify(params) }),
  saveTripPlan: (planPayload) => request('/ai/trip-plan/save', { method: 'POST', body: JSON.stringify(planPayload) }),
  askAssistant: (payload) => request('/ai/assistant', { method: 'POST', body: JSON.stringify(payload) })
};
