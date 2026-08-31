<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">📊 Dashboard</h1>
      <div class="flex items-center gap-4">
        <select v-model="periodo" @change="refreshData" class="input w-48">
          <option value="7">Últimos 7 dias</option>
          <option value="15">Últimos 15 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 3 meses</option>
        </select>
        <button @click="refreshData" class="text-sm text-blue-600 hover:text-blue-700 font-semibold">
          🔄 Atualizar
        </button>
      </div>
    </div>
    
    <!-- Cards de Resumo -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-blue-600 text-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-2">📦 Total de Produtos</h3>
        <p class="text-3xl font-bold">{{ productsStore.pagination.total }}</p>
        <p class="text-xs mt-1 opacity-80">{{ produtosEstoqueBaixo }} com estoque baixo</p>
      </div>
      <div class="bg-green-500 text-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-2"> Vendas no Período</h3>
        <p class="text-3xl font-bold">R$ {{ totalVendasPeriodo.toFixed(2) }}</p>
        <p class="text-xs mt-1 opacity-80">{{ vendasPeriodoCount }} venda(s)</p>
      </div>
      <div class="bg-yellow-500 text-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-2"> Ticket Médio</h3>
        <p class="text-3xl font-bold">R$ {{ ticketMedio.toFixed(2) }}</p>
        <p class="text-xs mt-1 opacity-80">Por venda</p>
      </div>
      <div class="bg-purple-500 text-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-2">👥 Clientes</h3>
        <p class="text-3xl font-bold">{{ customersCount }}</p>
        <p class="text-xs mt-1 opacity-80">Cadastrados</p>
      </div>
    </div>
    
    <!-- Gráficos - Linha 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">📈 Vendas por Dia</h2>
        <div v-if="loadingCharts" class="h-64 flex items-center justify-center">
          <p class="text-gray-400">Carregando gráfico...</p>
        </div>
        <div v-else class="h-64">
          <Line :data="chartVendasData" :options="chartOptions" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4"> Formas de Pagamento</h2>
        <div v-if="loadingCharts" class="h-64 flex items-center justify-center">
          <p class="text-gray-400">Carregando gráfico...</p>
        </div>
        <div v-else class="h-64">
          <Doughnut :data="chartPagamentoData" :options="chartOptions" />
        </div>
      </div>
    </div>
    
    <!-- Gráficos - Linha 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">🏆 Produtos Mais Vendidos</h2>
        <div v-if="loadingCharts" class="h-64 flex items-center justify-center">
          <p class="text-gray-400">Carregando gráfico...</p>
        </div>
        <div v-else class="h-64">
          <Bar :data="chartProdutosData" :options="chartOptions" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">📂 Vendas por Categoria</h2>
        <div v-if="loadingCharts" class="h-64 flex items-center justify-center">
          <p class="text-gray-400">Carregando gráfico...</p>
        </div>
        <div v-else class="h-64">
          <Pie :data="chartCategoriasData" :options="chartOptions" />
        </div>
      </div>
    </div>
    
    <!-- Últimas Vendas e Produtos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">🛒 Últimas Vendas</h2>
          <router-link to="/sales" class="text-sm text-blue-600 hover:underline">Ver todas</router-link>
        </div>
        <div v-if="salesStore.sales.length === 0" class="text-center py-8 text-gray-400">
          <p>Nenhuma venda registrada.</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="sale in salesStore.sales.slice(0, 5)" :key="sale._id" class="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
            <div>
              <p class="font-semibold">Venda #{{ String(sale.numero).padStart(6, '0') }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(sale.createdAt) }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-green-600">R$ {{ sale.total.toFixed(2) }}</p>
              <span :class="['badge', sale.status === 'FINALIZADA' ? 'badge-success' : 'badge-warning']">
                {{ sale.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">📦 Produtos Recentes</h2>
          <router-link to="/products" class="text-sm text-blue-600 hover:underline">Ver todos</router-link>
        </div>
        <div v-if="productsStore.products.length === 0" class="text-center py-8 text-gray-400">
          <p>Nenhum produto cadastrado.</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="product in productsStore.products.slice(0, 5)" :key="product._id" class="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
            <div>
              <p class="font-semibold">{{ product.nome }}</p>
              <p class="text-sm text-gray-500">{{ product.categoriaId?.name || 'Sem categoria' }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold">R$ {{ product.precoVenda.toFixed(2) }}</p>
              <p class="text-sm" :class="product.estoqueAtual <= product.estoqueMinimo ? 'text-red-600 font-semibold' : 'text-gray-500'">
                Estoque: {{ product.estoqueAtual }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, shallowRef } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useSalesStore } from '@/stores/sales'
import { useCashStore } from '@/stores/cash'
import { useCustomersStore } from '@/stores/customers'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar, Doughnut, Pie } from 'vue-chartjs'
import axios from 'axios'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const productsStore = useProductsStore()
const salesStore = useSalesStore()
const cashStore = useCashStore()
const customersStore = useCustomersStore()

const periodo = ref('7')
const loadingCharts = ref(true)
const vendasPeriodoCount = ref(0)
const totalVendasPeriodo = ref(0)
const customersCount = ref(0)
const produtosEstoqueBaixo = ref(0)

// Dados dos gráficos
const chartVendasData = shallowRef(null)
const chartPagamentoData = shallowRef(null)
const chartProdutosData = shallowRef(null)
const chartCategoriasData = shallowRef(null)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

const ticketMedio = computed(() => {
  if (vendasPeriodoCount.value === 0) return 0
  return totalVendasPeriodo.value / vendasPeriodoCount.value
})

const refreshData = async () => {
  loadingCharts.value = true
  
  try {
    await Promise.all([
      productsStore.fetchProducts(),
      salesStore.fetchSales({ limit: 5 }),
      cashStore.fetchCurrentCash(),
      customersStore.fetchCustomers({ limit: 1000 })
    ])
    
    await processChartsData()
  } catch (error) {
    console.error('Erro ao atualizar dashboard:', error)
  } finally {
    loadingCharts.value = false
  }
}

const processChartsData = async () => {
  const days = parseInt(periodo.value)
  const dataInicio = subDays(new Date(), days)
  
  try {
    const response = await axios.get('/api/sales', {
      params: { 
        dataInicio: dataInicio.toISOString(),
        limit: 1000
      }
    })
    
    const vendas = response.data.data.filter(v => v.status === 'FINALIZADA')
    
    vendasPeriodoCount.value = vendas.length
    totalVendasPeriodo.value = vendas.reduce((sum, v) => sum + v.total, 0)
    customersCount.value = customersStore.pagination.total
    produtosEstoqueBaixo.value = productsStore.products.filter(
      p => p.estoqueAtual <= p.estoqueMinimo
    ).length
    
    // Gráfico de Vendas por Dia
    const vendasPorDia = {}
    for (let i = days - 1; i >= 0; i--) {
      const data = format(subDays(new Date(), i), 'dd/MM')
      vendasPorDia[data] = 0
    }
    
    vendas.forEach(venda => {
      const dataVenda = format(new Date(venda.createdAt), 'dd/MM')
      if (vendasPorDia[dataVenda] !== undefined) {
        vendasPorDia[dataVenda] += venda.total
      }
    })
    
    chartVendasData.value = {
      labels: Object.keys(vendasPorDia),
      datasets: [{
        label: 'Vendas (R$)',
        data: Object.values(vendasPorDia),
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.4,
        fill: true
      }]
    }
    
    // Gráfico de Formas de Pagamento
    const formasPagamento = {}
    vendas.forEach(venda => {
      const forma = venda.formaPagamento
      if (!formasPagamento[forma]) {
        formasPagamento[forma] = 0
      }
      formasPagamento[forma] += venda.total
    })
    
    const coresPagamento = [
      'rgb(14, 165, 233)',
      'rgb(16, 185, 129)',
      'rgb(245, 158, 11)',
      'rgb(239, 68, 68)',
      'rgb(139, 92, 246)',
      'rgb(236, 72, 153)',
      'rgb(99, 102, 241)',
      'rgb(249, 115, 22)'
    ]
    
    chartPagamentoData.value = {
      labels: Object.keys(formasPagamento).map(f => {
        const map = {
          'DINHEIRO': 'Dinheiro',
          'PIX': 'PIX',
          'DEBITO': 'Débito',
          'CREDITO': 'Crédito',
          'BOLETO': 'Boleto',
          'TRANSFERENCIA': 'Transferência',
          'FIADO': 'Fiado',
          'DIVIDIDO': 'Dividido'
        }
        return map[f] || f
      }),
      datasets: [{
        data: Object.values(formasPagamento),
        backgroundColor: coresPagamento.slice(0, Object.keys(formasPagamento).length)
      }]
    }
    
    // Gráfico de Produtos Mais Vendidos
    const produtosVendidos = {}
    vendas.forEach(venda => {
      venda.itens.forEach(item => {
        if (!produtosVendidos[item.nomeProduto]) {
          produtosVendidos[item.nomeProduto] = 0
        }
        produtosVendidos[item.nomeProduto] += item.quantidade
      })
    })
    
    const topProdutos = Object.entries(produtosVendidos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    
    chartProdutosData.value = {
      labels: topProdutos.map(p => p[0].substring(0, 20)),
      datasets: [{
        label: 'Quantidade Vendida',
        data: topProdutos.map(p => p[1]),
        backgroundColor: 'rgb(14, 165, 233)'
      }]
    }
    
    // Gráfico de Categorias
    const categoriasVendas = {}
    vendas.forEach(venda => {
      venda.itens.forEach(item => {
        const categoriaNome = item.categoriaId?.name || 'Sem categoria'
        if (!categoriasVendas[categoriaNome]) {
          categoriasVendas[categoriaNome] = 0
        }
        categoriasVendas[categoriaNome] += item.total
      })
    })
    
    chartCategoriasData.value = {
      labels: Object.keys(categoriasVendas),
      datasets: [{
        data: Object.values(categoriasVendas),
        backgroundColor: coresPagamento.slice(0, Object.keys(categoriasVendas).length)
      }]
    }
    
  } catch (error) {
    console.error('Erro ao processar dados dos gráficos:', error)
  }
}

const formatDate = (date) => {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

onMounted(async () => {
  await refreshData()
})
</script>