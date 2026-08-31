import { defineStore } from 'pinia'
import axios from 'axios'

export const useCustomersStore = defineStore('customers', {
  state: () => ({
    customers: [],
    loading: false,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  }),
  
  actions: {
    async fetchCustomers(params = {}) {
      this.loading = true
      try {
        const response = await axios.get('/api/customers', { params })
        this.customers = response.data.data
        this.pagination = {
          page: response.data.currentPage,
          limit: response.data.limit || 20,
          total: response.data.total,
          pages: response.data.pages
        }
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },
    
    async createCustomer(customerData) {
      try {
        const response = await axios.post('/api/customers', customerData)
        return { success: true, data: response.data.data }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Erro ao cadastrar cliente' }
      }
    },
    
    async updateCustomer(id, customerData) {
      try {
        const response = await axios.put(`/api/customers/${id}`, customerData)
        return { success: true, data: response.data.data }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Erro ao atualizar cliente' }
      }
    }
  }
})