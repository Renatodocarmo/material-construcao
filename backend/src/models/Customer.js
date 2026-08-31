const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  nome: { type: String, required: [true, 'O nome do cliente é obrigatório'], trim: true },
  cpfCnpj: { type: String, trim: true, index: true },
  telefone: { type: String, trim: true },
  whatsapp: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  endereco: {
    cep: { type: String, trim: true },
    estado: { type: String, trim: true },
    cidade: { type: String, trim: true },
    bairro: { type: String, trim: true },
    rua: { type: String, trim: true },
    numero: { type: String, trim: true },
    complemento: { type: String, trim: true }
  },
  observacoes: { type: String, trim: true },
  totalComprado: { type: Number, default: 0 },
  ultimaCompra: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
