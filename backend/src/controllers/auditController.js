/**
 * Controller de Auditoria.
 * Permite consultar os logs de auditoria do sistema.
 * Apenas ADMINISTRADOR e GERENTE podem acessar.
 */
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Listar logs de auditoria com filtros
 * @route   GET /api/audit
 * @access  Private (ADMINISTRADOR, GERENTE)
 */
const getAuditLogs = async (req, res) => {
  try {
    const query = {};

    if (req.query.acao) query.acao = req.query.acao;
    if (req.query.usuarioId) query.usuarioId = req.query.usuarioId;
    if (req.query.modulo) query.modulo = req.query.modulo;

    if (req.query.dataInicio || req.query.dataFim) {
      query.createdAt = {};
      if (req.query.dataInicio) query.createdAt.$gte = new Date(req.query.dataInicio);
      if (req.query.dataFim) query.createdAt.$lte = new Date(req.query.dataFim);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(query)
      .populate('usuarioId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar logs de auditoria.', error: error.message });
  }
};

module.exports = { getAuditLogs };