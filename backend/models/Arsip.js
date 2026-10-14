// ============================================
// MODEL: ARSIP
// ============================================
// Cetakan data Arsip untuk MongoDB
// ============================================

const mongoose = require('mongoose');

const ArsipSchema = new mongoose.Schema({
    // Data dari Tugas asli
    judul: {
        type: String,
        required: true
    },
    deskripsi: {
        type: String,
        default: ''
    },
    deadline: {
        type: String,
        required: true
    },
    
    // Info tugas
    pemilik: {
        type: String,
        default: 'aku'
    },
    kategori: {
        type: String,
        default: 'Tugas'
    },
    prioritas: {
        type: String,
        default: 'biasa'
    },
    
    // Ruangan (untuk multi-user)
    ruangan: {
        type: String,
        required: true
    },
    
    // File upload
    file: {
        type: String,
        default: null
    },
    filename: {
        type: String,
        default: null
    },
    
    // === KHUSUS ARSIP ===
    matkul: {
        type: String,
        default: 'Tidak ada'
    },
    keterangan: {
        type: String,
        default: '-'
    },
    tanggalDiarsip: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Arsip', ArsipSchema);