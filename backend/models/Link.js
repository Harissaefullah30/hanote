// ============================================
// MODEL: LINK SAVER
// ============================================
// Cetakan data Link untuk MongoDB
// ============================================

const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    // Data utama
    judul: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    
    // Info link
    kategori: {
        type: String,
        default: 'Lainnya'
    },
    pemilik: {
        type: String,
        default: 'berdua'
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

module.exports = mongoose.model('Link', LinkSchema);