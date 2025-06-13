require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path'); // Diperlukan untuk express.static

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Membuat folder 'uploads' bisa diakses secara publik lewat URL
// Pastikan folder 'uploads' ada di root proyek Anda
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- HANYA ADA SATU DEKLARASI RUTE DI SINI ---
const authRoutes = require('./routes/auth.routes.js');
const barangRoutes = require('./routes/barang.routes.js');

// Menggunakan Rute
app.use('/api/auth', authRoutes);
app.use('/api/barangs', barangRoutes);

// Rute dasar
app.get('/', (req, res) => {
    res.send('Selamat Datang di inventaris barang api! Waktu server: ' + new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});