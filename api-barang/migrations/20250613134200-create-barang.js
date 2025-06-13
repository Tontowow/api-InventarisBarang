'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Fungsi 'up' dieksekusi saat Anda menjalankan migrasi (db:migrate)
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Barangs', { // Ganti 'Barangs' jika nama tabel Anda berbeda
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama_barang: {
        type: Sequelize.STRING,
        allowNull: false
      },
      deskripsi_barang: {
        type: Sequelize.TEXT,
        allowNull: true // Deskripsi boleh kosong
      },
      gambar_barang: {
        type: Sequelize.STRING,
        allowNull: true // Link gambar boleh kosong
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  
  // Fungsi 'down' dieksekusi saat Anda membatalkan migrasi (db:migrate:undo)
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Barangs'); // Hapus tabel jika migrasi dibatalkan
  }
};