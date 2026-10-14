// ============================================
// MODEL: KEUANGAN (DOMPETAKU)
// ============================================
// Cetakan data Keuangan untuk MongoDB
// ============================================

const mongoose = require('mongoose');

const KeuanganSchema = new mongoose.Schema({
    // Data utama
    nama: {
        type: String,
        required: true
    },
    jumlah: {
        type: Number,
        required: true
    },
    tanggal: {
        type: String,
        required: true
    },
    
    // Info pengeluaran
    pemilik: {
        type: String,
        default: 'haris'
    },
    kategori: {
        type: String,
        default: 'Lainnya'
    },
    deskripsi: {
        type: String,
        default: ''
    },
    
    // Ruangan (untuk multi-user)
    ruangan: {
        type: String,
        required: true
    },
    
    // Waktu dibuat
    dibuat: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Keuangan', KeuanganSchema);