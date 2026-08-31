import axios from 'axios'

export const searchProducts = async (query) => {
  try {
    const response = await axios.get('/api/products', {
      params: { search: query, limit: 10 }
    })
    return response.data.data
  } catch (error) {
    return []
  }
}