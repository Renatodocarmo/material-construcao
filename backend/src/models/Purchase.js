const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema({
  produtoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  nomeProduto: { type: String, required: true },
  quantidade: { type: Number, required: true, min: [0.01, 'A quantidade deve ser maior que zero'] },
  valorUnitario: { type: Number, required: true, min: [0, 'O valor unitário não pode ser negativo'] },
  subtotal: { type: Number, required: true }
}, { _id: true });

const purchaseSchema = new mongoose.Schema({
  numero: { type: Number, unique: true, index: true },
  fornecedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  numeroDocumento: { type: String, trim: true },
  itens: [purchaseItemSchema],
  subtotal: { type: Number, required: true },
  desconto: { type: Number, default: 0 },
  frete: { type: Number, default: 0 },
  total: { type: Number, required: true, min: [0, 'O total não pode ser negativo'] },
  data: { type: Date, default: Date.now },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['FINALIZADA', 'CANCELADA'], default: 'FINALIZADA' },
  observacao: { type: String, trim: true }
}, { timestamps: true });

purchaseSchema.index({ fornecedorId: 1, createdAt: -1 });
module.exports = mongoose.model('Purchase', purchaseSchema);
