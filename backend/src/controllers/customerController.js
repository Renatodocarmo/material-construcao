/**
 * Controller de Clientes.
 * Gerencia o cadastro de clientes (pessoas físicas e jurídicas).
 */
const Customer = require('../models/Customer');
const { registerAudit } = require('../utils/auditHelper');

/**
 * @desc    Listar clientes com busca e paginação
 * @route   GET /api/customers
 * @access  Private
 */
const getCustomers = async (req, res) => {
  try {
    const query = { isActive: true };

    // Busca por nome, CPF/CNPJ ou telefone
    if (req.query.search) {
      query.$or = [
        { nome: { $regex: req.query.search, $options: 'i' } },
        { cpfCnpj: { $regex: req.query.search, $options: 'i' } },
        { telefone: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const customers = await Customer.find(query)
      .sort({ nome: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Customer.countDocuments(query);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: customers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar clientes.', error: error.message });
  }
};

/**
 * @desc    Criar novo cliente
 * @route   POST /api/customers
 * @access  Private (VENDEDOR, GERENTE, ADMINISTRADOR)
 */
const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);

    await registerAudit({
      usuarioId: req.user._id,
      acao: 'CRIAR_CLIENTE',
      modulo: 'Clientes',
      registroId: customer._id,
      registroTipo: 'Customer',
      dadosNovos: { nome: customer.nome, cpfCnpj: customer.cpfCnpj },
      descricao: `Cliente "${customer.nome}" cadastrado`,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Cliente cadastrado com sucesso.',
      data: customer
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'CPF/CNPJ já cadastrado.' });
    }
    res.status(400).json({ success: false, message: 'Erro ao cadastrar cliente.', error: error.message });
  }
};

/**
 * @desc    Atualizar cliente
 * @route   PUT /api/customers/:id
 * @access  Private
 */
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
    }

    await registerAudit({
      usuarioId: req.user._id,
      acao: 'EDITAR_CLIENTE',
      modulo: 'Clientes',
      registroId: customer._id,
      registroTipo: 'Customer',
      dadosNovos: req.body,
      descricao: `Cliente "${customer.nome}" atualizado`,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Cliente atualizado com sucesso.',
      data: customer
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao atualizar cliente.', error: error.message });
  }
};

module.exports = { getCustomers, createCustomer, updateCustomer };