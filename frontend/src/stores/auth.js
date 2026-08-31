import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMINISTRADOR'
  },
  
  actions: {
    async login(email, password) {
      try {
        const response = await axios.post('/api/auth/login', { email, password })
        this.token = response.data.data.token
        this.user = response.data.data
        localStorage.setItem('token', this.token)
        
        // Configurar token globalmente no axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        
        return { success: true }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Erro ao fazer login' }
      }
    },
    
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },
    
    async checkAuth() {
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        try {
          const response = await axios.get('/api/auth/me')
          this.user = response.data.data
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error)
          // Não faz logout automático, só loga o erro
        }
      }
    }
  }
})