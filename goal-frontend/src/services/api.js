import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──
export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)

// ── Goals ──
export const getGoals = () => api.get('/goals')
export const getGoal = (id) => api.get(`/goals/${id}`)
export const createGoal = (data) => api.post('/goals', data)
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data)
export const deleteGoal = (id) => api.delete(`/goals/${id}`)
export const updateProgress = (id, progress) => api.patch(`/goals/${id}/progress`, { progress })
export const getStats = () => api.get('/goals/stats')
export const getOverdueGoals = () => api.get('/goals/overdue')
export const getUpcomingGoals = () => api.get('/goals/upcoming')

export default api
