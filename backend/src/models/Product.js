const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  codigoInterno: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  codigoBarras: {
    type: String,
    trim: true,
    sparse: true
  },
  nome: {
    type: String,
    required: [true, 'O nome do produto é obrigatório'],
    trim: true
  },
  descricao: {
    type: String,
    trim: true
  },
  categoriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  marcaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: false
  },
  unidade: {
    type: String,
    required: true,
    enum: ['UN', 'KG', 'G', 'M', 'M2', 'M3', 'L', 'CX', 'SC', 'PC', 'KIT'],
    default: 'UN'
  },
  precoCusto: {
    type: Number,
    required: true,
    min: [0, 'O preço de custo não pode ser negativo']
  },
  precoVenda: {
    type: Number,
    required: true,
    min: [0, 'O preço de venda não pode ser negativo']
  },
  estoqueAtual: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'O estoque não pode ser negativo']
  },
  estoqueMinimo: {
    type: Number,
    required: true,
    default: 5,
    min: [0, 'O estoque mínimo não pode ser negativo']
  },
  estoqueMaximo: {
    type: Number,
    default: null,
    min: [0, 'O estoque máximo não pode ser negativo']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para status do estoque
productSchema.virtual('statusEstoque').get(function() {
  if (this.estoqueAtual === 0) return 'SEM_ESTOQUE';
  if (this.estoqueAtual <= this.estoqueMinimo) return 'ESTOQUE_BAIXO';
  return 'NORMAL';
});

// Exportação CORRETA do Model
module.exports = mongoose.model('Product', productSchema);