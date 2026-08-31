/**
 * Modelo de Movimentação de Estoque.
 * Garante o histórico imutável de todas as entradas e saídas.
 * O campo 'documentoReferencia' permite vincular essa movimentação a uma Venda, Compra ou Ajuste.
 */
const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  produtoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  tipo: {
    type: String,
    required: true,
    enum: ['ENTRADA', 'SAIDA', 'AJUSTE', 'DEVOLUCAO', 'PERDA', 'TRANSFERENCIA']
  },
  quantidade: {
    type: Number,
    required: true,
    min: [0.01, 'A quantidade deve ser maior que zero']
  },
  motivo: {
    type: String,
    required: true,
    trim: true
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentoReferencia: {
    type: String, // Ex: ID da Venda, ID da Compra, ou 'AJUSTE_MANUAL'
    trim: true
  },
  observacao: {
    type: String,
    trim: true
  },
  // Armazena o saldo do produto APÓS esta movimentação, para facilitar auditoria histórica
  saldoAposMovimentacao: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Índice para buscar rapidamente o histórico de um produto específico
stockMovementSchema.index({ produtoId: 1, createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);