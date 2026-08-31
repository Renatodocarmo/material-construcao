import { defineStore } from 'pinia'
import axios from 'axios'

export const useSuppliersStore = defineStore('suppliers', {
  state: () => ({
    suppliers: [],
    loading: false,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  }),
  
  actions: {
    async fetchSuppliers(params = {}) {
      this.loading = true
      try {
        const response = await axios.get('/api/suppliers', { params })
        this.suppliers = response.data.data
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
    
    async createSupplier(supplierData) {
      try {
        const response = await axios.post('/api/suppliers', supplierData)
        return { success: true, data: response.data.data }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Erro ao cadastrar fornecedor' }
      }
    },
    
    async updateSupplier(id, supplierData) {
      try {
        const response = await axios.put(`/api/suppliers/${id}`, supplierData)
        return { success: true, data: response.data.data }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Erro ao atualizar fornecedor' }
      }
    }
  }
})