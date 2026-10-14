// ============================================
// HANOTE - BACKEND SERVER (Versi 1.0)
// ============================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// SETUP UPLOAD FOLDER & MULTER
// ============================================

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// ============================================
// DATA SEMENTARA (NANTI PAKAI DATABASE)
// ============================================

let tugas = [];
let idCounter = 1;

// Data contoh
// tugas = [...dataAwal];
tugas = [];

let arsipTugas = [];
let arsipIdCounter = 1;

const dataArsipAwal = [
    {
        _id: String(arsipIdCounter++),
        judul: 'Tugas Kelompok PKN',
        matkul: 'Pendidikan Kewarganegaraan',
        deadline: '2026-07-10',
        deskripsi: 'Membuat makalah tentang demokrasi',
        file: null,
        filename: null,
        keterangan: 'Nilai A-',
        tanggalDiarsip: '2026-07-11',
        ruangan: 'NabilaAura'
    }
];

arsipTugas = [...dataArsipAwal];

// ============================================
// API ENDPOINT - TUGAS
// ============================================

// GET - Ambil semua tugas (bisa filter by ruangan)
app.get('/api/tugas', (req, res) => {
    const ruangan = req.query.ruangan;
    
    if (ruangan) {
        const tugasRuangan = tugas.filter(t => t.ruangan === ruangan);
        return res.json(tugasRuangan);
    }
    
    res.json(tugas);
});

// POST - Tambah tugas baru
app.post('/api/tugas', (req, res) => {
    const { judul, deskripsi, deadline, pemilik, kategori, prioritas, status, ruangan } = req.body;
    
    if (!judul || !deadline || !ruangan) {
        return res.status(400).json({ 
            error: 'Judul, deadline, dan ruangan wajib diisi!' 
        });
    }
    
    const tugasBaru = {
        _id: String(idCounter++),
        judul,
        deskripsi: deskripsi || '',
        deadline,
        pemilik: pemilik || 'aku',
        kategori: kategori || 'Tugas',
        prioritas: prioritas || 'biasa',
        status: status || 'belum',
        ruangan,
        file: req.body.file || null,
        filename: req.body.filename || null,
        dibuat: new Date().toISOString()
    };
    
    tugas.push(tugasBaru);
    res.status(201).json(tugasBaru);
});

// PUT - Tandai selesai/belum
app.put('/api/tugas/:id', (req, res) => {
    const tugasCari = tugas.find(t => t._id === req.params.id);
    
    if (!tugasCari) {
        return res.status(404).json({ error: 'Tugas tidak ditemukan' });
    }
    
    tugasCari.status = tugasCari.status === 'selesai' ? 'belum' : 'selesai';
    res.json(tugasCari);
});

// PUT - Edit tugas lengkap
app.put('/api/tugas/:id', (req, res) => {
    const tugasCari = tugas.find(t => t._id === req.params.id);
    
    if (!tugasCari) {
        return res.status(404).json({ error: 'Tugas tidak ditemukan' });
    }
    
    const { judul, deskripsi, deadline, pemilik, kategori, prioritas } = req.body;
    
    if (judul) tugasCari.judul = judul;
    if (deskripsi) tugasCari.deskripsi = deskripsi;
    if (deadline) tugasCari.deadline = deadline;
    if (pemilik) tugasCari.pemilik = pemilik;
    if (kategori) tugasCari.kategori = kategori;
    if (prioritas) tugasCari.prioritas = prioritas;
    
    res.json(tugasCari);
});

// DELETE - Hapus tugas
app.delete('/api/tugas/:id', (req, res) => {
    const index = tugas.findIndex(t => t._id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Tugas tidak ditemukan' });
    }
    
    tugas.splice(index, 1);
    res.json({ message: 'Tugas berhasil dihapus! 💕' });
});

// GET - Cek ruangan
app.get('/api/ruangan/:kode', (req, res) => {
    const ruangan = req.params.kode;
    const tugasRuangan = tugas.filter(t => t.ruangan === ruangan);
    
    res.json({
        ruangan,
        exists: tugasRuangan.length > 0 || ruangan === 'NabilaAura',
        totalTugas: tugasRuangan.length
    });
});

// ============================================
// API ENDPOINT - UPLOAD FILE
// ============================================

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file yang diupload!' });
    }
    
    res.json({
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size
    });
});

// ============================================
// API ENDPOINT - ARSIP TUGAS
// ============================================

// POST - Tambah tugas ke arsip
app.post('/api/arsip', (req, res) => {
    const { tugasId, matkul, keterangan, file, filename } = req.body;
    
    // Cari tugas di data aktif
    const index = tugas.findIndex(t => t._id === tugasId);
    if (index === -1) {
        return res.status(404).json({ error: 'Tugas tidak ditemukan!' });
    }
    
    const tugasAsli = tugas[index];
    
    // Pindahkan ke arsip
    const arsipBaru = {
        _id: String(arsipIdCounter++),
        judul: tugasAsli.judul,
        matkul: matkul || 'Tidak ada',
        deadline: tugasAsli.deadline,
        deskripsi: tugasAsli.deskripsi || '',
        pemilik: tugasAsli.pemilik,
        kategori: tugasAsli.kategori,
        prioritas: tugasAsli.prioritas,
        ruangan: tugasAsli.ruangan,
        file: file || null,
        filename: filename || null,
        keterangan: keterangan || '-',
        tanggalDiarsip: new Date().toISOString()
    };
    
    arsipTugas.push(arsipBaru);
    
    // Hapus tugas dari daftar aktif
    tugas.splice(index, 1);
    
    res.status(201).json(arsipBaru);
});

// GET - Ambil semua arsip (filter by ruangan)
app.get('/api/arsip', (req, res) => {
    const ruangan = req.query.ruangan;
    
    if (ruangan) {
        const arsipRuangan = arsipTugas.filter(a => a.ruangan === ruangan);
        return res.json(arsipRuangan);
    }
    
    res.json(arsipTugas);
});

// GET - Ambil satu arsip
app.get('/api/arsip/:id', (req, res) => {
    const arsip = arsipTugas.find(a => a._id === req.params.id);
    
    if (!arsip) {
        return res.status(404).json({ error: 'Arsip tidak ditemukan!' });
    }
    
    res.json(arsip);
});

// DELETE - Hapus arsip
app.delete('/api/arsip/:id', (req, res) => {
    const index = arsipTugas.findIndex(a => a._id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Arsip tidak ditemukan!' });
    }
    
    arsipTugas.splice(index, 1);
    res.json({ message: 'Arsip berhasil dihapus! 💕' });
});

// Serve file (biar bisa di-download)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// ROUTE UTAMA (CEK SERVER)
// ============================================

app.get('/', (req, res) => {
    res.json({
        name: '❤️ HANOTE API',
        status: 'online',
        message: 'Server Hanote berjalan dengan cinta! 💕',
        version: '1.0.0',
        totalTugas: tugas.length
    });
});

// ============================================
// API ENDPOINT - GALERI (MUSEUM CINTA)
// ============================================

let galeri = [];
let galeriIdCounter = 1;

// Setup folder galeri di dalam uploads
const galeriDir = path.join(__dirname, 'uploads/galeri');
if (!fs.existsSync(galeriDir)) {
    fs.mkdirSync(galeriDir, { recursive: true });
}

// Konfigurasi storage untuk galeri
const galeriStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, galeriDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const uploadGaleri = multer({
    storage: galeriStorage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB max (karena bisa video)
});

// POST - Upload ke galeri
app.post('/api/galeri', uploadGaleri.single('file'), (req, res) => {
    const { judul, kategori, deskripsi, ruangan } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: 'File wajib diupload!' });
    }
    
    if (!judul || !ruangan) {
        return res.status(400).json({ error: 'Judul dan ruangan wajib diisi!' });
    }
    
    const isVideo = req.file.mimetype.startsWith('video/');
    const baru = {
        _id: String(galeriIdCounter++),
        judul,
        deskripsi: deskripsi || '',
        kategori: kategori || 'berdua',
        ruangan,
        file: req.file.filename,
        originalname: req.file.originalname,
        tipe: isVideo ? 'video' : 'image',
        mimetype: req.file.mimetype,
        ukuran: req.file.size,
        tanggal: new Date().toISOString().split('T')[0]
    };
    
    galeri.push(baru);
    res.status(201).json(baru);
});

// GET - Ambil semua galeri (filter by ruangan)
app.get('/api/galeri', (req, res) => {
    const ruangan = req.query.ruangan;
    if (ruangan) {
        const filtered = galeri.filter(g => g.ruangan === ruangan);
        return res.json(filtered);
    }
    res.json(galeri);
});

// DELETE - Hapus dari galeri
app.delete('/api/galeri/:id', (req, res) => {
    const index = galeri.findIndex(g => g._id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Koleksi tidak ditemukan!' });
    }
    
    const item = galeri[index];
    const filePath = path.join(galeriDir, item.file);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    
    galeri.splice(index, 1);
    res.json({ message: 'Koleksi berhasil dihapus! 💕' });
});

// ============================================
// API ENDPOINT - KEUANGAN (DOMPETAKU)
// ============================================

let keuangan = [];
let keuanganIdCounter = 1;

// GET - Ambil semua pengeluaran (filter by ruangan)
app.get('/api/keuangan', (req, res) => {
    const ruangan = req.query.ruangan;
    if (ruangan) {
        const filtered = keuangan.filter(k => k.ruangan === ruangan);
        return res.json(filtered);
    }
    res.json(keuangan);
});

// POST - Tambah pengeluaran
app.post('/api/keuangan', (req, res) => {
    const { nama, jumlah, tanggal, pemilik, kategori, deskripsi, ruangan } = req.body;
    
    if (!nama || !jumlah || !tanggal || !ruangan) {
        return res.status(400).json({ error: 'Nama, jumlah, tanggal, dan ruangan wajib diisi!' });
    }
    
    const baru = {
        _id: String(keuanganIdCounter++),
        nama,
        jumlah: Number(jumlah),
        tanggal,
        pemilik: pemilik || 'haris',
        kategori: kategori || 'Lainnya',
        deskripsi: deskripsi || '',
        ruangan,
        dibuat: new Date().toISOString()
    };
    
    keuangan.push(baru);
    res.status(201).json(baru);
});

// DELETE - Hapus pengeluaran
app.delete('/api/keuangan/:id', (req, res) => {
    const index = keuangan.findIndex(k => k._id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Pengeluaran tidak ditemukan!' });
    }
    keuangan.splice(index, 1);
    res.json({ message: 'Pengeluaran berhasil dihapus! 💕' });
});

// ============================================
// API ENDPOINT - LINK SAVER
// ============================================

let linkSaver = [];
let linkIdCounter = 1;

// GET - Ambil semua link
app.get('/api/link', (req, res) => {
    const ruangan = req.query.ruangan;
    if (ruangan) {
        const filtered = linkSaver.filter(l => l.ruangan === ruangan);
        return res.json(filtered);
    }
    res.json(linkSaver);
});

// POST - Tambah link
app.post('/api/link', (req, res) => {
    const { judul, url, kategori, pemilik, deskripsi, ruangan } = req.body;
    
    if (!judul || !url || !ruangan) {
        return res.status(400).json({ error: 'Judul, URL, dan ruangan wajib diisi!' });
    }
    
    const baru = {
        _id: String(linkIdCounter++),
        judul,
        url,
        kategori: kategori || 'Lainnya',
        pemilik: pemilik || 'berdua',
        deskripsi: deskripsi || '',
        ruangan,
        dibuat: new Date().toISOString()
    };
    
    linkSaver.push(baru);
    res.status(201).json(baru);
});

// DELETE - Hapus link
app.delete('/api/link/:id', (req, res) => {
    const index = linkSaver.findIndex(l => l._id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Link tidak ditemukan!' });
    }
    linkSaver.splice(index, 1);
    res.json({ message: 'Link berhasil dihapus! 💕' });
});

// ============================================
// API ENDPOINT - GAME SUIT MULTIPLAYER
// ============================================

let gameRooms = {}; // { kodeRoom: { pemain1, pemain2, pilihan1, pilihan2, status, hasil } }

// POST - Buat room baru
app.post('/api/game/suit/create', (req, res) => {
    const { ruangan, pemain } = req.body;
    
    // Generate kode room unik
    let kodeRoom;
    do {
        kodeRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (gameRooms[kodeRoom]);
    
    gameRooms[kodeRoom] = {
        ruangan,
        pemain1: pemain || 'haris',
        pemain2: null,
        pilihan1: null,
        pilihan2: null,
        status: 'menunggu', // menunggu, siap, selesai
        hasil: null,
        dibuat: new Date().toISOString()
    };
    
    res.json({ kodeRoom, ...gameRooms[kodeRoom] });
});

// POST - Join room
app.post('/api/game/suit/join', (req, res) => {
    const { kodeRoom, pemain } = req.body;
    
    if (!gameRooms[kodeRoom]) {
        return res.status(404).json({ error: 'Room tidak ditemukan!' });
    }
    
    gameRooms[kodeRoom].pemain2 = pemain || 'anita';
    gameRooms[kodeRoom].status = 'siap';
    
    res.json({ kodeRoom, ...gameRooms[kodeRoom] });
});

// GET - Cek status room
app.get('/api/game/suit/room/:kodeRoom', (req, res) => {
    const room = gameRooms[req.params.kodeRoom];
    if (!room) {
        return res.status(404).json({ error: 'Room tidak ditemukan!' });
    }
    res.json({ kodeRoom: req.params.kodeRoom, ...room });
});

// POST - Pilih suit
app.post('/api/game/suit/pilih', (req, res) => {
    const { kodeRoom, pemain, pilihan } = req.body;
    
    if (!gameRooms[kodeRoom]) {
        return res.status(404).json({ error: 'Room tidak ditemukan!' });
    }
    
    const room = gameRooms[kodeRoom];
    
    if (pemain === room.pemain1) {
        room.pilihan1 = pilihan;
    } else if (pemain === room.pemain2) {
        room.pilihan2 = pilihan;
    }
    
    // Cek apakah kedua pemain sudah pilih
    if (room.pilihan1 && room.pilihan2) {
        // Tentukan pemenang
        const h = room.pilihan1;
        const a = room.pilihan2;
        
        if (h === a) {
            room.hasil = 'seri';
        } else if (
            (h === '✊' && a === '✌️') ||
            (h === '✋' && a === '✊') ||
            (h === '✌️' && a === '✋')
        ) {
            room.hasil = 'pemain1';
        } else {
            room.hasil = 'pemain2';
        }
        
        room.status = 'selesai';
    }
    
    res.json({ kodeRoom, ...room });
});

// POST - Reset room (main lagi)
app.post('/api/game/suit/reset', (req, res) => {
    const { kodeRoom } = req.body;
    
    if (!gameRooms[kodeRoom]) {
        return res.status(404).json({ error: 'Room tidak ditemukan!' });
    }
    
    const room = gameRooms[kodeRoom];
    room.pilihan1 = null;
    room.pilihan2 = null;
    room.hasil = null;
    room.status = 'siap';
    
    res.json({ kodeRoom, ...room });
});

// ============================================
// API ENDPOINT - GAME BALAP MULTIPLAYER
// ============================================

let balapRooms = {}; // { kodeRoom: { ... } }

// POST - Buat room balap
app.post('/api/game/balap/create', (req, res) => {
    const { ruangan, pemain, mobil, warna, nama } = req.body;

    let kodeRoom;
    do {
        kodeRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (balapRooms[kodeRoom]);

    balapRooms[kodeRoom] = {
        ruangan,
        status: 'menunggu', // menunggu, siap, berjalan, selesai
        pemain1: {
            nama: pemain || 'Haris',
            mobil: mobil || '🚗',
            warna: warna || '#f093fb',
            namaMobil: nama || 'Pemain 1',
            posisiX: 200,
            posisiY: 2950,
            lap: 1,
            kecepatan: 0,
            selesai: false,
            waktuSelesai: null
        },
        pemain2: null,
        dibuat: new Date().toISOString()
    };

    res.json({ kodeRoom, ...balapRooms[kodeRoom] });
});

// POST - Join room balap
app.post('/api/game/balap/join', (req, res) => {
    const { kodeRoom, pemain, mobil, warna, nama } = req.body;

    if (!balapRooms[kodeRoom]) {
        return res.status(404).json({ error: 'Room tidak ditemukan!' });
    }

    if (balapRooms[kodeRoom].pemain2) {
        return res.status(400).json({ error: 'Room sudah penuh!' });
    }

    balapRooms[kodeRoom].pemain2 = {
        nama: pemain || 'Anita',
        mobil: mobil || '🚙',
        warna: warna || '#4facfe',
        namaMobil: nama || 'Pemain 2',
        posisiX: 200,
        posisiY: 2950,
        lap: 1,
        kecepatan: 0,
        selesai: false,
        waktuSelesai: null
    };

    balapRooms[kodeRoom].status = 'siap';

    res.json({ kodeRoom, ...balapRooms[kodeRoom] });
});

// GET - Cek status room
app.get('/api/game/balap/room/:kodeRoom', (req, res) => {
    const room = balapRooms[req.params.kodeRoom];
    if (!room) {
        return res.status(404).json({ error: 'Room tidak ditemukan!' });
    }
    res.json({ kodeRoom: req.params.kodeRoom, ...room });
});

// POST - Update posisi pemain
app.post('/api/game/balap/update', (req, res) => {
    const { kodeRoom, pemain, posisiX, posisiY, lap, kecepatan } = req.body;

    if (!balapRooms[kodeRoom]) {
        return res.status(404).json({ error: 'Room tidak ditemukan!' });
    }

    const room = balapRooms[kodeRoom];
    const dataPemain = room[pemain];

    if (dataPemain) {
        dataPemain.posisiX = posisiX;
        dataPemain.posisiY = posisiY;
        dataPemain.lap = lap;
        dataPemain.kecepatan = kecepatan;
    }

    res.json({ success: true });
});

// POST - Pemain finish
app.post('/api/game/balap/finish', (req, res) => {
    const { kodeRoom, pemain, waktu } = req.body;

    if (!balapRooms[kodeRoom]) {
        return res.status(404).json({ error: 'Room tidak ditemukan!' });
    }

    const room = balapRooms[kodeRoom];
    if (room[pemain]) {
        room[pemain].selesai = true;
        room[pemain].waktuSelesai = waktu;
    }

    // Cek apakah kedua pemain selesai
    if (room.pemain1?.selesai && room.pemain2?.selesai) {
        room.status = 'selesai';
    }

    res.json({ kodeRoom, ...room });
});

// POST - Mulai balapan (kedua pemain siap)
app.post('/api/game/balap/start', (req, res) => {
    const { kodeRoom } = req.body;

    if (!balapRooms[kodeRoom]) {
        return res.status(404).json({ error: 'Room tidak ditemukan!' });
    }

    balapRooms[kodeRoom].status = 'berjalan';
    res.json({ kodeRoom, ...balapRooms[kodeRoom] });
});

// ============================================
// API ENDPOINT - PETUALANGAN (CATAT KEGIATAN)
// ============================================

let petualangan = [];
let petualanganIdCounter = 1;

// Setup folder upload petualangan
const petualanganDir = path.join(__dirname, 'uploads/petualangan');
if (!fs.existsSync(petualanganDir)) {
    fs.mkdirSync(petualanganDir, { recursive: true });
}

const petualanganStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, petualanganDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const uploadPetualangan = multer({
    storage: petualanganStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// POST - Tambah kegiatan
app.post('/api/petualangan', uploadPetualangan.single('foto'), (req, res) => {
    const { tempat, tanggal, durasi, jarak, medan, cuaca, deskripsi, ruangan } = req.body;
    
    if (!tempat || !tanggal || !ruangan) {
        return res.status(400).json({ error: 'Tempat, tanggal, dan ruangan wajib diisi!' });
    }
    
    const baru = {
        _id: String(petualanganIdCounter++),
        tempat,
        tanggal,
        durasi: durasi || '-',
        jarak: jarak || '-',
        medan: medan || 'Sedang',
        cuaca: cuaca || 'Cerah',
        deskripsi: deskripsi || '',
        foto: req.file ? req.file.filename : null,
        ruangan,
        dibuat: new Date().toISOString()
    };
    
    petualangan.push(baru);
    res.status(201).json(baru);
});

// GET - Ambil semua kegiatan (filter by ruangan)
app.get('/api/petualangan', (req, res) => {
    const ruangan = req.query.ruangan;
    if (ruangan) {
        const filtered = petualangan.filter(p => p.ruangan === ruangan);
        return res.json(filtered);
    }
    res.json(petualangan);
});

// DELETE - Hapus kegiatan
app.delete('/api/petualangan/:id', (req, res) => {
    const index = petualangan.findIndex(p => p._id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Kegiatan tidak ditemukan!' });
    }
    
    const item = petualangan[index];
    if (item.foto) {
        const filePath = path.join(petualanganDir, item.foto);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    
    petualangan.splice(index, 1);
    res.json({ message: 'Kegiatan berhasil dihapus! 💕' });
});

// ============================================
// API ENDPOINT - CHECKLIST PETUALANGAN
// ============================================

let checklistItems = [];
let checklistIdCounter = 1;

// GET - Ambil semua checklist
app.get('/api/checklist', (req, res) => {
    const ruangan = req.query.ruangan;
    if (ruangan) {
        const filtered = checklistItems.filter(c => c.ruangan === ruangan);
        return res.json(filtered);
    }
    res.json(checklistItems);
});

// POST - Tambah item checklist
app.post('/api/checklist', (req, res) => {
    const { nama, kategori, ruangan } = req.body;
    
    if (!nama || !ruangan) {
        return res.status(400).json({ error: 'Nama & ruangan wajib diisi!' });
    }
    
    const baru = {
        _id: String(checklistIdCounter++),
        nama,
        kategori: kategori || 'alat', // alat / makanan
        checked: false,
        ruangan,
        dibuat: new Date().toISOString()
    };
    
    checklistItems.push(baru);
    res.status(201).json(baru);
});

// PUT - Toggle checked
app.put('/api/checklist/:id', (req, res) => {
    const item = checklistItems.find(c => c._id === req.params.id);
    if (!item) {
        return res.status(404).json({ error: 'Item tidak ditemukan!' });
    }
    item.checked = !item.checked;
    res.json(item);
});

// DELETE - Hapus item
app.delete('/api/checklist/:id', (req, res) => {
    const index = checklistItems.findIndex(c => c._id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Item tidak ditemukan!' });
    }
    checklistItems.splice(index, 1);
    res.json({ message: 'Item berhasil dihapus! 💕' });
});

// POST - Reset semua checklist
app.post('/api/checklist/reset', (req, res) => {
    const { ruangan } = req.body;
    checklistItems.forEach(c => {
        if (c.ruangan === ruangan) c.checked = false;
    });
    res.json({ message: 'Checklist direset! 💕' });
});

// ============================================
// API ENDPOINT - STATISTIK PETUALANGAN
// ============================================

// Data achievement
const achievementList = [
    { level: 1, nama: 'Pendaki Pemula', icon: '🥉', syarat: 1 },
    { level: 2, nama: 'Pendaki Muda', icon: '🥈', syarat: 3 },
    { level: 3, nama: 'Pendaki Sejati', icon: '🥇', syarat: 5 },
    { level: 4, nama: 'Pendaki Handal', icon: '💎', syarat: 10 },
    { level: 5, nama: 'Pendaki Pro', icon: '🌟', syarat: 15 },
    { level: 6, nama: 'Pendaki Master', icon: '🔥', syarat: 20 },
    { level: 7, nama: 'Pendaki Legendaris', icon: '👑', syarat: 30 },
    { level: 8, nama: 'Raja Gunung', icon: '🏔️', syarat: 50 },
    { level: 9, nama: 'Dewa Gunung', icon: '⛰️', syarat: 75 },
    { level: 10, nama: 'Legenda Sejati', icon: '🌋', syarat: 100 }
];

// Data target (bisa diset user)
let targetPetualangan = {
    targetGunung: 10,
    targetJarak: 100, // km
    targetKegiatan: 50,
    ruangan: null
};

// GET - Ambil statistik
app.get('/api/statistik', (req, res) => {
    const ruangan = req.query.ruangan;
    
    let dataPetualangan = petualangan;
    if (ruangan) {
        dataPetualangan = petualangan.filter(p => p.ruangan === ruangan);
    }
    
    // Hitung total
    const totalTempat = dataPetualangan.length;
    
    // Total jarak (parse dari string "5 km" → 5)
    let totalJarak = 0;
    dataPetualangan.forEach(p => {
        if (p.jarak && p.jarak !== '-') {
            const angka = parseFloat(p.jarak.replace(/[^0-9.]/g, ''));
            if (!isNaN(angka)) totalJarak += angka;
        }
    });
    
    // Total durasi (parse dari string "3 jam" → 3)
    let totalDurasi = 0;
    dataPetualangan.forEach(p => {
        if (p.durasi && p.durasi !== '-') {
            const angka = parseFloat(p.durasi.replace(/[^0-9.]/g, ''));
            if (!isNaN(angka)) totalDurasi += angka;
        }
    });
    
    // Kegiatan bulan ini
    const now = new Date();
    const bulanIni = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const kegiatanBulanIni = dataPetualangan.filter(p => p.tanggal && p.tanggal.startsWith(bulanIni)).length;
    
    // Medan terbanyak
    const medanCount = { Mudah: 0, Sedang: 0, Sulit: 0 };
    dataPetualangan.forEach(p => {
        if (medanCount[p.medan] !== undefined) medanCount[p.medan]++;
    });
    let medanTerbanyak = 'Sedang';
    let maxMedan = 0;
    for (const [key, val] of Object.entries(medanCount)) {
        if (val > maxMedan) {
            maxMedan = val;
            medanTerbanyak = key;
        }
    }
    
    // Cuaca terbanyak
    const cuacaCount = {};
    dataPetualangan.forEach(p => {
        if (p.cuaca) cuacaCount[p.cuaca] = (cuacaCount[p.cuaca] || 0) + 1;
    });
    let cuacaTerbanyak = 'Cerah';
    let maxCuaca = 0;
    for (const [key, val] of Object.entries(cuacaCount)) {
        if (val > maxCuaca) {
            maxCuaca = val;
            cuacaTerbanyak = key;
        }
    }
    
    // Grafik per bulan (12 bulan terakhir)
    const grafikBulanan = {};
    for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        grafikBulanan[key] = 0;
    }
    dataPetualangan.forEach(p => {
        if (p.tanggal) {
            const key = p.tanggal.substring(0, 7);
            if (grafikBulanan[key] !== undefined) {
                grafikBulanan[key]++;
            }
        }
    });
    
    // Achievement (berdasarkan total tempat)
    const achievement = achievementList.map(a => ({
        ...a,
        tercapai: totalTempat >= a.syarat
    }));
    
    // Target
    const target = {
        targetGunung: targetPetualangan.targetGunung,
        targetJarak: targetPetualangan.targetJarak,
        targetKegiatan: targetPetualangan.targetKegiatan
    };
    
    res.json({
        totalTempat,
        totalJarak: Math.round(totalJarak * 10) / 10,
        totalDurasi: Math.round(totalDurasi * 10) / 10,
        kegiatanBulanIni,
        medanTerbanyak,
        cuacaTerbanyak,
        grafikBulanan,
        achievement,
        target
    });
});

// POST - Update target
app.post('/api/statistik/target', (req, res) => {
    const { targetGunung, targetJarak, targetKegiatan, ruangan } = req.body;
    
    if (targetGunung) targetPetualangan.targetGunung = Number(targetGunung);
    if (targetJarak) targetPetualangan.targetJarak = Number(targetJarak);
    if (targetKegiatan) targetPetualangan.targetKegiatan = Number(targetKegiatan);
    targetPetualangan.ruangan = ruangan;
    
    res.json({ message: 'Target berhasil diupdate! 💕', target: targetPetualangan });
});

// ============================================
// API ENDPOINT - KADO RAHASIA
// ============================================

// Data kado (untuk verifikasi)
const isiKadoServer = {
    biasa: [
        '💕 Kamu adalah alasan aku tersenyum hari ini',
        '😆 Jokes: Kenapa cinta gak pernah salah? Karena selalu ke kamu',
        '🌟 Fakta: Pelukan 20 detik bisa bikin bahagia',
        '💌 Quote: Cinta sejati itu sabar dan ikhlas',
        '🌸 Kamu lebih indah dari bunga apa pun',
        '💖 Setiap detik bersamamu terasa berharga',
        '🌻 Senyummu adalah matahari pagiku',
        '✨ Kamu adalah bintang di langitku',
        '🎈 Aku suka caramu membuatku tersenyum',
        '🍀 Kehadiranmu adalah keberuntungan terbesarku'
    ],
    bagus: [
        '🌸 Pujian: Kamu orang paling sabar yang aku kenal',
        '💬 Tantangan: Bilang "aku sayang kamu" 3x ke pasangan',
        '💪 Fakta: Cinta bisa bikin imun tubuh naik',
        '✨ Quote: Bersamamu, semua terasa mungkin',
        '🌟 Pujian: Kamu adalah inspirasiku setiap hari',
        '💕 Tantangan: Kirim emoji ❤️ 5x ke pasangan',
        '🎵 Fakta: Mendengar suara pasangan bisa menenangkan',
        '💝 Quote: Cinta adalah ketika kebahagiaan orang lain jadi kebahagiaanmu',
        '🌹 Pujian: Kamu cantik/ganteng tanpa perlu usaha',
        '💫 Tantangan: Peluk pasangan 10 detik sekarang'
    ],
    langka: [
        '🤗 Misi: Peluk pasangan 30 detik tanpa ngomong',
        '📸 Tantangan: Foto selfie berdua dengan pose random',
        '🎤 Kejutan: Kirim voice note romantis ke pasangan',
        '🏠 Pujian: Kamu adalah rumah untuk hatiku',
        '💌 Misi: Tulis pesan cinta 3 baris untuk pasangan',
        '🎬 Tantangan: Nonton film romantis bareng malam ini',
        '🌟 Kejutan: Peluk pasangan dari belakang tanpa alasan',
        '💝 Misi: Ceritakan 3 hal yang kamu suka dari pasangan',
        '🌸 Tantangan: Pegang tangan pasangan selama 5 menit',
        '🎁 Kejutan: Belikan minuman favorit pasangan'
    ],
    epik: [
        '🍽️ Voucher: Traktir Makan (berlaku 1x)',
        '💆 Voucher: Pijat 30 Menit (berlaku 1x)',
        '🎬 Voucher: Nonton Bareng (berlaku 1x)',
        '🚗 Voucher: Jalan-Jalan Weekend (berlaku 1x)',
        '🎂 Voucher: Buat Kue Bareng (berlaku 1x)',
        '🍦 Voucher: Beli Es Krim Favorit (berlaku 1x)',
        '📸 Voucher: Foto Studio Berdua (berlaku 1x)',
        '🎮 Voucher: Main Game Bareng (berlaku 1x)',
        '🎵 Voucher: Karaoke Bareng (berlaku 1x)',
        '🌹 Voucher: Beli Bunga untuk Pasangan (berlaku 1x)'
    ],
    legendaris: [
        '😤 Voucher: Bebas Ngambek 1 Hari (berlaku 1x)',
        '🎁 Voucher: Pilih Sendiri Hadiah (berlaku 1x)',
        '💕 Kado Spesial: Date Spesial Akhir Pekan (berlaku 1x)',
        '💎 Kado Emas: Cinta Abadi Haris & Anita (abadi!)',
        '🌙 Kado Spesial: Dinner Romantis Berdua (berlaku 1x)',
        '🏖️ Kado Spesial: Liburan Singkat Berdua (berlaku 1x)',
        '💍 Kado Spesial: Janji Setia untuk Selamanya',
        '🎆 Kado Spesial: Kembang Api Malam Ini',
        '🌟 Kado Spesial: Bebas Pilih Aktivitas Berdua',
        '👑 Kado Royal: Peluk & Cium Pasangan Sepuasnya'
    ]
};

// Data kado tersimpan (per ruangan)
let kadoDataPerRuangan = {};
// Format: { "namaRuangan": { totalDibuka, riwayat, kadoHariIni, tanggalTerakhir, kadoTerbuka } }

function ambilKadoRuangan(ruangan) {
    if (!ruangan) ruangan = 'default';
    if (!kadoDataPerRuangan[ruangan]) {
        kadoDataPerRuangan[ruangan] = {
            totalDibuka: 0,
            riwayat: [],
            kadoHariIni: 0,
            tanggalTerakhir: null,
            kadoTerbuka: []
        };
    }
    return kadoDataPerRuangan[ruangan];
}

// GET - Ambil info kado
app.get('/api/kado', (req, res) => {
    const ruangan = req.query.ruangan;
    const tanggalHariIni = new Date().toISOString().split('T')[0];
    
    const data = ambilKadoRuangan(ruangan);
    
    // Cek reset harian
    if (data.tanggalTerakhir !== tanggalHariIni) {
        data.tanggalTerakhir = tanggalHariIni;
        data.kadoHariIni = 0;
        data.kadoTerbuka = [];
    }
    
    res.json({
        ruangan: ruangan || 'default',
        totalDibuka: data.totalDibuka,
        kadoHariIni: data.kadoHariIni,
        kadoTerbuka: data.kadoTerbuka,
        riwayat: data.riwayat,
        maxHariIni: 2
    });
});

// POST - Buka kado
app.post('/api/kado/buka', (req, res) => {
    const { index, ruangan } = req.body;
    const tanggalHariIni = new Date().toISOString().split('T')[0];
    
    const data = ambilKadoRuangan(ruangan);
    
    // Reset harian
    if (data.tanggalTerakhir !== tanggalHariIni) {
        data.tanggalTerakhir = tanggalHariIni;
        data.kadoHariIni = 0;
        data.kadoTerbuka = [];
    }
    
    // Cek limit
    if (data.kadoHariIni >= 2) {
        return res.status(400).json({ error: 'Kado hari ini sudah habis!' });
    }
    
    // Cek sudah dibuka
    if (data.kadoTerbuka.includes(index)) {
        return res.status(400).json({ error: 'Kado ini sudah dibuka!' });
    }
    
    // Tentukan rarity
    const rand = Math.random() * 100;
    let rarity;
    if (rand < 2) rarity = 'legendaris';
    else if (rand < 10) rarity = 'epik';
    else if (rand < 25) rarity = 'langka';
    else if (rand < 50) rarity = 'bagus';
    else rarity = 'biasa';
    
    // Ambil isi
    const list = isiKadoServer[rarity];
    const isi = list[Math.floor(Math.random() * list.length)];
    
    // Update data
    data.kadoTerbuka.push(index);
    data.kadoHariIni++;
    data.totalDibuka++;
    
    const item = {
        rarity,
        isi,
        tanggal: new Date().toLocaleDateString('id-ID'),
        waktu: new Date().toISOString()
    };
    
    data.riwayat.unshift(item);
    if (data.riwayat.length > 50) data.riwayat = data.riwayat.slice(0, 50);
    
    res.json({
        success: true,
        kado: item,
        totalDibuka: data.totalDibuka,
        kadoHariIni: data.kadoHariIni
    });
});

// POST - Reset kado per ruangan
app.post('/api/kado/reset', (req, res) => {
    const { ruangan } = req.body;
    const data = ambilKadoRuangan(ruangan);
    data.totalDibuka = 0;
    data.riwayat = [];
    data.kadoHariIni = 0;
    data.tanggalTerakhir = null;
    data.kadoTerbuka = [];
    res.json({ message: 'Kado berhasil direset! 💕' });
});



// ============================================
// JALANKAN SERVER
// ============================================

app.listen(PORT, () => {
    console.log('========================================');
    console.log('   ❤️  HANOTE SERVER  ❤️');
    console.log('========================================');
    console.log(`🚀 Server berjalan di: http://localhost:${PORT}`);
    console.log(`📋 API Tugas: http://localhost:${PORT}/api/tugas`);
    console.log(`📎 API Upload: http://localhost:${PORT}/api/upload`);
    console.log(`🏠 Home: http://localhost:${PORT}`);
    console.log(`💕 Siap untuk cinta dan tugas!`);
    console.log('========================================');
});