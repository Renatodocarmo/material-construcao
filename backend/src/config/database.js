/**
 * Configuração da conexão com o MongoDB usando Mongoose.
 * Este arquivo é responsável por estabelecer a conexão com o banco de dados
 * e tratar eventos como conexão bem-sucedida, erros e desconexões.
 * 
 * Utilizamos variáveis de ambiente para não expor credenciais no código.
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Opções de conexão recomendadas para Mongoose moderno
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // O Mongoose 6+ já usa a nova engine por padrão, mas é bom ser explícito sobre estabilidade
      serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos para falhar rápido se o DB estiver fora
    });

    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    
    // Escuta o evento de desconexão para fins de log
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB desconectado. Tentando reconectar...');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão com MongoDB:', err);
    });

  } catch (error) {
    console.error('❌ Falha ao conectar ao MongoDB:', error.message);
    // Em produção, você pode querer encerrar o processo se o DB for crítico
    process.exit(1);
  }
};

module.exports = connectDB;