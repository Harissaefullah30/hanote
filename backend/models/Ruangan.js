// ============================================
// MODEL: RUANGAN
// ============================================
// Cetakan data untuk menyimpan kode ruangan secara global
// ============================================

const mongoose = require('mongoose');

const RuanganSchema = new mongoose.Schema({
    // Kode ruangan unik (misal: HARISANITA)
    kode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // Waktu ruangan dibuat
    dibuat: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Ruangan', RuanganSchema);