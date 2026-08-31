<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <!-- Container Centralizado: mx-auto faz a mágica da centralização -->
    <div class="max-w-4xl mx-auto px-4">
      
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">⚙️ Configurações da Loja</h1>
      </div>
      
      <form @submit.prevent="saveSettings" class="space-y-6">
        <!-- Dados Principais -->
        <div class="card bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4 border-b pb-2 text-gray-800">📋 Dados Principais</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Loja *</label>
              <input v-model="form.nome" type="text" class="input" required placeholder="Ex: Casa do Material de Construção">
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
              <input v-model="form.razaoSocial" type="text" class="input" placeholder="Razão social completa">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CNPJ/CPF</label>
              <input v-model="form.cnpjCpf" type="text" class="input" placeholder="00.000.000/0000-00">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
              <input v-model="form.inscricaoEstadual" type="text" class="input">
            </div>
          </div>
        </div>
        
        <!-- Contato -->
        <div class="card bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4 border-b pb-2 text-gray-800">📞 Contato</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input v-model="form.telefone" type="text" class="input" placeholder="(00) 0000-0000">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input v-model="form.whatsapp" type="text" class="input" placeholder="(00) 00000-0000">
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input v-model="form.email" type="email" class="input" placeholder="contato@loja.com">
            </div>
          </div>
        </div>
        
        <!-- Endereço -->
        <div class="card bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4 border-b pb-2 text-gray-800">📍 Endereço</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <input v-model="form.endereco.cep" type="text" class="input">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input v-model="form.endereco.estado" type="text" class="input" placeholder="SP">
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
        
        <!-- Logo -->
        <div class="card bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4 border-b pb-2 text-gray-800">🖼️ Logo da Loja</h2>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Upload de Logo (aparece no PDF)</label>
            <div class="flex items-center gap-4">
              <div v-if="form.logo" class="w-32 h-32 border-2 border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                <img :src="form.logo" alt="Logo" class="max-w-full max-h-full object-contain">
              </div>
              <div class="flex-1">
                <input 
                  @change="handleLogoUpload"
                  type="file" 
                  accept="image/*"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                >
                <p class="text-xs text-gray-500 mt-1">Formatos: PNG, JPG (máx. 2MB)</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Botões -->
        <div class="flex gap-4 pt-4">
          <button type="submit" :disabled="saving" class="btn-primary flex-1 py-3 text-lg font-semibold">
            {{ saving ? '💾 Salvando...' : '💾 Salvar Configurações' }}
          </button>
          <button type="button" @click="loadSettings" class="btn-secondary flex-1 py-3 text-lg font-semibold">
            🔄 Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import Swal from 'sweetalert2'

const settingsStore = useSettingsStore()
const saving = ref(false)

const form = ref({
  nome: '',
  razaoSocial: '',
  cnpjCpf: '',
  inscricaoEstadual: '',
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
  logo: ''
})

const handleLogoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire('Erro', 'A imagem deve ter no máximo 2MB.', 'error')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.logo = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const loadSettings = async () => {
  const result = await settingsStore.fetchSettings()
  if (result.success && settingsStore.settings) {
    const s = settingsStore.settings
    form.value = {
      nome: s.nome || '',
      razaoSocial: s.razaoSocial || '',
      cnpjCpf: s.cnpjCpf || '',
      inscricaoEstadual: s.inscricaoEstadual || '',
      telefone: s.telefone || '',
      whatsapp: s.whatsapp || '',
      email: s.email || '',
      endereco: {
        cep: s.endereco?.cep || '',
        estado: s.endereco?.estado || '',
        cidade: s.endereco?.cidade || '',
        bairro: s.endereco?.bairro || '',
        rua: s.endereco?.rua || '',
        numero: s.endereco?.numero || ''
      },
      logo: s.logo || ''
    }
  }
}

const saveSettings = async () => {
  saving.value = true
  
  const result = await settingsStore.updateSettings(form.value)
  
  saving.value = false
  
  if (result.success) {
    Swal.fire({
      icon: 'success',
      title: 'Configurações salvas!',
      text: 'As alterações foram salvas com sucesso.',
      timer: 2000,
      showConfirmButton: false
    })
  } else {
    Swal.fire('Erro', result.message, 'error')
  }
}

onMounted(async () => {
  await loadSettings()
})
</script>