<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">📦 Produtos</h1>
      <button @click="openModal()" class="btn-primary">+ Novo Produto</button>
    </div>
    
    <!-- Busca -->
    <div class="card mb-6">
      <div class="flex gap-4">
        <input 
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          class="input flex-1"
          placeholder="🔍 Buscar por nome, código ou categoria..."
        >
      </div>
    </div>
    
    <!-- Lista -->
    <div class="card">
      <div v-if="productsStore.loading" class="text-center py-12">
        <p class="text-gray-500">Carregando produtos...</p>
      </div>
      
      <div v-else-if="productsStore.products.length === 0" class="text-center py-12 text-gray-500">
        <p class="text-6xl mb-2">📦</p>
        <p>Nenhum produto encontrado.</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Preço</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estoque</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="product in productsStore.products" :key="product._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-mono text-sm text-gray-600">{{ product.codigoInterno }}</td>
              <td class="px-4 py-3 font-semibold text-gray-900">{{ product.nome }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ product.categoriaId?.name || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ product.marcaId?.name || '-' }}</td>
              <td class="px-4 py-3 text-right font-bold">R$ {{ product.precoVenda.toFixed(2) }}</td>
              <td class="px-4 py-3 text-center">{{ product.estoqueAtual }} {{ product.unidade }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="['badge', product.estoqueAtual > product.estoqueMinimo ? 'badge-success' : 'badge-danger']">
                  {{ product.estoqueAtual > product.estoqueMinimo ? 'NORMAL' : 'BAIXO' }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <button @click="openModal(product)" class="text-blue-600 hover:text-blue-800 mr-2" title="Editar">
                  ️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Paginação -->
      <div v-if="productsStore.products.length > 0" class="mt-6 flex justify-between items-center text-sm text-gray-500">
        <p>Mostrando {{ productsStore.products.length }} de {{ productsStore.pagination.total }} produtos</p>
      </div>
    </div>
    
    <!-- Modal de Cadastro/Edição -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">{{ editingProduct ? 'Editar Produto' : 'Novo Produto' }}</h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        
        <form @submit.prevent="saveProduct">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Código Interno *</label>
              <input v-model="form.codigoInterno" type="text" class="input" required placeholder="Ex: CIM001">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
              <input v-model="form.codigoBarras" type="text" class="input" placeholder="7891234567890">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Unidade *</label>
              <select v-model="form.unidade" class="input" required>
                <option value="UN">UN - Unidade</option>
                <option value="SC">SC - Saco</option>
                <option value="KG">KG - Quilograma</option>
                <option value="M">M - Metro</option>
                <option value="M2">M² - Metro Quadrado</option>
                <option value="L">L - Litro</option>
                <option value="CX">CX - Caixa</option>
                <option value="PC">PC - Peça</option>
              </select>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
            <input v-model="form.nome" type="text" class="input" required placeholder="Ex: Cimento CP II 50kg">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea v-model="form.descricao" class="input" rows="3" placeholder="Descrição detalhada do produto..."></textarea>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <input v-model="form.categoria" type="text" class="input" placeholder="Ex: Cimento">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input v-model="form.marca" type="text" class="input" placeholder="Ex: Votorantim">
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Preço de Custo *</label>
              <input v-model.number="form.precoCusto" type="number" step="0.01" class="input" required placeholder="0,00">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Preço de Venda *</label>
              <input v-model.number="form.precoVenda" type="number" step="0.01" class="input" required placeholder="0,00">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Margem de Lucro</label>
              <div class="input bg-gray-100">
                {{ margemLucro }}%
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estoque Atual</label>
              <input v-model.number="form.estoqueAtual" type="number" class="input" placeholder="0">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
              <input v-model.number="form.estoqueMinimo" type="number" class="input" placeholder="10">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estoque Máximo</label>
              <input v-model.number="form.estoqueMaximo" type="number" class="input" placeholder="100">
            </div>
          </div>
          
          <div class="border-t pt-4 mt-4 mb-4">
            <label class="flex items-center">
              <input v-model="form.isActive" type="checkbox" class="rounded">
              <span class="ml-2 text-sm text-gray-700">Produto Ativo (disponível para venda)</span>
            </label>
          </div>
          
          <div class="flex gap-2">
            <button type="submit" :disabled="saving" class="btn-primary flex-1">
              {{ saving ? '💾 Salvando...' : '💾 Salvar Produto' }}
            </button>
            <button type="button" @click="closeModal" class="btn-secondary flex-1">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import Swal from 'sweetalert2'

const productsStore = useProductsStore()
const searchQuery = ref('')
const showModal = ref(false)
const editingProduct = ref(null)
const saving = ref(false)

const form = ref({
  codigoInterno: '',
  codigoBarras: '',
  nome: '',
  descricao: '',
  categoria: '',
  marca: '',
  unidade: 'UN',
  precoCusto: 0,
  precoVenda: 0,
  estoqueAtual: 0,
  estoqueMinimo: 10,
  estoqueMaximo: 0,
  isActive: true
})

const margemLucro = computed(() => {
  if (!form.value.precoCusto || !form.value.precoVenda) return 0
  const margem = ((form.value.precoVenda - form.value.precoCusto) / form.value.precoCusto) * 100
  return margem.toFixed(1)
})

let searchTimeout = null

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    await productsStore.fetchProducts({ search: searchQuery.value })
  }, 400)
}

const openModal = (product = null) => {
  if (product) {
    editingProduct.value = product
    form.value = {
      codigoInterno: product.codigoInterno || '',
      codigoBarras: product.codigoBarras || '',
      nome: product.nome || '',
      descricao: product.descricao || '',
      categoria: product.categoriaId?.name || '',
      marca: product.marcaId?.name || '',
      unidade: product.unidade || 'UN',
      precoCusto: product.precoCusto || 0,
      precoVenda: product.precoVenda || 0,
      estoqueAtual: product.estoqueAtual || 0,
      estoqueMinimo: product.estoqueMinimo || 10,
      estoqueMaximo: product.estoqueMaximo || 0,
      isActive: product.isActive !== false
    }
  } else {
    editingProduct.value = null
    form.value = {
      codigoInterno: '',
      codigoBarras: '',
      nome: '',
      descricao: '',
      categoria: '',
      marca: '',
      unidade: 'UN',
      precoCusto: 0,
      precoVenda: 0,
      estoqueAtual: 0,
      estoqueMinimo: 10,
      estoqueMaximo: 0,
      isActive: true
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
}

const saveProduct = async () => {
  if (!form.value.codigoInterno || !form.value.nome || !form.value.precoCusto || !form.value.precoVenda) {
    Swal.fire('Erro', 'Preencha todos os campos obrigatórios.', 'error')
    return
  }
  
  saving.value = true
  
  const productData = {
    ...form.value,
    categoriaId: null, // Em uma implementação completa, buscaria o ID da categoria
    marcaId: null // Em uma implementação completa, buscaria o ID da marca
  }
  
  let result
  if (editingProduct.value) {
    result = await productsStore.updateProduct(editingProduct.value._id, productData)
  } else {
    result = await productsStore.createProduct(productData)
  }
  
  saving.value = false
  
  if (result.success) {
    Swal.fire({
      icon: 'success',
      title: editingProduct.value ? 'Produto atualizado!' : 'Produto cadastrado!',
      text: form.value.nome,
      timer: 2000,
      showConfirmButton: false
    })
    closeModal()
    await productsStore.fetchProducts({ search: searchQuery.value })
  } else {
    Swal.fire('Erro', result.message, 'error')
  }
}

onMounted(async () => {
  await productsStore.fetchProducts()
})
</script>