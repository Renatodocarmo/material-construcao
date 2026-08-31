const mongoose = require('mongoose');

const accountPayableSchema = new mongoose.Schema({
  fornecedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  compraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase' },
  descricao: { type: String, required: true, trim: true },
  categoria: { type: String, trim: true },
  valor: { type: Number, required: true, min: [0.01, 'O valor deve ser maior que zero'] },
  valorPago: { type: Number, default: 0 },
  dataVencimento: { type: Date, required: true },
  dataPagamento: { type: Date },
  status: { type: String, enum: ['PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO'], default: 'PENDENTE', index: true },
  formaPagamento: { type: String, enum: ['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'BOLETO', 'TRANSFERENCIA'] },
  observacao: { type: String, trim: true }
}, { timestamps: true });

accountPayableSchema.index({ dataVencimento: 1, status: 1 });
module.exports = mongoose.model('AccountPayable', accountPayableSchema);
