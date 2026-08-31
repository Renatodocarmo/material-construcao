<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">💵 Contas</h1>
      <div class="flex gap-2">
        <button @click="openModal('receivable')" class="btn-primary">+ Conta a Receber</button>
        <button @click="openModal('payable')" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">+ Conta a Pagar</button>
      </div>
    </div>
    
    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button 
            @click="activeTab = 'receivable'"
            :class="['py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'receivable' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
          >
            💰 A Receber ({{ accountsStore.receivables.length }})
          </button>
          <button 
            @click="activeTab = 'payable'"
            :class="['py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'payable' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
          >
            💸 A Pagar ({{ accountsStore.payables.length }})
          </button>
        </nav>
      </div>
    </div>
    
    <!-- Lista A Receber -->
    <div v-if="activeTab === 'receivable'" class="card">
      <div v-if="accountsStore.receivables.length === 0" class="text-center py-12 text-gray-400">
        <p class="text-6xl mb-2">💰</p>
        <p>Nenhuma conta a receber.</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="acc in accountsStore.receivables" :key="acc._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-semibold">{{ acc.clienteId?.nome || 'Consumidor Final' }}</td>
              <td class="px-4 py-3 text-sm">{{ acc.descricao }}</td>
              <td class="px-4 py-3 text-sm">{{ formatDate(acc.dataVencimento) }}</td>
              <td class="px-4 py-3 text-right font-bold">R$ {{ acc.valor.toFixed(2) }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="['badge', getStatusClass(acc.status)]">{{ acc.status }}</span>
              </td>
              <td class="px-4 py-3 text-center">
                <button v-if="acc.status === 'PENDENTE'" @click="openPaymentModal('receivable', acc)" class="text-green-600 hover:text-green-800 mr-2" title="Baixar">
                  ✅
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Lista A Pagar -->
    <div v-if="activeTab === 'payable'" class="card">
      <div v-if="accountsStore.payables.length === 0" class="text-center py-12 text-gray-400">
        <p class="text-6xl mb-2">💸</p>
        <p>Nenhuma conta a pagar.</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="acc in accountsStore.payables" :key="acc._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-semibold">{{ acc.fornecedorId?.razaoSocial || '-' }}</td>
              <td class="px-4 py-3 text-sm">{{ acc.descricao }}</td>
              <td class="px-4 py-3 text-sm">{{ formatDate(acc.dataVencimento) }}</td>
              <td class="px-4 py-3 text-right font-bold">R$ {{ acc.valor.toFixed(2) }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="['badge', getStatusClass(acc.status)]">{{ acc.status }}</span>
              </td>
              <td class="px-4 py-3 text-center">
                <button v-if="acc.status === 'PENDENTE'" @click="openPaymentModal('payable', acc)" class="text-green-600 hover:text-green-800 mr-2" title="Baixar">
                  ✅
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal de Cadastro -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">{{ modalType === 'receivable' ? '💰 Nova Conta a Receber' : '💸 Nova Conta a Pagar' }}</h2>
        
        <form @submit.prevent="saveAccount">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
            <input v-model="form.descricao" type="text" class="input" required>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
            <input v-model.number="form.valor" type="number" step="0.01" class="input" required>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento *</label>
            <input v-model="form.dataVencimento" type="date" class="input" required>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input v-model="form.categoria" type="text" class="input">
          </div>
          
          <div class="flex gap-2">
            <button type="submit" class="btn-primary flex-1">Salvar</button>
            <button type="button" @click="closeModal" class="btn-secondary flex-1">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Modal de Pagamento -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">Baixar Conta</h2>
        
        <form @submit.prevent="payAccount">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
            <select v-model="paymentForm.formaPagamento" class="input">
              <option value="DINHEIRO">Dinheiro</option>
              <option value="PIX">PIX</option>
              <option value="DEBITO">Débito</option>
              <option value="CREDITO">Crédito</option>
              <option value="TRANSFERENCIA">Transferência</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Data do Pagamento</label>
            <input v-model="paymentForm.dataPagamento" type="date" class="input" required>
          </div>
          
          <div class="flex gap-2">
            <button type="submit" class="btn-primary flex-1">Confirmar Pagamento</button>
            <button type="button" @click="closePaymentModal" class="btn-secondary flex-1">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAccountsStore } from '@/stores/accounts'
import Swal from 'sweetalert2'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const accountsStore = useAccountsStore()
const activeTab = ref('receivable')
const showModal = ref(false)
const showPaymentModal = ref(false)
const modalType = ref('receivable')
const currentAccount = ref(null)

const form = ref({
  descricao: '',
  valor: 0,
  dataVencimento: new Date().toISOString().split('T')[0],
  categoria: ''
})

const paymentForm = ref({
  formaPagamento: 'DINHEIRO',
  dataPagamento: new Date().toISOString().split('T')[0]
})

const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

const getStatusClass = (status) => {
  const map = {
    'PENDENTE': 'badge-warning',
    'PAGO': 'badge-success',
    'VENCIDO': 'badge-danger',
    'CANCELADO': 'badge-secondary'
  }
  return map[status] || 'badge-secondary'
}

const openModal = (type) => {
  modalType.value = type
  form.value = {
    descricao: '',
    valor: 0,
    dataVencimento: new Date().toISOString().split('T')[0],
    categoria: ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const openPaymentModal = (type, account) => {
  currentAccount.value = { type, ...account }
  paymentForm.value = {
    formaPagamento: 'DINHEIRO',
    dataPagamento: new Date().toISOString().split('T')[0]
  }
  showPaymentModal.value = true
}

const closePaymentModal = () => {
  showPaymentModal.value = false
  currentAccount.value = null
}

const saveAccount = async () => {
  if (!form.value.descricao || form.value.valor <= 0) {
    Swal.fire('Erro', 'Preencha todos os campos obrigatórios.', 'error')
    return
  }
  
  let result
  if (modalType.value === 'receivable') {
    result = await accountsStore.createReceivable(form.value)
  } else {
    result = await accountsStore.createPayable(form.value)
  }
  
  if (result.success) {
    Swal.fire('Sucesso!', 'Conta cadastrada com sucesso.', 'success')
    closeModal()
    await refreshData()
  } else {
    Swal.fire('Erro', result.message, 'error')
  }
}

const payAccount = async () => {
  if (!currentAccount.value) return
  
  const result = await accountsStore.payAccount(
    currentAccount.value.type,
    currentAccount.value._id,
    paymentForm.value
  )
  
  if (result.success) {
    Swal.fire('Sucesso!', 'Conta baixada com sucesso.', 'success')
    closePaymentModal()
    await refreshData()
  } else {
    Swal.fire('Erro', result.message, 'error')
  }
}

const refreshData = async () => {
  if (activeTab.value === 'receivable') {
    await accountsStore.fetchReceivables()
  } else {
    await accountsStore.fetchPayables()
  }
}

onMounted(async () => {
  await accountsStore.fetchReceivables()
  await accountsStore.fetchPayables()
})
</script>