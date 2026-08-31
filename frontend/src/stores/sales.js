import { defineStore } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'

export const useSalesStore = defineStore('sales', {
  state: () => ({
    sales: [],
    loading: false,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  }),
  
  actions: {
    async fetchSales(params = {}) {
      this.loading = true
      try {
        const response = await axios.get('/api/sales', { params })
        this.sales = response.data.data
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
    
    async createSale(saleData) {
      try {
        const response = await axios.post('/api/sales', saleData)
        Swal.fire({
          icon: 'success',
          title: 'Venda realizada!',
          text: `Venda #${String(response.data.data.numero).padStart(6, '0')} concluída com sucesso.`,
          timer: 3000,
          showConfirmButton: false
        })
        return { success: true, data: response.data.data }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao criar venda',
          text: error.response?.data?.message || 'Erro desconhecido'
        })
        return { success: false, message: error.response?.data?.message }
      }
    }
  }
})