const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  acao: {
    type: String,
    required: true,
    index: true,
    enum: ['LOGIN', 'LOGOUT', 'CRIAR_PRODUTO', 'EDITAR_PRODUTO', 'DESATIVAR_PRODUTO', 'CRIAR_VENDA', 'CANCELAR_VENDA', 'CRIAR_COMPRA', 'CANCELAR_COMPRA', 'MOVIMENTACAO_ESTOQUE', 'AJUSTE_ESTOQUE', 'CRIAR_CLIENTE', 'EDITAR_CLIENTE', 'CRIAR_FORNECEDOR', 'EDITAR_FORNECEDOR', 'ABRIR_CAIXA', 'FECHAR_CAIXA', 'SANGRIA', 'SUPRIMENTO', 'CRIAR_PAGAMENTO', 'EDITAR_PAGAMENTO', 'ALTERAR_PRECO', 'DEVOLUCAO', 'CRIAR_USUARIO', 'EDITAR_USUARIO', 'ALTERAR_CONFIGURACOES']
  },
  modulo: { type: String, required: true },
  registroId: { type: String },
  registroTipo: { type: String },
  dadosAnteriores: { type: mongoose.Schema.Types.Mixed },
  dadosNovos: { type: mongoose.Schema.Types.Mixed },
  descricao: { type: String, required: true, trim: true },
  ip: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

auditLogSchema.index({ usuarioId: 1, createdAt: -1 });
auditLogSchema.index({ acao: 1, createdAt: -1 });
auditLogSchema.index({ registroId: 1 });
module.exports = mongoose.model('AuditLog', auditLogSchema);
