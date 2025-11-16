import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken')
      // Redirect to login if needed
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const apiEndpoints = {
  // Health check
  health: () => api.get('/health'),
  
  // Maps
  getMaps: () => api.get('/maps'),
  getMap: (id: string) => api.get(`/maps/${id}`),
  
  // Locations
  getLocations: () => api.get('/locations'),
  getLocation: (id: string) => api.get(`/locations/${id}`),
  
  // Auth (placeholder)
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { email: string; password: string; name: string }) =>
    api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
}

export default api