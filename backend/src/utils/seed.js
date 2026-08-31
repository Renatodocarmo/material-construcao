require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Role = require('../models/Role');
const User = require('../models/User');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');

const seedData = async () => {
  try {
    await connectDB();
    console.log('🌱 Iniciando processo de seed...');

    // 1. Limpar dados existentes (SEM transação)
    await Role.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    console.log('️ Dados antigos removidos');

    // 2. Criar Cargos (SEM transação)
    const roles = await Role.insertMany([
      { name: 'ADMINISTRADOR', description: 'Acesso total ao sistema', permissions: ['ALL'] },
      { name: 'GERENTE', description: 'Gestão de vendas, estoque e financeiro', permissions: ['vendas', 'estoque', 'financeiro', 'relatorios'] },
      { name: 'VENDEDOR', description: 'Acesso a vendas, clientes e orçamentos', permissions: ['vendas', 'clientes', 'orcamentos'] },
      { name: 'ESTOQUISTA', description: 'Acesso a entradas, saídas e produtos', permissions: ['estoque', 'produtos'] }
    ]);
    console.log('✅ Cargos criados');

    // 3. Criar Usuário Administrador Padrão
    const adminRole = roles.find(r => r.name === 'ADMINISTRADOR');
    await User.create({
      name: 'Administrador do Sistema',
      email: 'admin@loja.com',
      password: 'admin123',
      roleId: adminRole._id,
      isActive: true
    });
    console.log('✅ Usuário admin criado');

    // 4. Criar Categorias e Marcas
    const categorias = await Category.insertMany([
      { name: 'Cimento' }, 
      { name: 'Areia e Brita' }, 
      { name: 'Tijolos e Blocos' },
      { name: 'Ferramentas' }, 
      { name: 'Hidráulica' }, 
      { name: 'Elétrica' }
    ]);
    console.log('✅ Categorias criadas');

    const marcas = await Brand.insertMany([
      { name: 'Votorantim' }, 
      { name: 'Nacional' }, 
      { name: 'Tramontina' }, 
      { name: 'Tigre' }
    ]);
    console.log('✅ Marcas criadas');

    // 5. Criar Produtos de Exemplo
    const catCimento = categorias.find(c => c.name === 'Cimento');
    const marcaVotorantim = marcas.find(m => m.name === 'Votorantim');

    await Product.create({
      codigoInterno: 'CIM001',
      codigoBarras: '7891234567890',
      nome: 'Cimento CP II 50kg',
      descricao: 'Cimento Portland composto, saco de 50kg',
      categoriaId: catCimento._id,
      marcaId: marcaVotorantim._id,
      unidade: 'SC',
      precoCusto: 28.00,
      precoVenda: 35.90,
      estoqueAtual: 100,
      estoqueMinimo: 20,
      isActive: true
    });
    console.log('✅ Produtos criados');

    console.log('\n✅ Seed concluído com sucesso!');
    console.log('👤 Usuário Admin: admin@loja.com | Senha: admin123');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
};

seedData();