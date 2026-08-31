const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
  produtoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  nomeProduto: { type: String, required: true },
  quantidade: { type: Number, required: true, min: 0.01 },
  precoUnitario: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: true });

const returnSchema = new mongoose.Schema({
  numero: { type: Number, unique: true, index: true },
  vendaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  itens: [returnItemSchema],
  total: { type: Number, required: true },
  motivo: { type: String, required: true, trim: true },
  observacao: { type: String, trim: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['REGISTRADA', 'CANCELADA'], default: 'REGISTRADA' }
}, { timestamps: true });

module.exports = mongoose.model('Return', returnSchema);
