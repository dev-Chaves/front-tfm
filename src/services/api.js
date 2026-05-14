const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';
const TOKEN_KEY = 'tfm_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const isAuthenticated = () => !!getToken();

export const getAuthUrl = () => `${API_URL}/auth/login`;

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    removeToken();
    // Emite evento para que componentes possam reagir gracefulmente
    window.dispatchEvent(new CustomEvent('tfm:sessionExpired', {
      detail: { message: 'Sessão expirada. Por favor, faça login novamente.' }
    }));
    throw new Error('Session expired');
  }

  return response;
};

export const api = {
  getWorkouts: async (page = 1, limit = 30, { startDate, endDate } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await fetchWithAuth(`/workouts?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch workouts');
    return response.json();
  },

  getActivities: async (page = 1, limit = 30) => {
    const response = await fetchWithAuth(`/activities?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  syncActivities: async () => {
    const response = await fetchWithAuth('/activities/sync', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to sync activities');
    return response.json();
  },

  generateWorkoutPlan: async (options) => {
    const params = new URLSearchParams();
    if (options?.currentPace) params.append('currentPace', options.currentPace);
    if (options?.targetPace) params.append('targetPace', options.targetPace);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchWithAuth(`/ai/workout${query}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Falha ao gerar plano de treino');
    }
    return response.json();
  },

  saveWorkoutPlan: async (plan) => {
    const response = await fetchWithAuth('/workouts', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
    if (!response.ok) throw new Error('Failed to save workout plan');
    return response.json();
  },

  getOnboardingStatus: async () => {
    const response = await fetchWithAuth('/users/onboarding');
    if (!response.ok) throw new Error('Failed to get onboarding status');
    return response.json();
  },

  updateGoal: async (goal) => {
    const response = await fetchWithAuth('/users/goal', {
      method: 'PATCH',
      body: JSON.stringify(goal),
    });
    if (!response.ok) throw new Error('Failed to update goal');
    return response.json();
  },
};

export default api;
