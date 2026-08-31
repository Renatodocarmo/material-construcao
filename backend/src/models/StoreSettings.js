const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  razaoSocial: { type: String, trim: true },
  cnpjCpf: { type: String, trim: true },
  inscricaoEstadual: { type: String, trim: true },
  telefone: { type: String, trim: true },
  whatsapp: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  endereco: {
    cep: { type: String, trim: true },
    estado: { type: String, trim: true },
    cidade: { type: String, trim: true },
    bairro: { type: String, trim: true },
    rua: { type: String, trim: true },
    numero: { type: String, trim: true }
  },
  logo: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
