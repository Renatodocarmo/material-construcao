/**
 * Middleware de Autenticação e Autorização.
 * Intercepta a requisição, verifica a presença e validade do Token JWT no cabeçalho 'Authorization'.
 * Se válido, decodifica o token e anexa o ID e o Cargo do usuário ao objeto 'req' para uso nas rotas.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware para proteger rotas (verificar se está logado)
 */
const protect = async (req, res, next) => {
  let token;

  // Verifica se o cabeçalho Authorization existe e começa com 'Bearer '
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extrai o token (remove a palavra 'Bearer ' e o espaço)
      token = req.headers.authorization.split(' ')[1];

      // Verifica a validade do token usando a chave secreta do .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Busca o usuário no banco para garantir que ele ainda existe e está ativo
      const user = await User.findById(decoded.id).select('-password').populate('roleId');

      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: 'Usuário não encontrado ou inativo.' });
      }

      // Anexa o usuário à requisição para que os controllers possam usá-lo
      req.user = user;
      next(); // Prossegue para o próximo middleware ou controller
    } catch (error) {
      console.error('Erro na validação do token:', error);
      return res.status(401).json({ success: false, message: 'Não autorizado, token inválido ou expirado.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Não autorizado, nenhum token fornecido.' });
  }
};

/**
 * Middleware para autorizar baseado no cargo (Role)
 * Uso: authorize('ADMINISTRADOR', 'GERENTE')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Verifica se o usuário existe e tem um cargo definido
    if (!req.user || !req.user.roleId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado: cargo não definido.' 
      });
    }

    // Verifica se o cargo do usuário está na lista de cargos permitidos
    if (!allowedRoles.includes(req.user.roleId.name)) {
      return res.status(403).json({ 
        success: false, 
        message: `Acesso negado: seu cargo (${req.user.roleId.name}) não tem permissão para esta ação.` 
      });
    }

    // Se passou pela verificação, prossegue
    next();
  };
};

// Exporta AMBOS os middlewares
module.exports = { protect, authorize };