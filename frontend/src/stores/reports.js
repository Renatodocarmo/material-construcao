import { defineStore } from 'pinia'
import axios from 'axios'

export const useReportsStore = defineStore('reports', {
  state: () => ({
    inventory: null,
    financial: null,
    customers: null,
    loading: false
  }),
  
  actions: {
    async fetchInventoryReport() {
      this.loading = true
      try {
        const response = await axios.get('/api/reports/inventory')
        this.inventory = response.data.data
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },
    
    async fetchFinancialReport(params = {}) {
      this.loading = true
      try {
        const response = await axios.get('/api/reports/financial', { params })
        this.financial = response.data.data
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },
    
    async fetchCustomersReport() {
      this.loading = true
      try {
        const response = await axios.get('/api/reports/customers')
        this.customers = response.data.data
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    }
  }
})