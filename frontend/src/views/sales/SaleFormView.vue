<template>
  <div :class="['pdv-container', { 'pdv-fullscreen': isFullscreen }]">
    <!-- Barra Superior do PDV -->
    <div class="pdv-header bg-gray-800 text-white p-4 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold">🛒 PDV - Ponto de Venda</h1>
        <div v-if="cashStore.isOpen" class="text-sm bg-green-600 px-3 py-1 rounded">
          ✓ Caixa Aberto #{{ cashStore.currentCash?.numero }}
        </div>
        <div v-else class="text-sm bg-red-600 px-3 py-1 rounded">
          ✗ Caixa Fechado
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- Botão Tela Cheia -->
        <button @click="toggleFullscreen" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">
          {{ isFullscreen ? ' Sair da Tela Cheia' : ' Tela Cheia' }}
        </button>
        
        <!-- Botão Limpar -->
        <button @click="clearSale" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm">
          🗑️ Limpar
        </button>
        
        <!-- Botão Finalizar -->
        <button 
          @click="finalizeSale"
          :disabled="items.length === 0 || finalizando"
          class="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 px-6 py-2 rounded text-sm font-bold"
        >
          {{ finalizando ? '⏳ Processando...' : '✓ Finalizar (F2)' }}
        </button>
      </div>
    </div>
    
    <div class="pdv-content flex flex-1 overflow-hidden">
      <!-- Lado Esquerdo: Lista de Itens -->
      <div class="pdv-items flex-1 p-6 overflow-y-auto">
        <div v-if="items.length === 0" class="text-center py-20 text-gray-400">
          <p class="text-8xl mb-4">🛒</p>
          <p class="text-2xl">Nenhum item adicionado</p>
          <p class="text-lg mt-2">Escaneie o código de barras ou digite o nome do produto</p>
        </div>
        
        <div v-else class="space-y-3">
          <div v-for="(item, index) in items" :key="index" class="bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <div class="flex-1">
              <p class="font-bold text-lg">{{ item.nome }}</p>
              <p class="text-sm text-gray-500">{{ item.codigoInterno }} - {{ item.unidade }}</p>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <button @click="decrementQuantity(index)" class="w-10 h-10 rounded bg-gray-200 hover:bg-gray-300 font-bold text-xl">-</button>
                <input 
                  v-model.number="item.quantidade" 
                  @change="updateItemTotal(index)"
                  type="number"
                  min="0.01"
                  step="0.01"
                  class="w-20 text-center text-xl font-bold border-2 border-gray-300 rounded px-2 py-1"
                >
                <button @click="incrementQuantity(index)" class="w-10 h-10 rounded bg-gray-200 hover:bg-gray-300 font-bold text-xl">+</button>
              </div>
              
              <div class="text-right min-w-[120px]">
                <p class="text-sm text-gray-500">R$ {{ item.precoUnitario.toFixed(2) }} un</p>
                <p class="text-2xl font-bold text-blue-600">R$ {{ item.total.toFixed(2) }}</p>
              </div>
              
              <button @click="removeItem(index)" class="text-red-600 hover:text-red-800 text-2xl">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Lado Direito: Busca e Resumo -->
      <div class="pdv-sidebar w-96 bg-gray-100 p-6 flex flex-col">
        <!-- Campo de Busca (Foco Automático) -->
        <div class="mb-6">
          <label class="block text-sm font-bold text-gray-700 mb-2">
            🔍 Buscar Produto (ESC para limpar)
          </label>
          <input 
            ref="searchInput"
            v-model="searchQuery"
            @input="handleSearch"
            @focus="showResults = true"
            @blur="hideResults"
            type="text"
            class="w-full text-xl border-2 border-blue-500 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
            placeholder="Digite ou escaneie..."
            autocomplete="off"
          >
          
          <!-- Resultados da busca -->
          <div v-if="showResults && searchResults.length > 0" class="absolute z-10 w-96 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <div 
              v-for="product in searchResults" 
              :key="product._id"
              @mousedown="selectProduct(product)"
              class="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
            >
              <div class="flex justify-between">
                <div>
                  <p class="font-semibold">{{ product.nome }}</p>
                  <p class="text-sm text-gray-500">{{ product.codigoInterno }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-blue-600">R$ {{ product.precoVenda.toFixed(2) }}</p>
                  <p class="text-xs" :class="product.estoqueAtual > 0 ? 'text-green-600' : 'text-red-600'">
                    Estoque: {{ product.estoqueAtual }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Resumo da Venda -->
        <div class="bg-white rounded-lg shadow p-4 mb-4">
          <h3 class="font-bold text-gray-700 mb-3">📊 Resumo</h3>
          
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Itens:</span>
              <span class="font-bold">{{ items.length }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Subtotal:</span>
              <span class="font-bold">R$ {{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Desconto:</span>
              <input 
                v-model.number="descontoGeral" 
                @change="calculateTotal"
                type="number"
                min="0"
                step="0.01"
                class="w-24 text-right border border-gray-300 rounded px-2 py-1"
              >
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Frete:</span>
              <input 
                v-model.number="frete" 
                @change="calculateTotal"
                type="number"
                min="0"
                step="0.01"
                class="w-24 text-right border border-gray-300 rounded px-2 py-1"
              >
            </div>
          </div>
          
          <div class="border-t-2 border-blue-500 pt-3 mt-3">
            <div class="flex justify-between text-3xl font-bold">
              <span>TOTAL:</span>
              <span class="text-blue-600">R$ {{ total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Forma de Pagamento -->
        <div class="bg-white rounded-lg shadow p-4 flex-1">
          <h3 class="font-bold text-gray-700 mb-3"> Pagamento</h3>
          
          <select v-model="formaPagamento" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg mb-4">
            <option value="DINHEIRO">💵 Dinheiro</option>
            <option value="PIX">📱 PIX</option>
            <option value="DEBITO">💳 Débito</option>
            <option value="CREDITO">💳 Crédito</option>
            <option value="BOLETO">📄 Boleto</option>
            <option value="TRANSFERENCIA">🏦 Transferência</option>
          </select>
          
          <!-- Valor Pago (apenas para dinheiro) -->
          <div v-if="formaPagamento === 'DINHEIRO'" class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-2">Valor Recebido</label>
            <input 
              v-model.number="valorRecebido" 
              @input="calculateTroco"
              type="number"
              min="0"
              step="0.01"
              class="w-full text-2xl border-2 border-green-500 rounded-lg px-4 py-3 text-right font-bold"
              placeholder="0,00"
            >
            <div v-if="valorRecebido > 0" class="mt-2 p-3 bg-green-50 rounded">
              <div class="flex justify-between">
                <span class="font-bold">Troco:</span>
                <span class="font-bold text-green-600 text-xl">R$ {{ troco.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Atalhos de Teclado -->
        <div class="mt-4 p-3 bg-gray-200 rounded text-xs text-gray-600">
          <p class="font-bold mb-1">⌨️ Atalhos:</p>
          <p><b>F2</b> - Finalizar venda</p>
          <p><b>ESC</b> - Limpar busca</p>
          <p><b>F4</b> - Cancelar venda</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useSalesStore } from '@/stores/sales'
import { useCashStore } from '@/stores/cash'
import { searchProducts } from '@/services/productService'
import Swal from 'sweetalert2'
import { playSuccessSound, playErrorSound, playFinalizeSound } from '@/utils/sounds'

const router = useRouter()
const salesStore = useSalesStore()
const cashStore = useCashStore()

const searchInput = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const showResults = ref(false)
const items = ref([])
const descontoGeral = ref(0)
const frete = ref(0)
const formaPagamento = ref('DINHEIRO')
const valorRecebido = ref(0)
const troco = ref(0)
const finalizando = ref(false)
const isFullscreen = ref(false)

let searchTimeout = null
let barcodeBuffer = ''
let lastKeyTime = 0

// Foco automático no campo de busca
onMounted(async () => {
  await cashStore.fetchCurrentCash()
  
  // Focar no input de busca
  await nextTick()
  if (searchInput.value) {
    searchInput.value.focus()
  }
  
  // Listeners de teclado
  document.addEventListener('keypress', handleBarcodeScanner)
  document.addEventListener('keydown', handleKeyboardShortcuts)
})

onUnmounted(() => {
  document.removeEventListener('keypress', handleBarcodeScanner)
  document.removeEventListener('keydown', handleKeyboardShortcuts)
})

// Atalhos de teclado
const handleKeyboardShortcuts = (e) => {
  // F2 - Finalizar venda
  if (e.key === 'F2') {
    e.preventDefault()
    finalizeSale()
  }
  
  // F4 - Cancelar venda
  if (e.key === 'F4') {
    e.preventDefault()
    clearSale()
  }
  
  // ESC - Limpar busca
  if (e.key === 'Escape') {
    e.preventDefault()
    searchQuery.value = ''
    searchResults.value = []
    showResults.value = false
    if (searchInput.value) {
      searchInput.value.focus()
    }
  }
}

// Leitor de código de barras
const handleBarcodeScanner = (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return
  }

  const currentTime = Date.now()
  const timeDiff = currentTime - lastKeyTime
  lastKeyTime = currentTime
  
  if (timeDiff < 100) {
    barcodeBuffer += e.key
    
    if (e.key === 'Enter' && barcodeBuffer.length >= 8) {
      searchProductByBarcode(barcodeBuffer)
      barcodeBuffer = ''
    }
  } else {
    barcodeBuffer = e.key
  }
}

const searchProductByBarcode = async (barcode) => {
  try {
    const response = await axios.get('/api/products', {
      params: { search: barcode }
    })
    
    const products = response.data.data
    if (products.length > 0) {
      selectProduct(products[0])
      playSuccessSound()
    } else {
      playErrorSound()
      Swal.fire({
        icon: 'warning',
        title: 'Produto não encontrado',
        text: `Código: ${barcode}`,
        timer: 2000,
        toast: true,
        position: 'top-end'
      })
    }
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    playErrorSound()
  }
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  
  searchTimeout = setTimeout(async () => {
    searchResults.value = await searchProducts(searchQuery.value)
  }, 300)
}

const hideResults = () => {
  setTimeout(() => {
    showResults.value = false
  }, 200)
}

const selectProduct = (product) => {
  const existingItem = items.value.find(item => item.produtoId === product._id)
  
  if (existingItem) {
    existingItem.quantidade += 1
    updateItemTotal(items.value.indexOf(existingItem))
  } else {
    items.value.push({
      produtoId: product._id,
      codigoInterno: product.codigoInterno,
      nome: product.nome,
      unidade: product.unidade,
      quantidade: 1,
      precoUnitario: product.precoVenda,
      desconto: 0,
      total: product.precoVenda
    })
  }
  
  searchQuery.value = ''
  searchResults.value = []
  showResults.value = false
  
  // Focar novamente no input
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

const incrementQuantity = (index) => {
  items.value[index].quantidade += 1
  updateItemTotal(index)
}

const decrementQuantity = (index) => {
  if (items.value[index].quantidade > 1) {
    items.value[index].quantidade -= 1
    updateItemTotal(index)
  }
}

const updateItemTotal = (index) => {
  const item = items.value[index]
  item.total = (item.quantidade * item.precoUnitario) - item.desconto
  calculateTotal()
}

const removeItem = (index) => {
  items.value.splice(index, 1)
  calculateTotal()
}

const subtotal = computed(() => {
  return items.value.reduce((sum, item) => sum + item.total, 0)
})

const total = computed(() => {
  return subtotal.value - descontoGeral.value + frete.value
})

const calculateTotal = () => {
  if (formaPagamento.value === 'DINHEIRO') {
    calculateTroco()
  }
}

const calculateTroco = () => {
  if (valorRecebido.value >= total.value) {
    troco.value = valorRecebido.value - total.value
  } else {
    troco.value = 0
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const clearSale = () => {
  Swal.fire({
    title: 'Limpar venda?',
    text: 'Todos os itens serão removidos.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sim, limpar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      items.value = []
      descontoGeral.value = 0
      frete.value = 0
      valorRecebido.value = 0
      troco.value = 0
      formaPagamento.value = 'DINHEIRO'
      
      if (searchInput.value) {
        searchInput.value.focus()
      }
    }
  })
}

const finalizeSale = async () => {
  if (items.value.length === 0) {
    Swal.fire('Erro', 'Adicione pelo menos um item.', 'error')
    return
  }
  
  if (formaPagamento.value === 'DINHEIRO' && valorRecebido.value < total.value) {
    Swal.fire('Erro', 'Valor recebido é menor que o total da venda.', 'error')
    return
  }
  
  const result = await Swal.fire({
    title: 'Confirmar venda?',
    html: `
      <div class="text-left">
        <p><strong>Total:</strong> R$ ${total.value.toFixed(2)}</p>
        <p><strong>Itens:</strong> ${items.value.length}</p>
        <p><strong>Pagamento:</strong> ${formaPagamento.value}</p>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: '✓ Confirmar Venda',
    cancelButtonText: 'Cancelar'
  })
  
  if (!result.isConfirmed) return
  
  finalizando.value = true
  
  const saleData = {
    itens: items.value.map(item => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      desconto: item.desconto
    })),
    formaPagamento: formaPagamento.value,
    pagamentos: [{
      forma: formaPagamento.value,
      valor: formaPagamento.value === 'DINHEIRO' ? valorRecebido.value : total.value
    }],
    descontoGeral: descontoGeral.value,
    frete: frete.value
  }
  
  const response = await salesStore.createSale(saleData)
  finalizando.value = false
  
  if (response.success) {
    playFinalizeSound()
    
    const { generateSalePDF } = await import('@/utils/pdfGenerator')
    generateSalePDF(response.data)
    
    items.value = []
    descontoGeral.value = 0
    frete.value = 0
    valorRecebido.value = 0
    troco.value = 0
    searchQuery.value = ''
    
    Swal.fire({
      icon: 'success',
      title: 'Venda finalizada!',
      timer: 2000,
      showConfirmButton: false
    })
    
    if (searchInput.value) {
      searchInput.value.focus()
    }
  }
}
</script>

<style scoped>
.pdv-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
}

.pdv-fullscreen {
  height: 100vh;
}

.pdv-content {
  flex: 1;
  overflow: hidden;
}

.pdv-items {
  background: #f3f4f6;
}

.pdv-sidebar {
  border-left: 2px solid #e5e7eb;
}
</style>