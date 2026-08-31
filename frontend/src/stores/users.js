import { defineStore } from 'pinia'
import axios from 'axios'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    roles: [],
    loading: false
  }),
  
  actions: {
    async fetchUsers() {
      this.loading = true
      try {
        const response = await axios.get('/api/users')
        this.users = response.data.data
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },
    
    async fetchRoles() {
      try {
        const response = await axios.get('/api/users/roles')
        this.roles = response.data.data
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },
    
    async createUser(userData) {
      try {
        const response = await axios.post('/api/users', userData)
        return { success: true, data: response.data.data }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Erro ao criar usuário' }
      }
    },
    
    async updateUser(id, userData) {
      try {
        const response = await axios.put(`/api/users/${id}`, userData)
        return { success: true, data: response.data.data }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Erro ao atualizar usuário' }
      }
    },
    
    async deleteUser(id) {
      try {
        await axios.delete(`/api/users/${id}`)
        return { success: true }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Erro ao desativar usuário' }
      }
    },

    // Exclusão permanente do banco de dados
    async deleteUserPermanent(id) {
      try {
        await axios.delete(`/api/users/${id}/permanent`)
        return { success: true }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Erro ao excluir usuário permanentemente' }
      }
    }
  }
})