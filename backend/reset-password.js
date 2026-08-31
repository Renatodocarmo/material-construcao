/**
 * Script para resetar senhas de usuários
 * Executar: node reset-password.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

async function reset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');
    
    const User = require('./src/models/User');
    
    // Lista de usuários para resetar
    const usuarios = ['a@a.com', 'b@b.com', 'c@c.com'];
    const novaSenha = '123456';
    
    console.log('🔄 Resetando senhas...\n');
    
    for (const email of usuarios) {
      const user = await User.findOne({ email });
      
      if (user) {
        // Definir a senha - o middleware do Model vai criptografar CORRETAMENTE
        user.password = novaSenha;
        await user.save();
        console.log(`✅ Senha resetada para: ${email}`);
      } else {
        console.log(`⚠️ Usuário não encontrado: ${email}`);
      }
    }
    
    console.log('\n🎉 Todas as senhas foram resetadas para: 123456');
    console.log('Agora você pode fazer login com:');
    console.log('  - a@a.com / 123456');
    console.log('  - b@b.com / 123456');
    console.log('  - c@c.com / 123456');
    console.log('  - admin@loja.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

reset();