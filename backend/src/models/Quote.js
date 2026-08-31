const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({
  produtoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  codigoInterno: { type: String, required: true },
  nomeProduto: { type: String, required: true },
  unidade: { type: String, required: true },
  quantidade: { type: Number, required: true, min: 0.01 },
  precoUnitario: { type: Number, required: true, min: 0 },
  desconto: { type: Number, default: 0 },
  total: { type: Number, required: true }
}, { _id: true });

const quoteSchema = new mongoose.Schema({
  numero: { type: Number, unique: true, index: true },
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  clienteNome: { type: String, default: 'Consumidor Final' },
  itens: [quoteItemSchema],
  subtotal: { type: Number, required: true },
  descontoGeral: { type: Number, default: 0 },
  total: { type: Number, required: true },
  validade: { type: Date },
  status: { type: String, enum: ['ABERTO', 'ENVIADO', 'APROVADO', 'RECUSADO', 'EXPIRADO', 'CONVERTIDO'], default: 'ABERTO', index: true },
  vendaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
  vendedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  observacoes: { type: String, trim: true }
}, { timestamps: true });

quoteSchema.index({ clienteId: 1, createdAt: -1 });
module.exports = mongoose.model('Quote', quoteSchema);
