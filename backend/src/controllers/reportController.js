const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const CashRegister = require('../models/CashRegister');
const mongoose = require('mongoose');

/**
 * @desc    Gerar Relatório de Estoque
 * @route   GET /api/reports/inventory
 * @access  Private
 */
const getInventoryReport = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('categoriaId', 'name')
      .populate('marcaId', 'name')
      .sort({ nome: 1 });

    // Calcular totais
    const totalProdutos = products.length;
    const valorTotalEstoque = products.reduce((sum, p) => 
      sum + (p.estoqueAtual * p.precoCusto), 0
    );
    const valorTotalVenda = products.reduce((sum, p) => 
      sum + (p.estoqueAtual * p.precoVenda), 0
    );
    const produtosEstoqueBaixo = products.filter(p => 
      p.estoqueAtual <= p.estoqueMinimo
    ).length;
    const produtosSemEstoque = products.filter(p => p.estoqueAtual === 0).length;

    res.status(200).json({
      success: true,
      data: {
        products,
        summary: {
          totalProdutos,
          valorTotalEstoque,
          valorTotalVenda,
          produtosEstoqueBaixo,
          produtosSemEstoque
        }
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de estoque:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório' });
  }
};

/**
 * @desc    Gerar Relatório Financeiro
 * @route   GET /api/reports/financial
 * @access  Private
 */
const getFinancialReport = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    // Período padrão: últimos 30 dias
    const inicio = dataInicio ? new Date(dataInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fim = dataFim ? new Date(dataFim) : new Date();

    // Vendas do período
    const sales = await Sale.find({
      createdAt: { $gte: inicio, $lte: fim },
      status: 'FINALIZADA'
    });

    // Caixas do período
    const cashRegisters = await CashRegister.find({
      dataAbertura: { $gte: inicio, $lte: fim }
    });

    // Calcular totais de vendas
    const totalVendas = sales.reduce((sum, s) => sum + s.total, 0);
    const totalCustoVendas = sales.reduce((sum, s) => {
      const custoItens = s.itens.reduce((sumItem, item) => 
        sumItem + (item.quantidade * (item.precoUnitario * 0.7)), 0
      );
      return sum + custoItens;
    }, 0);

    // Calcular movimentações de caixa
    const totalAbertura = cashRegisters.reduce((sum, c) => sum + c.valorAbertura, 0);
    const totalSangrias = cashRegisters.reduce((sum, c) => sum + c.totalSangrias, 0);
    const totalSuprimentos = cashRegisters.reduce((sum, c) => sum + c.totalSuprimentos, 0);

    // Calcular lucro
    const lucroBruto = totalVendas - totalCustoVendas;
    const margemLucro = totalVendas > 0 ? (lucroBruto / totalVendas) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        periodo: { inicio, fim },
        vendas: {
          quantidade: sales.length,
          total: totalVendas,
          custo: totalCustoVendas,
          lucro: lucroBruto
        },
        caixa: {
          totalAbertura,
          totalSangrias,
          totalSuprimentos
        },
        resumo: {
          margemLucro: margemLucro.toFixed(2),
          ticketMedio: sales.length > 0 ? (totalVendas / sales.length).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório financeiro:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório' });
  }
};

/**
 * @desc    Gerar Relatório de Clientes
 * @route   GET /api/reports/customers
 * @access  Private
 */
const getCustomersReport = async (req, res) => {
  try {
    const customers = await Customer.find({ isActive: true })
      .sort({ nome: 1 });

    // Para cada cliente, buscar total gasto e última compra
    const customersWithData = await Promise.all(customers.map(async (customer) => {
      const sales = await Sale.find({ 
        clienteId: customer._id,
        status: 'FINALIZADA'
      }).sort({ createdAt: -1 });

      const totalGasto = sales.reduce((sum, s) => sum + s.total, 0);
      const ultimaCompra = sales.length > 0 ? sales[0].createdAt : null;
      const quantidadeCompras = sales.length;

      return {
        ...customer.toObject(),
        totalGasto,
        ultimaCompra,
        quantidadeCompras
      };
    }));

    // Ordenar por total gasto (clientes que mais compram)
    customersWithData.sort((a, b) => b.totalGasto - a.totalGasto);

    const totalClientes = customersWithData.length;
    const clientesAtivos = customersWithData.filter(c => c.quantidadeCompras > 0).length;
    const faturamentoTotal = customersWithData.reduce((sum, c) => sum + c.totalGasto, 0);

    res.status(200).json({
      success: true,
      data: {
        customers: customersWithData,
        summary: {
          totalClientes,
          clientesAtivos,
          faturamentoTotal,
          ticketMedioCliente: clientesAtivos > 0 ? (faturamentoTotal / clientesAtivos).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de clientes:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar relatório' });
  }
};

module.exports = {
  getInventoryReport,
  getFinancialReport,
  getCustomersReport
};