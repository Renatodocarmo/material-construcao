<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">👥 Clientes</h1>
      <button @click="openModal()" class="btn-primary">+ Novo Cliente</button>
    </div>
    
    <!-- Busca -->
    <div class="card mb-6">
      <div class="flex gap-4">
        <input 
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          class="input flex-1"
          placeholder="🔍 Buscar por nome, CPF/CNPJ ou telefone..."
        >
      </div>
    </div>
    
    <!-- Lista -->
    <div class="card">
      <div v-if="customersStore.loading" class="text-center py-12">
        <p class="text-gray-500">Carregando clientes...</p>
      </div>
      
      <div v-else-if="customersStore.customers.length === 0" class="text-center py-12 text-gray-500">
        <p class="text-6xl mb-2">👥</p>
        <p>Nenhum cliente encontrado.</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF/CNPJ</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="customer in customersStore.customers" :key="customer._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-semibold text-gray-900">{{ customer.nome }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ customer.cpfCnpj || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ customer.telefone || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ customer.email || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ customer.endereco?.cidade || '-' }}</td>
              <td class="px-4 py-3 text-center">
                <button @click="openModal(customer)" class="text-blue-600 hover:text-blue-800 mr-2" title="Editar">
                  ✏️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Paginação -->
      <div v-if="customersStore.customers.length > 0" class="mt-6 flex justify-between items-center text-sm text-gray-500">
        <p>Mostrando {{ customersStore.customers.length }} de {{ customersStore.pagination.total }} clientes</p>
      </div>
    </div>
    
    <!-- Modal de Cadastro/Edição -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">{{ editingCustomer ? 'Editar Cliente' : 'Novo Cliente' }}</h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        
        <form @submit.prevent="saveCustomer">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input v-model="form.nome" type="text" class="input" required>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
              <input v-model="form.cpfCnpj" type="text" class="input" placeholder="000.000.000-00">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input v-model="form.telefone" type="text" class="input" placeholder="(00) 00000-0000">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input v-model="form.whatsapp" type="text" class="input">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input v-model="form.email" type="email" class="input">
            </div>
          </div>
          
          <div class="border-t pt-4 mb-4">
            <h3 class="font-bold text-gray-700 mb-3">📍 Endereço</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <input v-model="form.endereco.cep" type="text" class="input">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <input v-model="form.endereco.estado" type="text" class="input">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input v-model="form.endereco.cidade" type="text" class="input">
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                <input v-model="form.endereco.rua" type="text" class="input">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input v-model="form.endereco.numero" type="text" class="input">
              </div>
              <div class="md:col-span-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <input v-model="form.endereco.bairro" type="text" class="input">
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea v-model="form.observacoes" class="input" rows="3"></textarea>
          </div>
          
          <div class="flex gap-2">
            <button type="submit" class="btn-primary flex-1">
              {{ editingCustomer ? 'Salvar Alterações' : 'Cadastrar Cliente' }}
            </button>
            <button type="button" @click="closeModal" class="btn-secondary flex-1">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import Swal from 'sweetalert2'

const customersStore = useCustomersStore()
const searchQuery = ref('')
const showModal = ref(false)
const editingCustomer = ref(null)

const form = ref({
  nome: '',
  cpfCnpj: '',
  telefone: '',
  whatsapp: '',
  email: '',
  endereco: {
    cep: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: '',
    complemento: ''
  },
  observacoes: ''
})

let searchTimeout = null

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    await customersStore.fetchCustomers({ search: searchQuery.value })
  }, 400)
}

const openModal = (customer = null) => {
  if (customer) {
    editingCustomer.value = customer
    form.value = {
      nome: customer.nome,
      cpfCnpj: customer.cpfCnpj || '',
      telefone: customer.telefone || '',
      whatsapp: customer.whatsapp || '',
      email: customer.email || '',
      endereco: {
        cep: customer.endereco?.cep || '',
        estado: customer.endereco?.estado || '',
        cidade: customer.endereco?.cidade || '',
        bairro: customer.endereco?.bairro || '',
        rua: customer.endereco?.rua || '',
        numero: customer.endereco?.numero || '',
        complemento: customer.endereco?.complemento || ''
      },
      observacoes: customer.observacoes || ''
    }
  } else {
    editingCustomer.value = null
    form.value = {
      nome: '',
      cpfCnpj: '',
      telefone: '',
      whatsapp: '',
      email: '',
      endereco: { cep: '', estado: '', cidade: '', bairro: '', rua: '', numero: '', complemento: '' },
      observacoes: ''
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCustomer.value = null
}

const saveCustomer = async () => {
  if (!form.value.nome) {
    Swal.fire('Erro', 'O nome é obrigatório.', 'error')
    return
  }
  
  let result
  if (editingCustomer.value) {
    result = await customersStore.updateCustomer(editingCustomer.value._id, form.value)
  } else {
    result = await customersStore.createCustomer(form.value)
  }
  
  if (result.success) {
    Swal.fire({
      icon: 'success',
      title: editingCustomer.value ? 'Cliente atualizado!' : 'Cliente cadastrado!',
      timer: 2000,
      showConfirmButton: false
    })
    closeModal()
    await customersStore.fetchCustomers({ search: searchQuery.value })
  } else {
    Swal.fire('Erro', result.message, 'error')
  }
}

onMounted(async () => {
  await customersStore.fetchCustomers()
})
</script>