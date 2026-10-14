// ============================================
// MODEL: GAME BALAP MULTIPLAYER
// ============================================
// Cetakan data Game Balap untuk MongoDB
// 1 dokumen per room
// ============================================

const mongoose = require('mongoose');

// Sub-schema untuk data pemain
const PemainSchema = new mongoose.Schema({
    nama: { type: String, default: null },
    mobil: { type: String, default: '🚗' },
    warna: { type: String, default: '#f093fb' },
    namaMobil: { type: String, default: 'Pemain' },
    posisiX: { type: Number, default: 200 },
    posisiY: { type: Number, default: 2950 },
    lap: { type: Number, default: 1 },
    kecepatan: { type: Number, default: 0 },
    selesai: { type: Boolean, default: false },
    waktuSelesai: { type: String, default: null }
});

const GameBalapSchema = new mongoose.Schema({
    // Kode room (unik)
    kodeRoom: {
        type: String,
        required: true,
        unique: true
    },
    
    // Ruangan pembuat room
    ruangan: {
        type: String,
        required: true
    },
    
    // Status: menunggu, siap, berjalan, selesai
    status: {
        type: String,
        default: 'menunggu'
    },
    
    // Pemain (object)
    pemain1: {
        type: PemainSchema,
        default: null
    },
    pemain2: {
        type: PemainSchema,
        default: null
    },
    
    // Waktu dibuat
    dibuat: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GameBalap', GameBalapSchema);