/**
 * Modelo de Cargo (Role).
 * Define os níveis de permissão do sistema.
 * Usamos um array fixo no enum para garantir que apenas cargos válidos sejam criados.
 */
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome do cargo é obrigatório'],
    unique: true,
    enum: ['ADMINISTRADOR', 'GERENTE', 'VENDEDOR', 'ESTOQUISTA'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: {
    type: [String],
    default: [] // Ex: ['criar_venda', 'ver_relatorio_financeiro']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('Role', roleSchema);