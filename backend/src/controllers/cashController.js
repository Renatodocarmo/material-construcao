/**
 * Controller de Caixa.
 * Gerencia abertura, fechamento e movimentações do caixa.
 */
const CashRegister = require('../models/CashRegister');
const CashMovement = require('../models/CashMovement');
const { registerAudit } = require('../utils/auditHelper');

/**
 * @desc    Abrir um novo caixa
 * @route   POST /api/cash/open
 * @access  Private (GERENTE, VENDEDOR, ADMINISTRADOR)
 */
const openCash = async (req, res) => {
  try {
    const { valorAbertura } = req.body;
    const usuarioId = req.user._id;

    // Verifica se já existe um caixa aberto
    const caixaAberto = await CashRegister.findOne({ status: 'ABERTO' });
    if (caixaAberto) {
      return res.status(400).json({ 
        success: false, 
        message: 'Já existe um caixa aberto. Feche-o antes de abrir um novo.' 
      });
    }

    // Gera número sequencial
    const ultimoCaixa = await CashRegister.findOne().sort({ numero: -1 });
    const numero = ultimoCaixa ? ultimoCaixa.numero + 1 : 1;

    const caixa = await CashRegister.create({
      numero,
      usuarioAberturaId: usuarioId,
      valorAbertura: Number(valorAbertura) || 0,
      status: 'ABERTO',
      dataAbertura: new Date()
    });

    await registerAudit({
      usuarioId,
      acao: 'ABRIR_CAIXA',
      modulo: 'Caixa',
      registroId: caixa._id,
      registroTipo: 'CashRegister',
      dadosNovos: { numero, valorAbertura },
      descricao: `Caixa #${numero} aberto com R$ ${caixa.valorAbertura.toFixed(2)}`,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Caixa aberto com sucesso.',
      data: caixa
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Registrar movimentação no caixa (entrada, saída, sangria, suprimento)
 * @route   POST /api/cash/movements
 * @access  Private
 */
const registerMovement = async (req, res) => {
  try {
    const { tipo, descricao, valor, formaPagamento, observacao } = req.body;
    const usuarioId = req.user._id;

    // Busca o caixa aberto
    const caixa = await CashRegister.findOne({ status: 'ABERTO' });
    if (!caixa) {
      return res.status(400).json({ success: false, message: 'Não há caixa aberto.' });
    }

    const movimentacao = await CashMovement.create({
      caixaId: caixa._id,
      tipo,
      descricao,
      valor: Number(valor),
      formaPagamento,
      usuarioId,
      observacao
    });

    // Atualiza os totais do caixa conforme o tipo
    if (tipo === 'ENTRADA' || tipo === 'SUPRIMENTO') {
      caixa.totalEntradas += Number(valor);
      if (tipo === 'SUPRIMENTO') caixa.totalSuprimentos += Number(valor);
    } else if (tipo === 'SAIDA' || tipo === 'SANGRIA') {
      caixa.totalSaidas += Number(valor);
      if (tipo === 'SANGRIA') caixa.totalSangrias += Number(valor);
    }
    await caixa.save();

    await registerAudit({
      usuarioId,
      acao: tipo === 'SANGRIA' ? 'SANGRIA' : tipo === 'SUPRIMENTO' ? 'SUPRIMENTO' : 'MOVIMENTACAO_ESTOQUE',
      modulo: 'Caixa',
      registroId: movimentacao._id,
      registroTipo: 'CashMovement',
      dadosNovos: { tipo, valor, descricao },
      descricao: `${tipo} de R$ ${Number(valor).toFixed(2)} no caixa #${caixa.numero}: ${descricao}`,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Movimentação registrada com sucesso.',
      data: movimentacao
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Fechar o caixa
 * @route   POST /api/cash/close
 * @access  Private (GERENTE, ADMINISTRADOR)
 */
const closeCash = async (req, res) => {
  try {
    const { valorInformado, observacoesFechamento } = req.body;
    const usuarioId = req.user._id;

    const caixa = await CashRegister.findOne({ status: 'ABERTO' });
    if (!caixa) {
      return res.status(400).json({ success: false, message: 'Não há caixa aberto.' });
    }

    // Calcula o valor esperado: abertura + entradas + vendas - saídas - sangrias + suprimentos
    const valorEsperado = caixa.valorAbertura + caixa.totalEntradas + caixa.totalVendas - caixa.totalSaidas - caixa.totalSangrias + caixa.totalSuprimentos;
    const diferenca = Number(valorInformado) - valorEsperado;

    caixa.usuarioFechamentoId = usuarioId;
    caixa.status = 'FECHADO';
    caixa.dataFechamento = new Date();
    caixa.valorEsperado = valorEsperado;
    caixa.valorInformado = Number(valorInformado);
    caixa.diferenca = diferenca;
    caixa.observacoesFechamento = observacoesFechamento;
    await caixa.save();

    await registerAudit({
      usuarioId,
      acao: 'FECHAR_CAIXA',
      modulo: 'Caixa',
      registroId: caixa._id,
      registroTipo: 'CashRegister',
      dadosNovos: { valorEsperado, valorInformado, diferenca },
      descricao: `Caixa #${caixa.numero} fechado. Diferença: R$ ${diferenca.toFixed(2)}`,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Caixa fechado com sucesso.',
      data: caixa
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Obter o caixa atual (aberto)
 * @route   GET /api/cash/current
 * @access  Private
 */
const getCurrentCash = async (req, res) => {
  try {
    const caixa = await CashRegister.findOne({ status: 'ABERTO' })
      .populate('usuarioAberturaId', 'name')
      .populate('usuarioFechamentoId', 'name');

    if (!caixa) {
      return res.status(404).json({ success: false, message: 'Nenhum caixa aberto.' });
    }

    // Busca as movimentações do caixa
    const movimentacoes = await CashMovement.find({ caixaId: caixa._id })
      .populate('usuarioId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { caixa, movimentacoes }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar caixa.', error: error.message });
  }
};

module.exports = { openCash, registerMovement, closeCash, getCurrentCash };