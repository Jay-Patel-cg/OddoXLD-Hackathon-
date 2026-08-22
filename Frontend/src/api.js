const BASE_URL = 'http://localhost:5000/api';

/**
 * Unified native fetch helper for Musafir Buddy backend API calls
 */
export const apiFetch = async (endpoint, options = {}) => {
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
      const error = new Error(data.message || `API request failed with status ${res.status}`);
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

/* Authentication API Functions */
export const loginUser = (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const registerUser = (userData) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
export const googleLoginUser = (credentialToken) => apiFetch('/auth/google', { method: 'POST', body: JSON.stringify({ credential: credentialToken }) });
export const getMeUser = () => apiFetch('/auth/me');

/* Trip API Functions */
export const getTrips = () => apiFetch('/trips');
export const getTripById = (id) => apiFetch(`/trips/${id}`);
export const createTrip = (tripData) => apiFetch('/trips', { method: 'POST', body: JSON.stringify(tripData) });
export const updateTrip = (id, tripData) => apiFetch(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(tripData) });
export const deleteTrip = (id) => apiFetch(`/trips/${id}`, { method: 'DELETE' });

/* Destination API Functions */
export const getDestinations = (searchQuery = '') => {
  const url = searchQuery ? `/destinations?search=${encodeURIComponent(searchQuery)}` : '/destinations';
  return apiFetch(url);
};
export const getDestinationById = (id) => apiFetch(`/destinations/${id}`);

/* Multi-City Trip Stops API Functions */
export const getTripStops = (tripId) => apiFetch(`/trips/${tripId}/stops`);
export const addTripStop = (tripId, stopData) => apiFetch(`/trips/${tripId}/stops`, { method: 'POST', body: JSON.stringify(stopData) });
export const updateTripStop = (tripId, stopId, stopData) => apiFetch(`/trips/${tripId}/stops/${stopId}`, { method: 'PUT', body: JSON.stringify(stopData) });
export const deleteTripStop = (tripId, stopId) => apiFetch(`/trips/${tripId}/stops/${stopId}`, { method: 'DELETE' });
export const reorderTripStops = (tripId, stopOrders) => apiFetch(`/trips/${tripId}/stops/reorder`, { method: 'PUT', body: JSON.stringify({ stopOrders }) });

/* Activities API Functions */
export const getActivities = (tripId) => apiFetch(`/trips/${tripId}/activities`);
export const addActivity = (tripId, activityData) => apiFetch(`/trips/${tripId}/activities`, { method: 'POST', body: JSON.stringify(activityData) });
export const updateActivity = (tripId, activityId, activityData) => apiFetch(`/trips/${tripId}/activities/${activityId}`, { method: 'PUT', body: JSON.stringify(activityData) });
export const deleteActivity = (tripId, activityId) => apiFetch(`/trips/${tripId}/activities/${activityId}`, { method: 'DELETE' });

/* Expense & Budget API Functions */
export const getExpenses = (tripId) => apiFetch(`/trips/${tripId}/expenses`);
export const getExpenseSummary = (tripId) => apiFetch(`/trips/${tripId}/expenses/summary`);
export const addExpense = (tripId, expenseData) => apiFetch(`/trips/${tripId}/expenses`, { method: 'POST', body: JSON.stringify(expenseData) });
export const updateExpense = (tripId, expenseId, expenseData) => apiFetch(`/trips/${tripId}/expenses/${expenseId}`, { method: 'PUT', body: JSON.stringify(expenseData) });
export const deleteExpense = (tripId, expenseId) => apiFetch(`/trips/${tripId}/expenses/${expenseId}`, { method: 'DELETE' });

/* Gemini AI Planner & Assistant API Functions */
export const generateTripPlan = (params) => apiFetch('/ai/trip-plan/generate', { method: 'POST', body: JSON.stringify(params) });
export const saveTripPlan = (planPayload) => apiFetch('/ai/trip-plan/save', { method: 'POST', body: JSON.stringify(planPayload) });
export const askCopilot = (payload) => apiFetch('/ai/assistant', { method: 'POST', body: JSON.stringify(payload) });
export const askAssistant = askCopilot;

