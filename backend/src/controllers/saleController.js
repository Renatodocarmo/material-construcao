/**
 * Controller de Vendas.
 * Este é o controller mais crítico do sistema.
 * 
 * CONCEITOS IMPORTANTES IMPLEMENTADOS:
 * 
 * 1. TRANSAÇÕES MONGODB (Session + Transaction):
 *    Uma venda envolve múltiplas operações:
 *    - Criar o documento da venda
 *    - Atualizar o estoque de cada produto
 *    - Registrar movimentação de estoque
 *    - Registrar movimentação de caixa
 *    - Registrar auditoria
 *    
 *    Se QUALQUER uma dessas operações falhar, TODAS são desfeitas (rollback).
 *    Isso evita que uma venda fique "pela metade" (ex: venda registrada mas estoque não baixado).
 * 
 * 2. CONCORRÊNCIA NO ESTOQUE:
 *    Dois vendedores podem tentar vender o último produto ao mesmo tempo.
 *    Usamos updateOne com condição (estoqueAtual >= quantidade) para garantir
 *    que apenas um consiga vender. O outro receberá erro "estoque insuficiente".
 * 
 * 3. PRESERVAÇÃO DE PREÇOS HISTÓRICOS:
 *    Os dados do produto (nome, preço) são COPIADOS para o item da venda.
 *    Se o produto mudar de preço no futuro, a venda antiga continua correta.
 */

const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const CashRegister = require('../models/CashRegister');
const CashMovement = require('../models/CashMovement');
const { registerAudit } = require('../utils/auditHelper');

/**
 * @desc    Criar uma nova venda (PDV)
 * @route   POST /api/sales
 * @access  Private (VENDEDOR, GERENTE, ADMINISTRADOR)
 * 
 * Fluxo da venda:
 * 1. Inicia transação MongoDB
 * 2. Valida cada item (produto existe, estoque suficiente)
 * 3. Baixa estoque de cada produto (com verificação atômica de concorrência)
 * 4. Registra movimentação de estoque para cada produto
 * 5. Cria o documento da venda com itens embutidos
 * 6. Registra movimentação no caixa (se houver caixa aberto)
 * 7. Registra auditoria
 * 8. Commit da transação (efetiva tudo)
 * 9. Se qualquer etapa falhar: abort (desfaz tudo)
 */
const createSale = async (req, res) => {
  // Inicia uma sessão do MongoDB para usar transação
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { itens, clienteId, formaPagamento, pagamentos, descontoGeral, frete, observacoes } = req.body;
    const usuarioId = req.user._id;

    // Validação básica: deve ter pelo menos um item
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      throw new Error('A venda deve conter pelo menos um item.');
    }

    // Validação de pagamentos
    if (!formaPagamento || !pagamentos || pagamentos.length === 0) {
      throw new Error('É necessário informar a forma de pagamento e os pagamentos.');
    }

    // Calcula o total dos pagamentos para verificar troco
    const totalPago = pagamentos.reduce((sum, p) => sum + Number(p.valor), 0);

    // =========================================================================
    // ETAPA 1: Validar e processar cada item da venda
    // =========================================================================
    const itensProcessados = [];
    let subtotal = 0;

    for (const item of itens) {
      // Busca o produto pelo ID
      const produto = await Product.findById(item.produtoId).session(session);

      if (!produto || !produto.isActive) {
        throw new Error(`Produto não encontrado ou inativo: ${item.produtoId}`);
      }

      // Valida estoque disponível
      if (produto.estoqueAtual < item.quantidade) {
        throw new Error(`Estoque insuficiente para "${produto.nome}". Disponível: ${produto.estoqueAtual}, Solicitado: ${item.quantidade}`);
      }

      // Valida quantidade mínima
      if (item.quantidade <= 0) {
        throw new Error(`A quantidade do item deve ser maior que zero.`);
      }

      // Calcula o total do item: (quantidade * preço) - desconto
      const descontoItem = item.desconto || 0;
      const totalItem = (item.quantidade * produto.precoVenda) - descontoItem;

      if (totalItem < 0) {
        throw new Error(`O total do item "${produto.nome}" não pode ser negativo.`);
      }

      subtotal += totalItem;

      // Cria o item processado com dados "congelados" do produto
      itensProcessados.push({
        produtoId: produto._id,
        codigoInterno: produto.codigoInterno,
        nomeProduto: produto.nome,
        unidade: produto.unidade,
        quantidade: item.quantidade,
        precoUnitario: produto.precoVenda, // Preço atual do produto (preservado na venda)
        desconto: descontoItem,
        total: totalItem
      });
    }

    // =========================================================================
    // ETAPA 2: Calcular totais da venda
    // =========================================================================
    const descontoGeralNum = Number(descontoGeral) || 0;
    const freteNum = Number(frete) || 0;
    const totalVenda = subtotal - descontoGeralNum + freteNum;

    if (totalVenda < 0) {
      throw new Error('O total da venda não pode ser negativo.');
    }

    // Valida se o pagamento cobre o total (exceto FIADO)
    if (formaPagamento !== 'FIADO' && totalPago < totalVenda) {
      throw new Error(`Valor pago (R$ ${totalPago.toFixed(2)}) é menor que o total da venda (R$ ${totalVenda.toFixed(2)}).`);
    }

    // Calcula troco (apenas para pagamento em dinheiro)
    let troco = 0;
    if (formaPagamento === 'DINHEIRO' && totalPago > totalVenda) {
      troco = totalPago - totalVenda;
    }

    // =========================================================================
    // ETAPA 3: Gerar número sequencial da venda
    // =========================================================================
    const ultimaVenda = await Sale.findOne().sort({ numero: -1 }).session(session);
    const numeroVenda = ultimaVenda ? ultimaVenda.numero + 1 : 1;

    // =========================================================================
    // ETAPA 4: Buscar dados do cliente (se informado)
    // =========================================================================
    let clienteNome = 'Consumidor Final';
    let clienteCpfCnpj = '';

    if (clienteId) {
      // Precisamos importar Customer aqui para evitar circular dependency
      const Customer = require('../models/Customer');
      const cliente = await Customer.findById(clienteId).session(session);
      if (cliente) {
        clienteNome = cliente.nome;
        clienteCpfCnpj = cliente.cpfCnpj || '';
      }
    }

    // =========================================================================
    // ETAPA 5: Baixar estoque de cada produto (COM CONTROLE DE CONCORRÊNCIA)
    // =========================================================================
    // Usamos updateOne com condição para evitar condição de corrida.
    // A condição "estoqueAtual >= quantidade" garante que apenas uma venda
    // consiga baixar o estoque se houver quantidade limitada.
    for (const item of itensProcessados) {
      const resultado = await Product.updateOne(
        { 
          _id: item.produtoId, 
          estoqueAtual: { $gte: item.quantidade } // Condição atômica de concorrência
        },
        { 
          $inc: { estoqueAtual: -item.quantidade } // Decrementa estoque
        }
      ).session(session);

      // Se nenhum documento foi modificado, significa que o estoque acabou entre a validação e a atualização
      if (resultado.modifiedCount === 0) {
        throw new Error(`Conflito de estoque no produto "${item.nomeProduto}". Tente novamente.`);
      }

      // Busca o produto atualizado para registrar o saldo correto
      const produtoAtualizado = await Product.findById(item.produtoId).session(session);

      // Registra a movimentação de estoque
      await StockMovement.create([{
        produtoId: item.produtoId,
        tipo: 'SAIDA',
        quantidade: item.quantidade,
        motivo: `Venda #${String(numeroVenda).padStart(6, '0')}`,
        usuarioId: usuarioId,
        documentoReferencia: null, // Será preenchido após criar a venda
        saldoAposMovimentacao: produtoAtualizado.estoqueAtual
      }], { session });
    }

    // =========================================================================
    // ETAPA 6: Criar o documento da venda
    // =========================================================================
    const venda = await Sale.create([{
      numero: numeroVenda,
      clienteId: clienteId || null,
      clienteNome,
      clienteCpfCnpj,
      itens: itensProcessados,
      subtotal,
      descontoGeral: descontoGeralNum,
      frete: freteNum,
      total: totalVenda,
      formaPagamento,
      pagamentos,
      troco,
      vendedorId: usuarioId,
      status: 'FINALIZADA',
      observacoes
    }], { session });

    const vendaCriada = venda[0];

    // =========================================================================
    // ETAPA 7: Atualizar o documentoReferencia das movimentações de estoque
    // =========================================================================
    await StockMovement.updateMany(
      { 
        usuarioId: usuarioId, 
        tipo: 'SAIDA', 
        documentoReferencia: null,
        createdAt: { $gte: new Date(Date.now() - 60000) } // Último minuto
      },
      { documentoReferencia: String(vendaCriada._id) }
    ).session(session);

    // =========================================================================
    // ETAPA 8: Registrar movimentação no caixa (se houver caixa aberto)
    // =========================================================================
    const caixaAberto = await CashRegister.findOne({ status: 'ABERTO' }).session(session);
    
    if (caixaAberto) {
      // Atualiza o caixa com o valor da venda
      caixaAberto.totalVendas += totalVenda;
      await caixaAberto.save({ session });

      // Registra a movimentação no caixa
      await CashMovement.create([{
        caixaId: caixaAberto._id,
        tipo: 'VENDA',
        descricao: `Venda #${String(numeroVenda).padStart(6, '0')}`,
        valor: totalVenda,
        formaPagamento: formaPagamento === 'DIVIDIDO' ? 'DINHEIRO' : formaPagamento,
        usuarioId: usuarioId,
        vendaId: vendaCriada._id
      }], { session });

      // Anexa o caixa à venda
      vendaCriada.caixaId = caixaAberto._id;
      await vendaCriada.save({ session });
    }

    // =========================================================================
    // ETAPA 9: Commit da transação (efetiva todas as alterações)
    // =========================================================================
    await session.commitTransaction();

    // =========================================================================
    // ETAPA 10: Registrar auditoria (FORA da transação - não crítica)
    // =========================================================================
    await registerAudit({
      usuarioId,
      acao: 'CRIAR_VENDA',
      modulo: 'Vendas',
      registroId: vendaCriada._id,
      registroTipo: 'Sale',
      dadosNovos: { numero: numeroVenda, total: totalVenda, itens: itensProcessados.length },
      descricao: `Venda #${String(numeroVenda).padStart(6, '0')} criada - Total: R$ ${totalVenda.toFixed(2)}`,
      ip: req.ip
    });

    // Retorna a venda criada com dados populados
    const vendaCompleta = await Sale.findById(vendaCriada._id)
      .populate('vendedorId', 'name')
      .populate('clienteId', 'nome cpfCnpj');

    res.status(201).json({
      success: true,
      message: 'Venda realizada com sucesso!',
      data: vendaCompleta
    });

  } catch (error) {
    // Se qualquer erro ocorrer, aborta a transação (desfaz TUDO)
    await session.abortTransaction();
    console.error('❌ Erro ao criar venda:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao processar venda.'
    });
  } finally {
    // Sempre encerra a sessão, independente do resultado
    session.endSession();
  }
};

/**
 * @desc    Listar vendas com filtros e paginação
 * @route   GET /api/sales
 * @access  Private
 */
const getSales = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, dataInicio, dataFim } = req.query;
    const query = {};

    // Filtro de busca
    if (search) {
      query.$or = [
        { numero: { $regex: search, $options: 'i' } },
        { clienteNome: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtro de período
    if (dataInicio || dataFim) {
      query.createdAt = {};
      if (dataInicio) query.createdAt.$gte = new Date(dataInicio);
      if (dataFim) query.createdAt.$lte = new Date(dataFim);
    }

    const sales = await Sale.find(query)
      .populate('clienteId', 'nome')
      .populate('vendedorId', 'name')
      .populate('itens.produtoId', 'nome codigoInterno')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Sale.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sales.length,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: sales
    });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};

/**
 * @desc    Obter uma venda específica pelo número ou ID
 * @route   GET /api/sales/:id
 * @access  Private
 */
const getSaleById = async (req, res) => {
  try {
    // Tenta buscar por ID ou por número da venda
    const venda = await Sale.findOne({
      $or: [
        { _id: req.params.id },
        { numero: req.params.id }
      ]
    })
      .populate('vendedorId', 'name email')
      .populate('clienteId', 'nome cpfCnpj telefone email endereco')
      .populate('itens.produtoId', 'codigoInterno nome');

    if (!venda) {
      return res.status(404).json({ success: false, message: 'Venda não encontrada.' });
    }

    res.status(200).json({ success: true, data: venda });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar venda.', error: error.message });
  }
};

/**
 * @desc    Cancelar uma venda
 * @route   PUT /api/sales/:id/cancel
 * @access  Private (GERENTE, ADMINISTRADOR)
 * 
 * O cancelamento também usa transação porque:
 * - Precisa devolver o estoque
 * - Precisa registrar movimentação de estoque
 * - Precisa ajustar o caixa
 * - Tudo deve acontecer junto ou nada acontece
 */
const cancelSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { motivoCancelamento } = req.body;
    const usuarioId = req.user._id;

    if (!motivoCancelamento) {
      throw new Error('O motivo do cancelamento é obrigatório.');
    }

    // Busca a venda
    const venda = await Sale.findById(req.params.id).session(session);

    if (!venda) {
      throw new Error('Venda não encontrada.');
    }

    if (venda.status === 'CANCELADA') {
      throw new Error('Esta venda já está cancelada.');
    }

    // =========================================================================
    // ETAPA 1: Devolver estoque de cada item
    // =========================================================================
    for (const item of venda.itens) {
      // Atualização atômica: incrementa o estoque
      await Product.updateOne(
        { _id: item.produtoId },
        { $inc: { estoqueAtual: item.quantidade } }
      ).session(session);

      // Busca o produto atualizado para registrar saldo
      const produtoAtualizado = await Product.findById(item.produtoId).session(session);

      // Registra movimentação de estoque (DEVOLUÇÃO)
      await StockMovement.create([{
        produtoId: item.produtoId,
        tipo: 'DEVOLUCAO',
        quantidade: item.quantidade,
        motivo: `Cancelamento da Venda #${String(venda.numero).padStart(6, '0')}`,
        usuarioId: usuarioId,
        documentoReferencia: String(venda._id),
        saldoAposMovimentacao: produtoAtualizado.estoqueAtual
      }], { session });
    }

    // =========================================================================
    // ETAPA 2: Ajustar o caixa (se a venda estava vinculada a um caixa)
    // =========================================================================
    if (venda.caixaId) {
      const caixa = await CashRegister.findById(venda.caixaId).session(session);
      if (caixa && caixa.status === 'ABERTO') {
        caixa.totalVendas -= venda.total;
        await caixa.save({ session });

        await CashMovement.create([{
          caixaId: caixa._id,
          tipo: 'SAIDA',
          descricao: `Cancelamento da Venda #${String(venda.numero).padStart(6, '0')}`,
          valor: venda.total,
          usuarioId: usuarioId,
          vendaId: venda._id
        }], { session });
      }
    }

    // =========================================================================
    // ETAPA 3: Atualizar status da venda
    // =========================================================================
    venda.status = 'CANCELADA';
    venda.motivoCancelamento = motivoCancelamento;
    venda.canceladoPor = usuarioId;
    venda.dataCancelamento = new Date();
    await venda.save({ session });

    // Commit da transação
    await session.commitTransaction();

    // Auditoria
    await registerAudit({
      usuarioId,
      acao: 'CANCELAR_VENDA',
      modulo: 'Vendas',
      registroId: venda._id,
      registroTipo: 'Sale',
      dadosAnteriores: { status: 'FINALIZADA' },
      dadosNovos: { status: 'CANCELADA', motivo: motivoCancelamento },
      descricao: `Venda #${String(venda.numero).padStart(6, '0')} cancelada. Motivo: ${motivoCancelamento}`,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Venda cancelada com sucesso. Estoque devolvido.',
      data: venda
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Erro ao cancelar venda:', error);
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

module.exports = { createSale, getSales, getSaleById, cancelSale };