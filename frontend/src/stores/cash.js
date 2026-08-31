import { defineStore } from 'pinia'
import axios from 'axios'

export const useCashStore = defineStore('cash', {
  state: () => ({
    currentCash: null,
    loading: false
  }),
  
  getters: {
    isOpen: (state) => state.currentCash?.status === 'ABERTO'
  },
  
  actions: {
    async fetchCurrentCash() {
      this.loading = true
      try {
        const response = await axios.get('/api/cash/current')
        this.currentCash = response.data.data.caixa
        return { success: true }
      } catch (error) {
        this.currentCash = null
        return { success: false }
      } finally {
        this.loading = false
      }
    },
    
    async openCash(valorAbertura) {
      try {
        const response = await axios.post('/api/cash/open', { valorAbertura })
        this.currentCash = response.data.data
        return { success: true }
      } catch (error) {
        return { success: false, message: error.response?.data?.message }
      }
    }
  }
})