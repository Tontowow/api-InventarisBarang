'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Barang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'owner' });
    }
  }
  Barang.init({
    nama_barang: DataTypes.STRING,
    
    // --- TAMBAHKAN KOLOM BARU DI SINI ---
    deskripsi_barang: {
      type: DataTypes.TEXT,
      allowNull: true // Kita set `true` agar data lama tidak error
    },
    // ------------------------------------

    gambar_barang: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Barang',
  });
  return Barang;
};