const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/authMiddleware')
const AccountReceivable = require('../models/AccountReceivable')
const AccountPayable = require('../models/AccountPayable')

router.use(protect)

// Contas a Receber
router.get('/accounts/receivable', async (req, res) => {
  try {
    const accounts = await AccountReceivable.find().populate('clienteId', 'nome')
    res.json({ success: true, data: accounts })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/accounts/receivable', async (req, res) => {
  try {
    const account = await AccountReceivable.create(req.body)
    res.status(201).json({ success: true, data: account })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.put('/accounts/receivable/:id/pay', async (req, res) => {
  try {
    const account = await AccountReceivable.findByIdAndUpdate(
      req.params.id,
      {
        status: 'PAGO',
        dataPagamento: req.body.dataPagamento,
        formaPagamento: req.body.formaPagamento,
        valorPago: req.body.valor || null
      },
      { new: true }
    )
    res.json({ success: true, data: account })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

// Contas a Pagar
router.get('/accounts/payable', async (req, res) => {
  try {
    const accounts = await AccountPayable.find().populate('fornecedorId', 'razaoSocial')
    res.json({ success: true, data: accounts })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/accounts/payable', async (req, res) => {
  try {
    const account = await AccountPayable.create(req.body)
    res.status(201).json({ success: true, data: account })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.put('/accounts/payable/:id/pay', async (req, res) => {
  try {
    const account = await AccountPayable.findByIdAndUpdate(
      req.params.id,
      {
        status: 'PAGO',
        dataPagamento: req.body.dataPagamento,
        formaPagamento: req.body.formaPagamento,
        valorPago: req.body.valor || null
      },
      { new: true }
    )
    res.json({ success: true, data: account })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

module.exports = router