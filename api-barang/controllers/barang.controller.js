const { Barang } = require('../models');
const fs = require('fs');

// Fungsi untuk mendapatkan semua film
exports.getAllBarangs = async (req, res) => {
    try {
        const barangs = await Barang.findAll({
            order: [['createdAt', 'DESC']] // Urutkan dari yang terbaru
        });
        res.send(barangs);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Fungsi untuk membuat film baru
exports.createBarang = async (req, res) => {
    try {
        const { nama_barang, deskripsi_barang } = req.body;
        
        if (!req.file) {
            return res.status(400).send({ message: "Gambar harus di-upload." });
        }

        const imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;

        const newBarang = await Film.create({
            nama_barang,
            deskripsi_barang, // <-- Menyimpan deskripsi
            gambar_barang: imageUrl,
            userId: req.userId
        });
        res.status(201).send(newBarang);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Fungsi untuk mengupdate film
exports.updateBarang = async (req, res) => {
    try {
        const barang = await Barang.findByPk(req.params.id);
        if (!barang) {
            return res.status(404).send({ message: "Barang not found" });
        }

        if (barang.userId !== req.userId) {
            return res.status(403).send({ message: "Forbidden: You don't own this barang" });
        }
        
        let imageUrl = barang.gambar_barang;
        if (req.file) {
            imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
        }
        
        const { nama_barang, deskripsi_barang } = req.body;
        await barang.update({
            nama_barang: nama_barang || barang.nama_barang,
            deskripsi: deskripsi || film.deskripsi, // <-- Update deskripsi
            gambar_barang: imageUrl
        });
        res.send({ message: "Barang updated successfully!", barang });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Fungsi untuk menghapus film
exports.deleteBarang = async (req, res) => {
    try {
        const barang = await Barang.findByPk(req.params.id);
        if (!barang) {
            return res.status(404).send({ message: "Barang not found" });
        }
        if (barang.userId !== req.userId) {
            return res.status(403).send({ message: "Forbidden" });
        }

        // Hapus file gambar dari server
        const filename = film.gambar_barang.split('/').pop();
        if (filename) {
            fs.unlink(`uploads/${filename}`, (err) => {
                if (err) console.error("Gagal menghapus file gambar lama:", err);
            });
        }
        
        await barang.destroy();
        res.send({ message: "Barang deleted successfully!" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Fungsi get by ID tidak perlu diubah
exports.getBarangById = async (req, res) => {
    // ... (kode tidak berubah)
};