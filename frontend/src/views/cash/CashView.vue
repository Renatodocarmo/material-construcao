<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Controle de Caixa</h1>
    </div>
    
    <div class="mb-6">
      <div v-if="!cashStore.isOpen" class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-bold text-yellow-800">Caixa Fechado</p>
            <p class="text-sm text-yellow-700">Abra o caixa para iniciar as vendas do dia.</p>
          </div>
          <button @click="showOpenModal = true" class="btn-primary">Abrir Caixa</button>
        </div>
      </div>
      
      <div v-else class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-bold text-green-800">Caixa Aberto #{{ cashStore.currentCash?.numero }}</p>
            <p class="text-sm text-green-700">Aberto em {{ formatDate(cashStore.currentCash?.dataAbertura) }}</p>
          </div>
          <button @click="showCloseModal = true" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Fechar Caixa</button>
        </div>
      </div>
    </div>
    
    <div v-if="cashStore.isOpen" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-500 mb-1">Valor Abertura</p>
        <p class="text-2xl font-bold text-gray-800">R$ {{ cashStore.currentCash?.valorAbertura.toFixed(2) || '0,00' }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-500 mb-1">Total Vendas</p>
        <p class="text-2xl font-bold text-green-600">R$ {{ cashStore.currentCash?.totalVendas.toFixed(2) || '0,00' }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-500 mb-1">Entradas</p>
        <p class="text-2xl font-bold text-blue-600">R$ {{ cashStore.currentCash?.totalEntradas.toFixed(2) || '0,00' }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-500 mb-1">Saídas</p>
        <p class="text-2xl font-bold text-red-600">R$ {{ cashStore.currentCash?.totalSaidas.toFixed(2) || '0,00' }}</p>
      </div>
    </div>
    
    <div v-if="cashStore.isOpen" class="card">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Movimentações do Caixa</h2>
        <div class="flex gap-2">
          <button @click="showMovementModal = true" class="btn-primary text-sm">+ Movimentação</button>
          <button @click="showSangriaModal = true" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm">Sangria</button>
        </div>
      </div>
      
      <div v-if="movimentacoes.length === 0" class="text-center py-8 text-gray-400">
        <p>Nenhuma movimentação registrada.</p>
      </div>
      
      <div v-else class="space-y-2">
        <div v-for="mov in movimentacoes" :key="mov._id" class="flex justify-between items-center p-3 bg-gray-50 rounded">
          <div>
            <p class="font-semibold">{{ mov.descricao }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(mov.createdAt) }}</p>
          </div>
          <div class="text-right">
            <p :class="['font-bold text-lg', mov.tipo === 'VENDA' || mov.tipo === 'ENTRADA' || mov.tipo === 'SUPRIMENTO' ? 'text-green-600' : 'text-red-600']">
              {{ mov.tipo === 'VENDA' || mov.tipo === 'ENTRADA' || mov.tipo === 'SUPRIMENTO' ? '+' : '-' }} R$ {{ mov.valor.toFixed(2) }}
            </p>
            <span class="text-xs text-gray-500">{{ mov.tipo }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showOpenModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">Abrir Caixa</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Valor de Abertura</label>
          <input v-model="valorAbertura" type="number" step="0.01" class="input" placeholder="0,00">
        </div>
        <div class="flex gap-2">
          <button @click="openCash" class="btn-primary flex-1">Confirmar</button>
          <button @click="showOpenModal = false" class="btn-secondary flex-1">Cancelar</button>
        </div>
      </div>
    </div>
    
    <div v-if="showCloseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">Fechar Caixa</h2>
        <div class="bg-gray-50 p-4 rounded mb-4">
          <div class="flex justify-between">
            <span class="text-gray-600">Valor Esperado:</span>
            <span class="font-bold">R$ {{ valorEsperado.toFixed(2) }}</span>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Valor Informado (Contado)</label>
          <input v-model="valorInformado" type="number" step="0.01" class="input" placeholder="0,00">
        </div>
        <div class="flex gap-2">
          <button @click="closeCash" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex-1">Confirmar</button>
          <button @click="showCloseModal = false" class="btn-secondary flex-1">Cancelar</button>
        </div>
      </div>
    </div>
    
    <div v-if="showMovementModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">Nova Movimentação</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
          <select v-model="movTipo" class="input">
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
            <option value="SUPRIMENTO">Suprimento</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
          <input v-model="movDescricao" type="text" class="input" placeholder="Descrição">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Valor</label>
          <input v-model.number="movValor" type="number" step="0.01" class="input" placeholder="0,00">
        </div>
        <div class="flex gap-2">
          <button @click="registerMovement" class="btn-primary flex-1">Registrar</button>
          <button @click="showMovementModal = false" class="btn-secondary flex-1">Cancelar</button>
        </div>
      </div>
    </div>
    
    <div v-if="showSangriaModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">Sangria</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
          <input v-model="sangriaDescricao" type="text" class="input" placeholder="Motivo">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Valor</label>
          <input v-model.number="sangriaValor" type="number" step="0.01" class="input" placeholder="0,00">
        </div>
        <div class="flex gap-2">
          <button @click="registerSangria" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex-1">Confirmar</button>
          <button @click="showSangriaModal = false" class="btn-secondary flex-1">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCashStore } from '@/stores/cash'
import axios from 'axios'
import Swal from 'sweetalert2'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const cashStore = useCashStore()

const showOpenModal = ref(false)
const showCloseModal = ref(false)
const showMovementModal = ref(false)
const showSangriaModal = ref(false)

const valorAbertura = ref(0)
const valorInformado = ref(0)
const movTipo = ref('ENTRADA')
const movDescricao = ref('')
const movValor = ref(0)
const sangriaDescricao = ref('')
const sangriaValor = ref(0)
const movimentacoes = ref([])

const valorEsperado = computed(() => {
  const caixa = cashStore.currentCash
  if (!caixa) return 0
  return caixa.valorAbertura + caixa.totalEntradas + caixa.totalVendas - caixa.totalSaidas - caixa.totalSangrias + caixa.totalSuprimentos
})

const formatDate = (date) => {
  if (!date) return '-'
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

const openCash = async () => {
  const result = await cashStore.openCash(valorAbertura.value)
  if (result.success) {
    showOpenModal.value = false
    valorAbertura.value = 0
    await loadMovimentacoes()
    Swal.fire('Sucesso!', 'Caixa aberto com sucesso.', 'success')
  } else {
    Swal.fire('Erro', result.message, 'error')
  }
}

const closeCash = async () => {
  try {
    await axios.post('/api/cash/close', {
      valorInformado: valorInformado.value,
      observacoesFechamento: ''
    })
    await cashStore.fetchCurrentCash()
    showCloseModal.value = false
    valorInformado.value = 0
    Swal.fire('Sucesso!', 'Caixa fechado com sucesso.', 'success')
  } catch (error) {
    Swal.fire('Erro', error.response?.data?.message || 'Erro ao fechar caixa', 'error')
  }
}

const registerMovement = async () => {
  if (!movDescricao.value || movValor.value <= 0) {
    Swal.fire('Erro', 'Preencha todos os campos.', 'error')
    return
  }
  try {
    await axios.post('/api/cash/movements', {
      tipo: movTipo.value,
      descricao: movDescricao.value,
      valor: movValor.value
    })
    showMovementModal.value = false
    movDescricao.value = ''
    movValor.value = 0
    await loadMovimentacoes()
    await cashStore.fetchCurrentCash()
    Swal.fire('Sucesso!', 'Movimentação registrada.', 'success')
  } catch (error) {
    Swal.fire('Erro', error.response?.data?.message, 'error')
  }
}

const registerSangria = async () => {
  if (!sangriaDescricao.value || sangriaValor.value <= 0) {
    Swal.fire('Erro', 'Preencha todos os campos.', 'error')
    return
  }
  try {
    await axios.post('/api/cash/movements', {
      tipo: 'SANGRIA',
      descricao: sangriaDescricao.value,
      valor: sangriaValor.value
    })
    showSangriaModal.value = false
    sangriaDescricao.value = ''
    sangriaValor.value = 0
    await loadMovimentacoes()
    await cashStore.fetchCurrentCash()
    Swal.fire('Sucesso!', 'Sangria registrada.', 'success')
  } catch (error) {
    Swal.fire('Erro', error.response?.data?.message, 'error')
  }
}

const loadMovimentacoes = async () => {
  try {
    const response = await axios.get('/api/cash/current')
    movimentacoes.value = response.data.data.movimentacoes || []
  } catch (error) {
    console.error('Erro ao carregar movimentações:', error)
  }
}

onMounted(async () => {
  await cashStore.fetchCurrentCash()
  if (cashStore.isOpen) {
    await loadMovimentacoes()
  }
})
</script>