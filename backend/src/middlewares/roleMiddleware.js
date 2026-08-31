/**
 * Middleware de Autorização por Cargo.
 * Verifica se o cargo do usuário autenticado está na lista de cargos permitidos para a rota.
 * Uso: roleMiddleware(['ADMINISTRADOR', 'GERENTE'])
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // req.user foi definido pelo middleware 'protect'
    if (!req.user || !req.user.roleId) {
      return res.status(403).json({ success: false, message: 'Acesso negado: cargo não identificado.' });
    }

    const userRoleName = req.user.roleId.name;

    // Verifica se o cargo do usuário está na lista de cargos permitidos
    if (allowedRoles.includes(userRoleName)) {
      next(); // Usuário tem permissão, prossegue
    } else {
      // Usuário não tem permissão para esta ação específica
      return res.status(403).json({ 
        success: false, 
        message: `Acesso negado. Esta ação requer um dos seguintes cargos: ${allowedRoles.join(', ')}.` 
      });
    }
  };
};

module.exports = roleMiddleware;