import { defineStore } from 'pinia'
import axios from 'axios'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    loading: false,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  }),
  
  actions: {
    async fetchProducts(params = {}) {
      this.loading = true
      try {
        const response = await axios.get('/api/products', { params })
        this.products = response.data.data
        this.pagination = {
          page: response.data.currentPage,
          limit: response.data.limit || 20,
          total: response.data.total,
          pages: response.data.pages
        }
        return { success: true }
      } catch (error) {
        console.error('Erro ao buscar produtos:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },
    
    async createProduct(productData) {
      try {
        console.log('Enviando dados do produto:', productData)
        const response = await axios.post('/api/products', productData)
        console.log('Produto criado com sucesso:', response.data)
        return { success: true, data: response.data.data }
      } catch (error) {
        console.error('Erro ao criar produto:', error)
        console.error('Resposta do backend:', error.response?.data)
        return { 
          success: false, 
          message: error.response?.data?.message || error.message || 'Erro ao criar produto' 
        }
      }
    },
    
    async updateProduct(id, productData) {
      try {
        const response = await axios.put(`/api/products/${id}`, productData)
        return { success: true, data: response.data.data }
      } catch (error) {
        console.error('Erro ao atualizar produto:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || error.message || 'Erro ao atualizar produto' 
        }
      }
    }
  }
})