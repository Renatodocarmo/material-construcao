/**
 * Helper de Auditoria.
 * Função reutilizável para registrar logs de auditoria de forma padronizada.
 * 
 * Por que um helper?
 * - Evita duplicação de código em todos os controllers
 * - Garante que TODAS as ações importantes sejam registradas
 * - Mantém consistência no formato dos logs
 * 
 * Uso:
 * await registerAudit({
 *   usuarioId: req.user._id,
 *   acao: 'CRIAR_VENDA',
 *   modulo: 'Vendas',
 *   registroId: venda._id,
 *   registroTipo: 'Sale',
 *   dadosNovos: { total: 150.00 },
 *   descricao: 'Venda #001 criada',
 *   ip: req.ip
 * });
 */
const AuditLog = require('../models/AuditLog');

const registerAudit = async ({
  usuarioId,
  acao,
  modulo,
  registroId = null,
  registroTipo = null,
  dadosAnteriores = null,
  dadosNovos = null,
  descricao,
  ip = null,
  userAgent = null
}) => {
  try {
    await AuditLog.create({
      usuarioId,
      acao,
      modulo,
      registroId: registroId ? String(registroId) : null,
      registroTipo,
      dadosAnteriores,
      dadosNovos,
      descricao,
      ip,
      userAgent
    });
  } catch (error) {
    // Se a auditoria falhar, logamos no console mas NÃO interrompemos a operação principal
    // A venda deve ser registrada mesmo que a auditoria falhe (prioridade ao negócio)
    console.error('⚠️ Erro ao registrar auditoria:', error.message);
  }
};

module.exports = { registerAudit };