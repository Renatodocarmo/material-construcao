import { defineStore } from 'pinia'
import axios from 'axios'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: null,
    loading: false
  }),
  
  actions: {
    async fetchSettings() {
      this.loading = true
      try {
        const response = await axios.get('/api/settings')
        this.settings = response.data.data
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },
    
    async updateSettings(settingsData) {
      try {
        const response = await axios.put('/api/settings', settingsData)
        this.settings = response.data.data
        return { success: true, data: response.data.data }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Erro ao atualizar configurações' }
      }
    }
  }
})