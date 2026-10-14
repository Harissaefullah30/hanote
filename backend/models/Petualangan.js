// ============================================
// MODEL: PETUALANGAN KITA
// ============================================
// Cetakan data Petualangan untuk MongoDB
// ============================================

const mongoose = require('mongoose');

const PetualanganSchema = new mongoose.Schema({
    // Data utama
    tempat: {
        type: String,
        required: true
    },
    tanggal: {
        type: String,
        required: true
    },
    
    // Detail kegiatan
    durasi: {
        type: String,
        default: '-'
    },
    jarak: {
        type: String,
        default: '-'
    },
    medan: {
        type: String,
        default: 'Sedang'  // 'Mudah', 'Sedang', 'Sulit'
    },
    cuaca: {
        type: String,
        default: 'Cerah'   // 'Cerah', 'Berawan', 'Hujan', 'Berkabut'
    },
    deskripsi: {
        type: String,
        default: ''
    },
    
    // Foto upload
    foto: {
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

module.exports = mongoose.model('Petualangan', PetualanganSchema);