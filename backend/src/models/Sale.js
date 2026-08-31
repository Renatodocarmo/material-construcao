const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  produtoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  codigoInterno: { type: String, required: true },
  nomeProduto: { type: String, required: true },
  unidade: { type: String, required: true },
  quantidade: {
    type: Number,
    required: true,
    min: [0.01, 'A quantidade deve ser maior que zero']
  },
  precoUnitario: {
    type: Number,
    required: true,
    min: [0, 'O preço unitário não pode ser negativo']
  },
  desconto: {
    type: Number,
    default: 0,
    min: [0, 'O desconto não pode ser negativo']
  },
  total: {
    type: Number,
    required: true
  }
}, { _id: true });

const saleSchema = new mongoose.Schema({
  numero: {
    type: Number,
    unique: true,
    index: true
  },
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  clienteNome: { type: String, default: 'Consumidor Final' },
  clienteCpfCnpj: { type: String, default: '' },
  
  itens: [saleItemSchema],
  
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'O subtotal não pode ser negativo']
  },
  descontoGeral: {
    type: Number,
    default: 0,
    min: [0, 'O desconto geral não pode ser negativo']
  },
  frete: {
    type: Number,
    default: 0,
    min: [0, 'O frete não pode ser negativo']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'O total não pode ser negativo']
  },
  
  formaPagamento: {
    type: String,
    enum: ['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'BOLETO', 'TRANSFERENCIA', 'FIADO', 'DIVIDIDO'],
    required: true
  },
  pagamentos: [{
    forma: { type: String, required: true },
    valor: { type: Number, required: true }
  }],
  troco: {
    type: Number,
    default: 0
  },
  
  vendedorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caixaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CashRegister'
  },
  
  status: {
    type: String,
    enum: ['FINALIZADA', 'CANCELADA', 'PENDENTE'],
    default: 'FINALIZADA',
    index: true
  },
  motivoCancelamento: {
    type: String,
    trim: true
  },
  canceladoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dataCancelamento: {
    type: Date
  },
  
  observacoes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

saleSchema.index({ createdAt: -1, status: 1 });
saleSchema.index({ vendedorId: 1, createdAt: -1 });

module.exports = mongoose.model('Sale', saleSchema);