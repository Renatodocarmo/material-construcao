<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">📄 Relatórios</h1>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Relatório de Vendas -->
      <div class="card">
        <h2 class="text-xl font-bold mb-2">📊 Relatório de Vendas</h2>
        <p class="text-gray-600 mb-4 text-sm">Gere um relatório completo de todas as vendas com itens e detalhes.</p>
        
        <!-- Filtros de Data -->
        <div class="mb-4">
          <div class="flex gap-2">
            <input v-model="salesFilters.dataInicio" type="date" class="input flex-1">
            <input v-model="salesFilters.dataFim" type="date" class="input flex-1">
          </div>
        </div>
        
        <button @click="generateSalesReport" :disabled="reportsStore.loading" class="btn-primary w-full">
          {{ reportsStore.loading ? 'Gerando...' : 'Gerar Relatório PDF' }}
        </button>
      </div>
      
      <!-- Relatório de Estoque -->
      <div class="card">
        <h2 class="text-xl font-bold mb-2">📦 Relatório de Estoque</h2>
        <p class="text-gray-600 mb-4 text-sm">Lista completa de produtos com estoque atual, valores e alertas.</p>
        <button @click="generateInventoryReport" :disabled="reportsStore.loading" class="btn-primary w-full">
          {{ reportsStore.loading ? 'Gerando...' : 'Gerar Relatório PDF' }}
        </button>
      </div>
      
      <!-- Relatório Financeiro -->
      <div class="card">
        <h2 class="text-xl font-bold mb-2">💰 Relatório Financeiro</h2>
        <p class="text-gray-600 mb-4 text-sm">Resumo de entradas, saídas, vendas e lucro do período.</p>
        <div class="mb-4">
          <div class="flex gap-2">
            <input v-model="financialFilters.dataInicio" type="date" class="input flex-1">
            <input v-model="financialFilters.dataFim" type="date" class="input flex-1">
          </div>
        </div>
        <button @click="generateFinancialReport" :disabled="reportsStore.loading" class="btn-primary w-full">
          {{ reportsStore.loading ? 'Gerando...' : 'Gerar Relatório PDF' }}
        </button>
      </div>
      
      <!-- Relatório de Clientes -->
      <div class="card">
        <h2 class="text-xl font-bold mb-2">👥 Relatório de Clientes</h2>
        <p class="text-gray-600 mb-4 text-sm">Lista de clientes com histórico de compras e total gasto.</p>
        <button @click="generateCustomersReport" :disabled="reportsStore.loading" class="btn-primary w-full">
          {{ reportsStore.loading ? 'Gerando...' : 'Gerar Relatório PDF' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useReportsStore } from '@/stores/reports'
import Swal from 'sweetalert2'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const reportsStore = useReportsStore()

const salesFilters = ref({
  dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dataFim: new Date().toISOString().split('T')[0]
})

const financialFilters = ref({
  dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dataFim: new Date().toISOString().split('T')[0]
})

// Relatório de Vendas COM ITENS E FILTRO DE DATA
const generateSalesReport = async () => {
  try {
    Swal.fire({
      title: 'Gerando relatório...',
      text: 'Aguarde enquanto preparamos seu PDF.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    })
    
    const response = await axios.get('/api/sales', { 
      params: { 
        limit: 1000,
        dataInicio: salesFilters.value.dataInicio,
        dataFim: salesFilters.value.dataFim
      } 
    })
    const sales = response.data.data
    
    if (sales.length === 0) {
      Swal.fire('Atenção', 'Nenhuma venda encontrada no período selecionado.', 'warning')
      return
    }
    
    const doc = new jsPDF('landscape')
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Cabeçalho
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('Relatório de Vendas', pageWidth / 2, 20, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    const periodoTexto = `${format(new Date(salesFilters.value.dataInicio), 'dd/MM/yyyy')} até ${format(new Date(salesFilters.value.dataFim), 'dd/MM/yyyy')}`
    doc.text(`Período: ${periodoTexto}`, pageWidth / 2, 28, { align: 'center' })
    
    const totalVendas = sales.reduce((sum, s) => sum + s.total, 0)
    doc.text(`Total de Vendas: ${sales.length} | Faturamento: R$ ${totalVendas.toFixed(2)}`, pageWidth / 2, 36, { align: 'center' })
    
    let startY = 45
    
    // Para cada venda, criar tabela com itens
    for (let i = 0; i < sales.length; i++) {
      const sale = sales[i]
      
      // Informações da venda
      doc.setFontSize(11)
      doc.setFont(undefined, 'bold')
      doc.text(`Venda #${String(sale.numero).padStart(6, '0')}`, 14, startY)
      doc.setFont(undefined, 'normal')
      doc.setFontSize(9)
      doc.text(`Data: ${format(new Date(sale.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, startY + 6)
      doc.text(`Cliente: ${sale.clienteNome || 'Consumidor Final'}`, 100, startY + 6)
      doc.text(`Pagamento: ${sale.formaPagamento}`, 180, startY + 6)
      
      // Tabela de itens
      const itemRows = sale.itens.map(item => [
        item.produtoId?.codigoInterno || '-',
        item.produtoId?.nome || 'Produto removido',
        item.quantidade.toString(),
        item.unidade || 'UN',
        `R$ ${item.precoUnitario.toFixed(2)}`,
        `R$ ${item.total.toFixed(2)}`
      ])
      
      doc.autoTable({
        startY: startY + 10,
        head: [['Código', 'Produto', 'Qtd', 'Un', 'Preço', 'Total']],
        body: itemRows,
        theme: 'striped',
        headStyles: { fillColor: [14, 165, 233], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: 14, right: 14 }
      })
      
      // Total da venda
      const finalY = doc.lastAutoTable.finalY + 5
      doc.setFont(undefined, 'bold')
      doc.setFontSize(10)
      doc.text(`Total da Venda: R$ ${sale.total.toFixed(2)}`, pageWidth - 14, finalY, { align: 'right' })
      
      startY = finalY + 10
      
      // Se estiver perto do fim da página, adicionar nova página
      if (startY > 180) {
        doc.addPage()
        startY = 20
      }
    }
    
    doc.save(`relatorio_vendas_${Date.now()}.pdf`)
    
    Swal.fire({
      icon: 'success',
      title: 'Relatório gerado!',
      text: `${sales.length} vendas incluídas no PDF.`,
      timer: 2000
    })
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    Swal.fire('Erro', 'Falha ao gerar relatório.', 'error')
  }
}

// Relatório de Estoque
const generateInventoryReport = async () => {
  const result = await reportsStore.fetchInventoryReport()
  
  if (!result.success) {
    Swal.fire('Erro', 'Falha ao gerar relatório.', 'error')
    return
  }
  
  const { products, summary } = reportsStore.inventory
  
  const doc = new jsPDF('landscape')
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Cabeçalho
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('Relatório de Estoque', pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, 28, { align: 'center' })
  
  // Resumo
  doc.setFont(undefined, 'bold')
  doc.text(`Total de Produtos: ${summary.totalProdutos}`, 14, 40)
  doc.text(`Produtos sem Estoque: ${summary.produtosSemEstoque}`, 100, 40)
  doc.text(`Estoque Baixo: ${summary.produtosEstoqueBaixo}`, 180, 40)
  
  doc.text(`Valor Total em Estoque (Custo): R$ ${summary.valorTotalEstoque.toFixed(2)}`, 14, 48)
  doc.text(`Valor Total em Estoque (Venda): R$ ${summary.valorTotalVenda.toFixed(2)}`, 100, 48)
  
  // Tabela
  const rows = products.map(p => [
    p.codigoInterno,
    p.nome.substring(0, 30),
    p.categoriaId?.name || '-',
    p.marcaId?.name || '-',
    `${p.estoqueAtual} ${p.unidade}`,
    `R$ ${p.precoCusto.toFixed(2)}`,
    `R$ ${p.precoVenda.toFixed(2)}`,
    p.estoqueAtual <= p.estoqueMinimo ? 'BAIXO' : 'NORMAL'
  ])
  
  doc.autoTable({
    startY: 58,
    head: [['Código', 'Produto', 'Categoria', 'Marca', 'Estoque', 'Custo', 'Venda', 'Status']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [14, 165, 233] },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 50 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 },
      7: { cellWidth: 20 }
    }
  })
  
  doc.save(`relatorio_estoque_${Date.now()}.pdf`)
  
  Swal.fire({
    icon: 'success',
    title: 'Relatório de Estoque gerado!',
    timer: 2000
  })
}

// Relatório Financeiro
const generateFinancialReport = async () => {
  const result = await reportsStore.fetchFinancialReport({
    dataInicio: financialFilters.value.dataInicio,
    dataFim: financialFilters.value.dataFim
  })
  
  if (!result.success) {
    Swal.fire('Erro', 'Falha ao gerar relatório.', 'error')
    return
  }
  
  const { periodo, vendas, caixa, resumo } = reportsStore.financial
  
  const doc = new jsPDF()
  
  // Cabeçalho
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('Relatório Financeiro', 105, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  const periodoTexto = `${format(new Date(periodo.inicio), 'dd/MM/yyyy')} até ${format(new Date(periodo.fim), 'dd/MM/yyyy')}`
  doc.text(`Período: ${periodoTexto}`, 105, 28, { align: 'center' })
  
  // Vendas
  doc.setFont(undefined, 'bold')
  doc.setFontSize(12)
  doc.text('RESUMO DE VENDAS', 14, 45)
  
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  doc.text(`Total de Vendas: ${vendas.quantidade}`, 14, 55)
  doc.text(`Faturamento Total: R$ ${vendas.total.toFixed(2)}`, 14, 63)
  doc.text(`Custo das Vendas: R$ ${vendas.custo.toFixed(2)}`, 14, 71)
  doc.text(`Lucro Bruto: R$ ${vendas.lucro.toFixed(2)}`, 14, 79)
  
  // Caixa
  doc.setFont(undefined, 'bold')
  doc.text('MOVIMENTAÇÕES DE CAIXA', 14, 95)
  
  doc.setFont(undefined, 'normal')
  doc.text(`Total Abertura: R$ ${caixa.totalAbertura.toFixed(2)}`, 14, 105)
  doc.text(`Total Sangrias: R$ ${caixa.totalSangrias.toFixed(2)}`, 14, 113)
  doc.text(`Total Suprimentos: R$ ${caixa.totalSuprimentos.toFixed(2)}`, 14, 121)
  
  // Indicadores
  doc.setFont(undefined, 'bold')
  doc.text('INDICADORES', 14, 137)
  
  doc.setFont(undefined, 'normal')
  doc.text(`Margem de Lucro: ${resumo.margemLucro}%`, 14, 147)
  doc.text(`Ticket Médio: R$ ${resumo.ticketMedio}`, 14, 155)
  
  doc.save(`relatorio_financeiro_${Date.now()}.pdf`)
  
  Swal.fire({
    icon: 'success',
    title: 'Relatório Financeiro gerado!',
    timer: 2000
  })
}

// Relatório de Clientes
const generateCustomersReport = async () => {
  const result = await reportsStore.fetchCustomersReport()
  
  if (!result.success) {
    Swal.fire('Erro', 'Falha ao gerar relatório.', 'error')
    return
  }
  
  const { customers, summary } = reportsStore.customers
  
  const doc = new jsPDF('landscape')
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Cabeçalho
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('Relatório de Clientes', pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Total de Clientes: ${summary.totalClientes} | Clientes Ativos: ${summary.clientesAtivos}`, pageWidth / 2, 30, { align: 'center' })
  doc.text(`Faturamento Total: R$ ${summary.faturamentoTotal.toFixed(2)} | Ticket Médio: R$ ${summary.ticketMedioCliente}`, pageWidth / 2, 38, { align: 'center' })
  
  // Tabela
  const rows = customers.map(c => [
    c.nome,
    c.email || '-',
    c.telefone || '-',
    c.quantidadeCompras.toString(),
    c.ultimaCompra ? format(new Date(c.ultimaCompra), 'dd/MM/yyyy') : 'Nunca',
    `R$ ${c.totalGasto.toFixed(2)}`
  ])
  
  doc.autoTable({
    startY: 48,
    head: [['Nome', 'E-mail', 'Telefone', 'Compras', 'Última Compra', 'Total Gasto']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [14, 165, 233] },
    styles: { fontSize: 8, cellPadding: 2 }
  })
  
  doc.save(`relatorio_clientes_${Date.now()}.pdf`)
  
  Swal.fire({
    icon: 'success',
    title: 'Relatório de Clientes gerado!',
    timer: 2000
  })
}
</script>