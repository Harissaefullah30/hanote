// ============================================
// MODEL: GALERI (MUSEUM CINTA)
// ============================================
// Cetakan data Galeri untuk MongoDB
// ============================================

const mongoose = require('mongoose');

const GaleriSchema = new mongoose.Schema({
    // Data utama
    judul: {
        type: String,
        required: true
    },
    deskripsi: {
        type: String,
        default: ''
    },
    kategori: {
        type: String,
        default: 'berdua'  // 'haris', 'anita', 'berdua'
    },
    
    // File upload
    file: {
        type: String,
        required: true
    },
    originalname: {
        type: String,
        default: null
    },
    tipe: {
        type: String,
        default: 'image'   // 'image' atau 'video'
    },
    mimetype: {
        type: String,
        default: null
    },
    ukuran: {
        type: Number,
        default: 0
    },
    
    // Tanggal upload
    tanggal: {
        type: String,
        default: null
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

module.exports = mongoose.model('Galeri', GaleriSchema);