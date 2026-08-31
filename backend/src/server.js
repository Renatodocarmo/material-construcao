require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

const app = express();
connectDB();

// =========================================================================
// IMPORTANTE: Importar TODOS os modelos para que o Mongoose os registre
// Isso é necessário porque alguns modelos têm referências (ref) entre si
// Exemplo: User referencia Role, Sale referencia Product, etc.
// Se não importarmos todos aqui, o populate() vai falhar com 
// "MissingSchemaError: Schema hasn't been registered for model..."
// =========================================================================
require('./models/Role');
require('./models/User');
require('./models/Category');
require('./models/Brand');
require('./models/Product');
require('./models/StockMovement');
require('./models/Customer');
require('./models/Supplier');
require('./models/Sale');
require('./models/CashRegister');
require('./models/CashMovement');
require('./models/Purchase');
require('./models/AccountReceivable');
require('./models/AccountPayable');
require('./models/Quote');
require('./models/Return');
require('./models/AuditLog');
require('./models/StoreSettings');

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Muitas requisições deste IP, tente novamente mais tarde.' }
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API está rodando corretamente', timestamp: new Date() });
});

// Rotas da API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/cash', require('./routes/cashRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api', require('./routes/accountRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Manipulador global de erros (SEMPRE por último)
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err.stack);
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: isProduction ? 'Ocorreu um erro interno no servidor.' : err.message,
    details: !isProduction ? err.stack : undefined 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} em modo ${process.env.NODE_ENV || 'development'}`);
});