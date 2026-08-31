const mongoose = require('mongoose');

const cashRegisterSchema = new mongoose.Schema({
  numero: {
    type: Number,
    unique: true,
    index: true
  },
  usuarioAberturaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usuarioFechamentoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  valorAbertura: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'O valor de abertura não pode ser negativo']
  },
  status: {
    type: String,
    enum: ['ABERTO', 'FECHADO'],
    default: 'ABERTO',
    index: true
  },
  dataAbertura: {
    type: Date,
    default: Date.now
  },
  dataFechamento: {
    type: Date
  },
  totalVendas: { type: Number, default: 0 },
  totalEntradas: { type: Number, default: 0 },
  totalSaidas: { type: Number, default: 0 },
  totalSangrias: { type: Number, default: 0 },
  totalSuprimentos: { type: Number, default: 0 },
  valorEsperado: { type: Number, default: 0 },
  valorInformado: { type: Number, default: 0 },
  diferenca: { type: Number, default: 0 },
  observacoesFechamento: { type: String, trim: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('CashRegister', cashRegisterSchema);