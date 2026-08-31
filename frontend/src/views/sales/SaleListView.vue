<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Vendas</h1>
      <router-link to="/sales/new" class="btn-primary">+ Nova Venda</router-link>
    </div>
    
    <div class="card">
      <div v-if="salesStore.loading" class="text-center py-12">
        <p class="text-gray-500">Carregando vendas...</p>
      </div>
      
      <div v-else-if="salesStore.sales.length === 0" class="text-center py-12 text-gray-500">
        Nenhuma venda registrada.
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="sale in salesStore.sales" :key="sale._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-mono font-semibold">#{{ String(sale.numero).padStart(6, '0') }}</td>
              <td class="px-4 py-3 text-sm">{{ formatDate(sale.createdAt) }}</td>
              <td class="px-4 py-3 text-sm">{{ sale.clienteNome || 'Consumidor Final' }}</td>
              <td class="px-4 py-3 text-sm">{{ formatPayment(sale.formaPagamento) }}</td>
              <td class="px-4 py-3 text-right font-bold">R$ {{ sale.total.toFixed(2) }}</td>
              <td class="px-4 py-3 text-center">
                <td class="px-4 py-3 text-center">
  <button @click="printSale(sale)" class="text-blue-600 hover:text-blue-800" title="Imprimir PDF">
    📄
  </button>
</td>
                <span :class="['badge', getStatusClass(sale.status)]">
                  {{ sale.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { generateSalePDF } from '@/utils/pdfGenerator'

const printSale = (sale) => {
  generateSalePDF(sale)
}
import { onMounted } from 'vue'
import { useSalesStore } from '@/stores/sales'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const salesStore = useSalesStore()

const formatDate = (date) => {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

const formatPayment = (payment) => {
  const map = {
    'DINHEIRO': '💵 Dinheiro',
    'PIX': '📱 PIX',
    'DEBITO': '💳 Débito',
    'CREDITO': '💳 Crédito',
    'BOLETO': '📄 Boleto',
    'TRANSFERENCIA': '🏦 Transferência',
    'FIADO': '📝 Fiado',
    'DIVIDIDO': ' Dividido'
  }
  return map[payment] || payment
}

const getStatusClass = (status) => {
  const map = {
    'FINALIZADA': 'badge-success',
    'CANCELADA': 'badge-danger',
    'PENDENTE': 'badge-warning'
  }
  return map[status] || 'badge-warning'
}

onMounted(async () => {
  await salesStore.fetchSales()
})
</script>