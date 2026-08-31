<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">🏭 Fornecedores</h1>
      <button @click="openModal()" class="btn-primary">+ Novo Fornecedor</button>
    </div>
    
    <!-- Busca -->
    <div class="card mb-6">
      <div class="flex gap-4">
        <input 
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          class="input flex-1"
          placeholder=" Buscar por razão social, nome fantasia ou CNPJ..."
        >
      </div>
    </div>
    
    <!-- Lista -->
    <div class="card">
      <div v-if="suppliersStore.loading" class="text-center py-12">
        <p class="text-gray-500">Carregando fornecedores...</p>
      </div>
      
      <div v-else-if="suppliersStore.suppliers.length === 0" class="text-center py-12 text-gray-500">
        <p class="text-6xl mb-2">🏭</p>
        <p>Nenhum fornecedor encontrado.</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Razão Social</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome Fantasia</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="supplier in suppliersStore.suppliers" :key="supplier._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-semibold text-gray-900">{{ supplier.razaoSocial }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ supplier.nomeFantasia || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ supplier.cnpj }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ supplier.telefone || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ supplier.email || '-' }}</td>
              <td class="px-4 py-3 text-center">
                <button @click="openModal(supplier)" class="text-blue-600 hover:text-blue-800 mr-2" title="Editar">
                  ✏️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="suppliersStore.suppliers.length > 0" class="mt-6 flex justify-between items-center text-sm text-gray-500">
        <p>Mostrando {{ suppliersStore.suppliers.length }} de {{ suppliersStore.pagination.total }} fornecedores</p>
      </div>
    </div>
    
    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">{{ editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor' }}</h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        
        <form @submit.prevent="saveSupplier">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Razão Social *</label>
              <input v-model="form.razaoSocial" type="text" class="input" required>
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
              <input v-model="form.nomeFantasia" type="text" class="input">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
              <input v-model="form.cnpj" type="text" class="input" placeholder="00.000.000/0000-00" required>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input v-model="form.telefone" type="text" class="input">
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
              {{ editingSupplier ? 'Salvar Alterações' : 'Cadastrar Fornecedor' }}
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
import { useSuppliersStore } from '@/stores/suppliers'
import Swal from 'sweetalert2'

const suppliersStore = useSuppliersStore()
const searchQuery = ref('')
const showModal = ref(false)
const editingSupplier = ref(null)

const form = ref({
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  telefone: '',
  whatsapp: '',
  email: '',
  endereco: {
    cep: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: ''
  },
  observacoes: ''
})

let searchTimeout = null

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    await suppliersStore.fetchSuppliers({ search: searchQuery.value })
  }, 400)
}

const openModal = (supplier = null) => {
  if (supplier) {
    editingSupplier.value = supplier
    form.value = {
      razaoSocial: supplier.razaoSocial,
      nomeFantasia: supplier.nomeFantasia || '',
      cnpj: supplier.cnpj,
      telefone: supplier.telefone || '',
      whatsapp: supplier.whatsapp || '',
      email: supplier.email || '',
      endereco: {
        cep: supplier.endereco?.cep || '',
        estado: supplier.endereco?.estado || '',
        cidade: supplier.endereco?.cidade || '',
        bairro: supplier.endereco?.bairro || '',
        rua: supplier.endereco?.rua || '',
        numero: supplier.endereco?.numero || ''
      },
      observacoes: supplier.observacoes || ''
    }
  } else {
    editingSupplier.value = null
    form.value = {
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      telefone: '',
      whatsapp: '',
      email: '',
      endereco: { cep: '', estado: '', cidade: '', bairro: '', rua: '', numero: '' },
      observacoes: ''
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingSupplier.value = null
}

const saveSupplier = async () => {
  if (!form.value.razaoSocial || !form.value.cnpj) {
    Swal.fire('Erro', 'Razão Social e CNPJ são obrigatórios.', 'error')
    return
  }
  
  let result
  if (editingSupplier.value) {
    result = await suppliersStore.updateSupplier(editingSupplier.value._id, form.value)
  } else {
    result = await suppliersStore.createSupplier(form.value)
  }
  
  if (result.success) {
    Swal.fire({
      icon: 'success',
      title: editingSupplier.value ? 'Fornecedor atualizado!' : 'Fornecedor cadastrado!',
      timer: 2000,
      showConfirmButton: false
    })
    closeModal()
    await suppliersStore.fetchSuppliers({ search: searchQuery.value })
  } else {
    Swal.fire('Erro', result.message, 'error')
  }
}

onMounted(async () => {
  await suppliersStore.fetchSuppliers()
})
</script>