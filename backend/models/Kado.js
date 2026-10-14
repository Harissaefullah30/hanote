// ============================================
// MODEL: KADO RAHASIA
// ============================================
// Cetakan data Kado untuk MongoDB
// 1 dokumen per ruangan (bukan array)
// ============================================

const mongoose = require('mongoose');

const KadoSchema = new mongoose.Schema({
    // Ruangan (kunci unik — 1 ruangan = 1 dokumen)
    ruangan: {
        type: String,
        required: true,
        unique: true
    },
    
    // Statistik
    totalDibuka: {
        type: Number,
        default: 0
    },
    kadoHariIni: {
        type: Number,
        default: 0
    },
    
    // Riwayat kado (array of objects)
    riwayat: {
        type: Array,
        default: []
    },
    
    // Kado yang udah dibuka hari ini (array of angka)
    kadoTerbuka: {
        type: Array,
        default: []
    },
    
    // Tanggal terakhir reset
    tanggalTerakhir: {
        type: String,
        default: null
    },
    
    // Waktu dibuat
    dibuat: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Kado', KadoSchema);