/**
 * Controller de Gestão de Usuários.
 * Responsável por criar, listar, editar e excluir usuários do sistema.
 * IMPORTANTE: NÃO criptografar senha manualmente - o Model faz isso!
 */
const User = require('../models/User');
const Role = require('../models/Role');

/**
 * @desc    Obter todos os usuários
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('roleId', 'name permissions')
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor ao buscar usuários.' });
  }
};

/**
 * @desc    Criar novo usuário
 * @route   POST /api/users
 * @access  Private/Admin
 * NOTA: NÃO criptografamos a senha aqui - o middleware do Model faz isso!
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, roleId, isActive } = req.body;

    // Verificar se e-mail já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'E-mail já cadastrado no sistema.' 
      });
    }

    // Criar usuário - O middleware pre('save') do Model vai criptografar a senha
    const user = await User.create({
      name,
      email,
      password, // ← Senha em texto puro - Model vai criptografar
      roleId,
      isActive: isActive !== undefined ? isActive : true
    });

    const userPopulated = await User.findById(user._id)
      .populate('roleId', 'name permissions')
      .select('-password');

    res.status(201).json({
      success: true,
      data: userPopulated
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Erro ao criar usuário' 
    });
  }
};

/**
 * @desc    Atualizar usuário
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res) => {
  try {
    const { name, email, roleId, isActive, password } = req.body;

    const updateData = { name, email, roleId, isActive };

    // Se uma nova senha foi fornecida, adicionamos (Model vai criptografar)
    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('roleId', 'name permissions').select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Erro ao atualizar usuário' 
    });
  }
};

/**
 * @desc    Desativar usuário (Soft Delete)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    // Não permitir desativar o próprio usuário
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Você não pode desativar sua própria conta' 
      });
    }

    // Desativar em vez de deletar (soft delete)
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor' 
    });
  }
};

/**
 * @desc    Excluir usuário permanentemente (Hard Delete)
 * @route   DELETE /api/users/:id/permanent
 * @access  Private/Admin
 */
const deleteUserPermanent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    // NÃO permitir excluir o próprio usuário
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Você não pode excluir sua própria conta' 
      });
    }

    // Excluir permanentemente do banco
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Usuário excluído permanentemente com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir usuário permanentemente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor' 
    });
  }
};

/**
 * @desc    Obter cargos disponíveis
 * @route   GET /api/users/roles
 * @access  Private
 */
const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    console.error('Erro ao buscar cargos:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor ao buscar cargos.' });
  }
};

// Exporta todas as funções
module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  deleteUserPermanent,
  getRoles
};