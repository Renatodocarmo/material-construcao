<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">👥 Gestão de Usuários</h1>
      <button @click="openModal()" class="btn-primary">+ Novo Usuário</button>
    </div>
    
    <!-- Lista de Usuários -->
    <div class="card">
      <div v-if="usersStore.loading" class="text-center py-12">
        <p class="text-gray-500">Carregando usuários...</p>
      </div>
      
      <div v-else-if="usersStore.users.length === 0" class="text-center py-12 text-gray-500">
        <p class="text-6xl mb-2">👥</p>
        <p>Nenhum usuário cadastrado.</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="user in usersStore.users" :key="user._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-semibold text-gray-900">{{ user.name }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ user.email }}</td>
              <td class="px-4 py-3 text-sm">
                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                  {{ user.roleId?.name || 'Sem cargo' }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="['badge', user.isActive ? 'badge-success' : 'badge-danger']">
                  {{ user.isActive ? 'ATIVO' : 'INATIVO' }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <!-- Botão Editar (sempre visível, exceto para o próprio admin) -->
                <button 
                  v-if="user._id !== authStore.user?._id"
                  @click="openModal(user)" 
                  class="text-blue-600 hover:text-blue-800 mr-2" 
                  title="Editar"
                >
                  ✏️
                </button>
                
                <!-- Botão Ativar/Desativar (não aparece para o próprio admin) -->
                <button 
                  v-if="user._id !== authStore.user?._id"
                  @click="toggleStatus(user)" 
                  :class="user.isActive ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'"
                  class="mr-2"
                  :title="user.isActive ? 'Desativar' : 'Ativar'"
                >
                  {{ user.isActive ? '🔒' : '✅' }}
                </button>
                
                <!-- Botão Excluir Permanentemente (só aparece para usuários inativos e nunca para o admin) -->
                <button 
                  v-if="!user.isActive && user._id !== authStore.user?._id"
                  @click="confirmPermanentDelete(user)" 
                  class="text-red-600 hover:text-red-800"
                  title="Excluir permanentemente"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal de Cadastro/Edição -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">{{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}</h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        
        <form @submit.prevent="saveUser">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
            <input v-model="form.name" type="text" class="input" required>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
            <input v-model="form.email" type="email" class="input" required>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Senha {{ editingUser ? '(deixe em branco para manter)' : '*' }}
            </label>
            <input v-model="form.password" type="password" class="input" :required="!editingUser">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
            <select v-model="form.roleId" class="input" required>
              <option value="">Selecione um cargo</option>
              <option v-for="role in usersStore.roles" :key="role._id" :value="role._id">
                {{ role.name }}
              </option>
            </select>
          </div>
          
          <div class="mb-4" v-if="editingUser">
            <label class="flex items-center">
              <input v-model="form.isActive" type="checkbox" class="rounded">
              <span class="ml-2 text-sm text-gray-700">Usuário Ativo</span>
            </label>
          </div>
          
          <div class="flex gap-2">
            <button type="submit" :disabled="saving" class="btn-primary flex-1">
              {{ saving ? ' Salvando...' : '💾 Salvar' }}
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
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const usersStore = useUsersStore()
const authStore = useAuthStore()

const showModal = ref(false)
const editingUser = ref(null)
const saving = ref(false)

const form = ref({
  name: '',
  email: '',
  password: '',
  roleId: '',
  isActive: true
})

const openModal = (user = null) => {
  if (user) {
    editingUser.value = user
    form.value = {
      name: user.name,
      email: user.email,
      password: '',
      roleId: user.roleId?._id || '',
      isActive: user.isActive
    }
  } else {
    editingUser.value = null
    form.value = {
      name: '',
      email: '',
      password: '',
      roleId: '',
      isActive: true
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingUser.value = null
}

const saveUser = async () => {
  if (!form.value.name || !form.value.email || !form.value.roleId) {
    Swal.fire('Erro', 'Preencha todos os campos obrigatórios.', 'error')
    return
  }
  
  if (!editingUser.value && !form.value.password) {
    Swal.fire('Erro', 'Senha é obrigatória para novo usuário.', 'error')
    return
  }
  
  saving.value = true
  
  let result
  if (editingUser.value) {
    result = await usersStore.updateUser(editingUser.value._id, form.value)
  } else {
    result = await usersStore.createUser(form.value)
  }
  
  saving.value = false
  
  if (result.success) {
    Swal.fire({
      icon: 'success',
      title: editingUser.value ? 'Usuário atualizado!' : 'Usuário criado!',
      timer: 2000,
      showConfirmButton: false
    })
    closeModal()
    await usersStore.fetchUsers()
  } else {
    Swal.fire('Erro', result.message, 'error')
  }
}

const toggleStatus = async (user) => {
  const newStatus = user.isActive ? 'desativar' : 'ativar'
  
  const result = await Swal.fire({
    title: `${newStatus === 'desativar' ? 'Desativar' : 'Ativar'} usuário?`,
    text: `${user.name} ${newStatus === 'desativar' ? 'não poderá mais acessar o sistema' : 'poderá acessar o sistema novamente'}.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: newStatus === 'desativar' ? '#d33' : '#10b981',
    cancelButtonColor: '#3085d6',
    confirmButtonText: `Sim, ${newStatus}`,
    cancelButtonText: 'Cancelar'
  })
  
  if (result.isConfirmed) {
    const formData = { isActive: !user.isActive }
    const response = await usersStore.updateUser(user._id, formData)
    
    if (response.success) {
      Swal.fire({
        icon: 'success',
        title: `Usuário ${newStatus}o!`,
        timer: 2000,
        showConfirmButton: false
      })
      await usersStore.fetchUsers()
    } else {
      Swal.fire('Erro', response.message, 'error')
    }
  }
}

const confirmPermanentDelete = (user) => {
  Swal.fire({
    title: '️ EXCLUIR PERMANENTEMENTE?',
    html: `
      <div class="text-left">
        <p class="font-bold text-red-600 mb-2">Esta ação NÃO PODE ser desfeita!</p>
        <p><strong>Usuário:</strong> ${user.name}</p>
        <p><strong>E-mail:</strong> ${user.email}</p>
        <p class="text-sm text-gray-600 mt-2">Todos os dados serão removidos permanentemente do banco de dados.</p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: '️ Sim, excluir permanentemente',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      // Confirmação dupla - digitar EXCLUIR
      const confirmText = await Swal.fire({
        title: 'Digite "EXCLUIR" para confirmar',
        input: 'text',
        inputPlaceholder: 'EXCLUIR',
        showCancelButton: true,
        confirmButtonText: 'Confirmar exclusão',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (value !== 'EXCLUIR') {
            return 'Você precisa digitar "EXCLUIR" para confirmar'
          }
        }
      })
      
      if (confirmText.isConfirmed) {
        const response = await usersStore.deleteUserPermanent(user._id)
        
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Usuário excluído permanentemente!',
            timer: 2000,
            showConfirmButton: false
          })
          await usersStore.fetchUsers()
        } else {
          Swal.fire('Erro', response.message, 'error')
        }
      }
    }
  })
}

onMounted(async () => {
  await usersStore.fetchRoles()
  await usersStore.fetchUsers()
})
</script>