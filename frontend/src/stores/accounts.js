import { defineStore } from 'pinia'
import axios from 'axios'

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    receivables: [],
    payables: [],
    loading: false
  }),
  
  actions: {
    async fetchReceivables(params = {}) {
      this.loading = true
      try {
        const response = await axios.get('/api/accounts/receivable', { params })
        this.receivables = response.data.data
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },
    
    async fetchPayables(params = {}) {
      this.loading = true
      try {
        const response = await axios.get('/api/accounts/payable', { params })
        this.payables = response.data.data
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },
    
    async createReceivable(data) {
      try {
        const response = await axios.post('/api/accounts/receivable', data)
        return { success: true, data: response.data.data }
      } catch (error) {
        return { success: false, message: error.response?.data?.message }
      }
    },
    
    async createPayable(data) {
      try {
        const response = await axios.post('/api/accounts/payable', data)
        return { success: true, data: response.data.data }
      } catch (error) {
        return { success: false, message: error.response?.data?.message }
      }
    },
    
    async payAccount(type, id, paymentData) {
      try {
        const response = await axios.put(`/api/accounts/${type}/${id}/pay`, paymentData)
        return { success: true, data: response.data.data }
      } catch (error) {
        return { success: false, message: error.response?.data?.message }
      }
    }
  }
})