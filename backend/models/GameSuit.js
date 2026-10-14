// ============================================
// MODEL: GAME SUIT MULTIPLAYER
// ============================================
// Cetakan data Game Suit untuk MongoDB
// 1 dokumen per room
// ============================================

const mongoose = require('mongoose');

const GameSuitSchema = new mongoose.Schema({
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
    
    // Pemain
    pemain1: {
        type: String,
        default: null
    },
    pemain2: {
        type: String,
        default: null
    },
    
    // Pilihan suit (✊ ✋ ✌️)
    pilihan1: {
        type: String,
        default: null
    },
    pilihan2: {
        type: String,
        default: null
    },
    
    // Status: menunggu, siap, selesai
    status: {
        type: String,
        default: 'menunggu'
    },
    
    // Hasil: pemain1, pemain2, seri
    hasil: {
        type: String,
        default: null
    },
    
    // Waktu dibuat
    dibuat: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GameSuit', GameSuitSchema);