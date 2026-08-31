/**
 * Controller de Configurações da Loja.
 * Gerencia as informações da loja que aparecem nos PDFs.
 * Existe apenas UM documento deste tipo (singleton).
 */
const StoreSettings = require('../models/StoreSettings');
const { registerAudit } = require('../utils/auditHelper');

/**
 * @desc    Obter configurações da loja
 * @route   GET /api/settings
 * @access  Private
 */
const getSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    
    // Se não existir, cria um documento vazio
    if (!settings) {
      settings = await StoreSettings.create({
        nome: 'Minha Loja de Material de Construção'
      });
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar configurações.', error: error.message });
  }
};

/**
 * @desc    Atualizar configurações da loja
 * @route   PUT /api/settings
 * @access  Private (ADMINISTRADOR, GERENTE)
 */
const updateSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    
    if (!settings) {
      settings = await StoreSettings.create(req.body);
    } else {
      settings = await StoreSettings.findOneAndUpdate({}, req.body, { 
        new: true, 
        runValidators: true,
        upsert: true 
      });
    }

    await registerAudit({
      usuarioId: req.user._id,
      acao: 'ALTERAR_CONFIGURACOES',
      modulo: 'Configurações',
      registroId: settings._id,
      registroTipo: 'StoreSettings',
      dadosNovos: req.body,
      descricao: 'Configurações da loja atualizadas',
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Configurações atualizadas com sucesso.',
      data: settings
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao atualizar configurações.', error: error.message });
  }
};

module.exports = { getSettings, updateSettings };