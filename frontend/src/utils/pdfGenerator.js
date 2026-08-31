import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Gera PDF de comprovante de venda
 */
export const generateSalePDF = (sale, storeSettings = null) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Cabeçalho
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text(storeSettings?.nome || 'Material Construção', pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  if (storeSettings?.endereco) {
    doc.text(`${storeSettings.endereco.rua || ''}, ${storeSettings.endereco.numero || ''}`, pageWidth / 2, 28, { align: 'center' })
    doc.text(`${storeSettings.endereco.cidade || ''} - ${storeSettings.endereco.estado || ''}`, pageWidth / 2, 33, { align: 'center' })
  }
  if (storeSettings?.telefone) {
    doc.text(`Tel: ${storeSettings.telefone}`, pageWidth / 2, 38, { align: 'center' })
  }
  
  // Linha separadora
  doc.setDrawColor(0)
  doc.line(10, 42, pageWidth - 10, 42)
  
  // Informações da venda
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('COMPROVANTE DE VENDA', pageWidth / 2, 50, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Nº: ${String(sale.numero).padStart(6, '0')}`, 10, 60)
  doc.text(`Data: ${format(new Date(sale.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth - 10, 60, { align: 'right' })
  doc.text(`Cliente: ${sale.clienteNome || 'Consumidor Final'}`, 10, 67)
  doc.text(`Vendedor: ${sale.vendedorId?.name || '-'}`, pageWidth - 10, 67, { align: 'right' })
  
  // Tabela de itens
  const items = sale.itens.map(item => [
    item.codigoInterno,
    item.nomeProduto,
    item.quantidade.toString(),
    item.unidade,
    `R$ ${item.precoUnitario.toFixed(2)}`,
    `R$ ${item.total.toFixed(2)}`
  ])
  
  doc.autoTable({
    startY: 75,
    head: [['Código', 'Produto', 'Qtd', 'Un', 'Preço', 'Total']],
    body: items,
    theme: 'striped',
    headStyles: { fillColor: [14, 165, 233] },
    styles: { fontSize: 9 }
  })
  
  // Totais
  const finalY = doc.lastAutoTable.finalY + 10
  doc.setFont(undefined, 'bold')
  doc.text(`Subtotal: R$ ${sale.subtotal.toFixed(2)}`, pageWidth - 10, finalY, { align: 'right' })
  if (sale.descontoGeral > 0) {
    doc.text(`Desconto: R$ ${sale.descontoGeral.toFixed(2)}`, pageWidth - 10, finalY + 7, { align: 'right' })
  }
  if (sale.frete > 0) {
    doc.text(`Frete: R$ ${sale.frete.toFixed(2)}`, pageWidth - 10, finalY + 14, { align: 'right' })
  }
  doc.setFontSize(12)
  doc.text(`TOTAL: R$ ${sale.total.toFixed(2)}`, pageWidth - 10, finalY + 24, { align: 'right' })
  
  // Pagamento
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Forma de Pagamento: ${sale.formaPagamento}`, 10, finalY + 35)
  if (sale.troco > 0) {
    doc.text(`Troco: R$ ${sale.troco.toFixed(2)}`, 10, finalY + 42)
  }
  
  // Rodapé
  doc.setFontSize(8)
  doc.text('Documento gerado eletronicamente.', pageWidth / 2, 280, { align: 'center' })
  
  doc.save(`venda_${String(sale.numero).padStart(6, '0')}.pdf`)
}

/**
 * Gera PDF de relatório de vendas
 */
export const generateSalesReportPDF = (sales, period = '') => {
  const doc = new jsPDF('landscape')
  const pageWidth = doc.internal.pageSize.getWidth()
  
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('Relatório de Vendas', pageWidth / 2, 20, { align: 'center' })
  
  if (period) {
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(`Período: ${period}`, pageWidth / 2, 28, { align: 'center' })
  }
  
  const totalVendas = sales.reduce((sum, s) => sum + s.total, 0)
  const totalItens = sales.reduce((sum, s) => sum + s.itens.length, 0)
  
  doc.text(`Total de Vendas: ${sales.length} | Total de Itens: ${totalItens} | Faturamento: R$ ${totalVendas.toFixed(2)}`, pageWidth / 2, 36, { align: 'center' })
  
  const rows = sales.map(sale => [
    String(sale.numero).padStart(6, '0'),
    format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    sale.clienteNome || 'Consumidor Final',
    sale.formaPagamento,
    sale.itens.length.toString(),
    `R$ ${sale.total.toFixed(2)}`,
    sale.status
  ])
  
  doc.autoTable({
    startY: 45,
    head: [['Nº', 'Data', 'Cliente', 'Pagamento', 'Itens', 'Total', 'Status']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [14, 165, 233] }
  })
  
  doc.save(`relatorio_vendas_${Date.now()}.pdf`)
}