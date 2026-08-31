/**
 * Controller de Fornecedores.
 * Gerencia o cadastro de fornecedores da loja.
 */
const Supplier = require('../models/Supplier');
const { registerAudit } = require('../utils/auditHelper');

const getSuppliers = async (req, res) => {
  try {
    const query = { isActive: true };

    if (req.query.search) {
      query.$or = [
        { razaoSocial: { $regex: req.query.search, $options: 'i' } },
        { nomeFantasia: { $regex: req.query.search, $options: 'i' } },
        { cnpj: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const suppliers = await Supplier.find(query)
      .sort({ razaoSocial: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Supplier.countDocuments(query);

    res.status(200).json({
      success: true,
      count: suppliers.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: suppliers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar fornecedores.', error: error.message });
  }
};

const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);

    await registerAudit({
      usuarioId: req.user._id,
      acao: 'CRIAR_FORNECEDOR',
      modulo: 'Fornecedores',
      registroId: supplier._id,
      registroTipo: 'Supplier',
      dadosNovos: { razaoSocial: supplier.razaoSocial, cnpj: supplier.cnpj },
      descricao: `Fornecedor "${supplier.razaoSocial}" cadastrado`,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Fornecedor cadastrado com sucesso.',
      data: supplier
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'CNPJ já cadastrado.' });
    }
    res.status(400).json({ success: false, message: 'Erro ao cadastrar fornecedor.', error: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Fornecedor não encontrado.' });
    }

    await registerAudit({
      usuarioId: req.user._id,
      acao: 'EDITAR_FORNECEDOR',
      modulo: 'Fornecedores',
      registroId: supplier._id,
      registroTipo: 'Supplier',
      dadosNovos: req.body,
      descricao: `Fornecedor "${supplier.razaoSocial}" atualizado`,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Fornecedor atualizado com sucesso.',
      data: supplier
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao atualizar fornecedor.', error: error.message });
  }
};

module.exports = { getSuppliers, createSupplier, updateSupplier };