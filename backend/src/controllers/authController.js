/**
 * Controller de Autenticação.
 * Responsável por validar as credenciais do usuário e gerar token JWT.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Função auxiliar para gerar o token JWT
const generateToken = (id, roleId) => {
  return jwt.sign({ id, roleId }, process.env.JWT_SECRET, {
    expiresIn: '8h' // O token expira em 8 horas
  });
};

/**
 * @desc    Autenticar usuário e retornar token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validar se e-mail e senha foram fornecidos
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Por favor, forneça e-mail e senha.' });
    }

    // 2. Buscar usuário pelo e-mail e incluir o campo 'password'
    const user = await User.findOne({ email }).select('+password').populate('roleId');

    // 3. Verificar se o usuário existe e se está ativo
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas ou usuário inativo.' });
    }

    // 4. Comparar a senha fornecida com a senha hasheada no banco
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    // 5. Gerar o token JWT
    const token = generateToken(user._id, user.roleId._id);

    // 6. Retornar os dados do usuário (sem a senha) e o token
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.roleId ? user.roleId.name : 'USUARIO',
        permissions: user.roleId ? user.roleId.permissions : [],
        token: token
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor ao tentar fazer login.' });
  }
};

/**
 * @desc    Obter dados do usuário logado
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('roleId').select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.roleId ? user.roleId.name : 'USUARIO',
        permissions: user.roleId ? user.roleId.permissions : []
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor ao buscar dados do usuário.' });
  }
};

module.exports = {
  loginUser,
  getMe
};