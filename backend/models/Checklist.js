// ============================================
// MODEL: CHECKLIST (PETUALANGAN)
// ============================================
// Cetakan data Checklist untuk MongoDB
// ============================================

const mongoose = require('mongoose');

const ChecklistSchema = new mongoose.Schema({
    // Data utama
    nama: {
        type: String,
        required: true
    },
    kategori: {
        type: String,
        default: 'alat'  // 'alat' atau 'makanan'
    },
    
    // Status
    checked: {
        type: Boolean,
        default: false
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

module.exports = mongoose.model('Checklist', ChecklistSchema);