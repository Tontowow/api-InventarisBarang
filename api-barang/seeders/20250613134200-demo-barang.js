'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Fungsi 'up' akan dijalankan ketika Anda menjalankan seeder
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Barangs', [ // Ganti 'Barangs' dengan nama tabel Anda jika berbeda
      {
        nama_barang: 'Monitor LED 24 Inch Full HD',
        deskripsi_barang: 'Monitor dengan resolusi 1920x1080, refresh rate 75Hz, cocok untuk bekerja dan hiburan.',
        gambar_barang: 'https://placehold.co/600x400/E67E22/white?text=Monitor+24"',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_barang: 'SSD NVMe 1TB Gen4',
        deskripsi_barang: 'Solid State Drive dengan kecepatan baca/tulis super cepat, mempercepat loading sistem dan aplikasi.',
        gambar_barang: 'https://placehold.co/600x400/2ECC71/white?text=SSD+1TB',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_barang: 'RAM 16GB Kit (2x8GB) DDR4 3200MHz',
        deskripsi_barang: 'Kit RAM dual channel untuk performa multitasking yang lancar dan gaming tanpa lag.',
        gambar_barang: 'https://placehold.co/600x400/3498DB/white?text=RAM+16GB',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_barang: 'Power Supply 650W 80+ Bronze',
        deskripsi_barang: 'PSU handal dengan sertifikasi efisiensi 80+ Bronze, menjamin pasokan daya yang stabil.',
        gambar_barang: 'https://placehold.co/600x400/9B59B6/white?text=PSU+650W',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_barang: 'Casing PC ATX Mid-Tower',
        deskripsi_barang: 'Casing dengan aliran udara yang baik, panel samping kaca tempered, dan filter debu.',
        gambar_barang: 'https://placehold.co/600x400/1ABC9C/white?text=Casing+PC',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  // Fungsi 'down' akan dijalankan ketika Anda membatalkan (undo) seeder
  down: async (queryInterface, Sequelize) => {
    // Ini akan menghapus semua data yang dimasukkan oleh seeder 'up'
    await queryInterface.bulkDelete('Barangs', null, {}); // Ganti 'Barangs' dengan nama tabel Anda jika berbeda
  }
};