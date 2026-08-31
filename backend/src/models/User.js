/**
 * Modelo de Usuário.
 * Contém informações de autenticação e vínculo com o cargo (Role).
 * A senha é criptografada automaticamente antes de salvar no banco.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'O e-mail é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'A senha é obrigatória'],
    minlength: 6,
    select: false // Não retorna a senha nas consultas por padrão
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'O cargo é obrigatório']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Middleware para criptografar a senha ANTES de salvar no banco
// Isso roda automaticamente quando você faz user.save() ou User.create()
userSchema.pre('save', async function(next) {
  // Só criptografa se a senha foi modificada ou é um novo usuário
  if (!this.isModified('password')) {
    return next();
  }
  
  // Gera um salt e criptografa a senha
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar a senha fornecida com a senha hasheada no banco
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);