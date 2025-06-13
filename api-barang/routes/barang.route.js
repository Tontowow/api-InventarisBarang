// routes/barang.routes.js

const express = require('express');
const router = express.Router();
const controller = require('../controllers/barang.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', controller.getAllBarangs);
router.get('/:id', controller.getBaramgById);

// Protected routes (butuh token)
router.post('/', [verifyToken, upload.single('gambar_barang')], controller.createBarang);
router.put('/:id', [verifyToken, upload.single('gambar_barang')], controller.updateBarang);
router.delete('/:id', [verifyToken], controller.deleteBarang);

// PASTIKAN BARIS INI ADA DI PALING BAWAH
module.exports = router;