const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function test() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');
    
    // Importar o Model
    const User = require('./src/models/User');
    
    // Buscar usuário
    const user = await User.findOne({ email: 'a@a.com' }).select('+password');
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      process.exit(1);
    }
    
    console.log('✅ Usuário encontrado:', user.email);
    console.log('📝 Nome:', user.name);
    console.log('🔐 Senha no banco (primeiros 30 chars):', user.password.substring(0, 30) + '...');
    console.log('✅ É bcrypt?', user.password.startsWith('$2'));
    console.log('');
    
    // Testar senha "123456"
    const senhaTeste = '1234567';
    console.log(`🔍 Testando senha: "${senhaTeste}"`);
    
    const isMatch = await bcrypt.compare(senhaTeste, user.password);
    console.log('✅ bcrypt.compare resultado:', isMatch);
    
    // Testar método matchPassword
    const isMatch2 = await user.matchPassword(senhaTeste);
    console.log('✅ user.matchPassword resultado:', isMatch2);
    
    console.log('');
    if (isMatch) {
      console.log('🎉 SUCESSO! A senha está correta e o bcrypt está funcionando.');
    } else {
      console.log('❌ FALHOU! A senha "123456" não bate com o que está no banco.');
      console.log('💡 Possível causa: A senha foi criptografada duas vezes ou está errada.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(' Erro:', error.message);
    process.exit(1);
  }
}

test();