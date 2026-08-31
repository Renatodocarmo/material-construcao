const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { codigoInterno: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('categoriaId', 'name')
      .populate('marcaId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: products
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      codigoInterno, codigoBarras, nome, descricao,
      categoria, marca, unidade, precoCusto, precoVenda,
      estoqueAtual, estoqueMinimo, estoqueMaximo, isActive
    } = req.body;

    const product = await Product.create({
      codigoInterno,
      codigoBarras,
      nome,
      descricao,
      unidade,
      precoCusto: Number(precoCusto),
      precoVenda: Number(precoVenda),
      estoqueAtual: Number(estoqueAtual) || 0,
      estoqueMinimo: Number(estoqueMinimo) || 0,
      estoqueMaximo: estoqueMaximo ? Number(estoqueMaximo) : null,
      isActive: isActive !== undefined ? isActive : true
      // categoriaId e marcaId serão null por enquanto
    });

    const productPopulated = await Product.findById(product._id)
      .populate('categoriaId', 'name')
      .populate('marcaId', 'name');

    res.status(201).json({
      success: true,
      data: productPopulated
    });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Erro ao criar produto' 
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categoriaId', 'name').populate('marcaId', 'name');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }
    product.isActive = false;
    await product.save();
    res.status(200).json({ success: true, message: 'Produto desativado' });
  } catch (error) {
    console.error('Erro ao desativar produto:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};