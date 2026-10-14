// ============================================
// MODEL: TARGET PETUALANGAN
// ============================================
// Cetakan data Target untuk MongoDB
// 1 dokumen per ruangan
// ============================================

const mongoose = require('mongoose');

const TargetSchema = new mongoose.Schema({
    // Ruangan (kunci unik)
    ruangan: {
        type: String,
        required: true,
        unique: true
    },
    
    // Target-target
    targetGunung: {
        type: Number,
        default: 10
    },
    targetJarak: {
        type: Number,
        default: 100
    },
    targetKegiatan: {
        type: Number,
        default: 50
    },
    
    // Waktu
    dibuat: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Target', TargetSchema);