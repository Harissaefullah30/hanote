// ============================================
// MODEL: TUGAS
// ============================================
// Cetakan data Tugas untuk MongoDB
// ============================================

const mongoose = require('mongoose');

const TugasSchema = new mongoose.Schema({
    // Data utama
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
    status: {
        type: String,
        default: 'belum'
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
    
    // Waktu dibuat
    dibuat: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Tugas', TugasSchema);