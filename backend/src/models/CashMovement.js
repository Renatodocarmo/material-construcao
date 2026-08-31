const mongoose = require('mongoose');

const cashMovementSchema = new mongoose.Schema({
  caixaId: { type: mongoose.Schema.Types.ObjectId, ref: 'CashRegister', required: true },
  tipo: { type: String, required: true, enum: ['VENDA', 'ENTRADA', 'SAIDA', 'SANGRIA', 'SUPRIMENTO'], index: true },
  descricao: { type: String, required: true, trim: true },
  valor: { type: Number, required: true, min: [0.01, 'O valor deve ser maior que zero'] },
  formaPagamento: { type: String, enum: ['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'OUTROS'] },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
  observacao: { type: String, trim: true }
}, { timestamps: true });

cashMovementSchema.index({ caixaId: 1, createdAt: -1 });
module.exports = mongoose.model('CashMovement', cashMovementSchema);
