// ============================================
// HANOTE - BACKEND SERVER (Versi 1.0)
// ============================================

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Tugas = require('./models/Tugas');
const Arsip = require('./models/Arsip');
const Link = require('./models/Link');
const Keuangan = require('./models/Keuangan');
const Checklist = require('./models/Checklist');
const Kado = require('./models/Kado');
const Petualangan = require('./models/Petualangan');
const Target = require('./models/Target');
const GameSuit = require('./models/GameSuit');
const GameBalap = require('./models/GameBalap');
const Galeri = require('./models/Galeri');

// ============================================
// API ENDPOINT - RUANGAN (MULTI-DEVICE)
// ============================================

// POST - Buat Ruangan Baru
app.post('/api/ruangan/buat', async (req, res) => {
    try {
        const { kode } = req.body;

        if (!kode) {
            return res.status(400).json({ error: 'Kode ruangan tidak boleh kosong!' });
        }

        const kodeClean = kode.trim().toUpperCase();

        // Cek apakah kode ruangan sudah terdaftar
        const ruanganAda = await Ruangan.findOne({ kode: kodeClean });
        if (ruanganAda) {
            return res.status(400).json({ error: 'Kode ruangan sudah digunakan! Silakan gunakan kode lain atau klik Masuk.' });
        }

        // Simpan ruangan baru ke database
        const ruanganBaru = await Ruangan.create({
            kode: kodeClean
        });

        res.status(201).json({ 
            message: 'Ruangan berhasil dibuat! 💕', 
            ruangan: ruanganBaru 
        });
    } catch (error) {
        console.error('Error buat ruangan:', error);
        res.status(500).json({ error: 'Gagal membuat ruangan di server.' });
    }
});

// POST - Masuk Ruangan
app.post('/api/ruangan/masuk', async (req, res) => {
    try {
        const { kode } = req.body;

        if (!kode) {
            return res.status(400).json({ error: 'Masukkan kode ruangan!' });
        }

        const kodeClean = kode.trim().toUpperCase();

        // Cari ruangan di database MongoDB
        const ruangan = await Ruangan.findOne({ kode: kodeClean });
        if (!ruangan) {
            return res.status(404).json({ error: 'Kode ruangan tidak ditemukan! Silakan buat ruangan terlebih dahulu.' });
        }

        res.json({ 
            success: true, 
            message: 'Berhasil masuk ke ruangan! 💕', 
            kode: ruangan.kode 
        });
    } catch (error) {
        console.error('Error masuk ruangan:', error);
        res.status(500).json({ error: 'Gagal memverifikasi ruangan.' });
    }
});


const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// ============================================
// KONEKSI MONGODB ATLAS
// ============================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected!'))
    .catch((err) => {
        console.error('❌ MongoDB Error:', err.message);
        process.exit(1);
    });

// ============================================
// SETUP UPLOAD FOLDER & MULTER
// ============================================

const uploadDir = path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (error) {
    console.log('Skip bikin folder uploads (serverless):', error.message);
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
// API ENDPOINT - TUGAS
// ============================================
// GET - Ambil semua tugas (bisa filter by ruangan)
app.get('/api/tugas', async (req, res) => {
    try {
        const ruangan = req.query.ruangan;
        
        let dataTugas;
        if (ruangan) {
            dataTugas = await Tugas.find({ ruangan });
        } else {
            dataTugas = await Tugas.find();
        }
        
        res.json(dataTugas);
    } catch (error) {
        console.error('Error GET tugas:', error);
        res.status(500).json({ error: 'Gagal ambil tugas' });
    }
});

// POST - Tambah tugas baru
app.post('/api/tugas', async (req, res) => {
    try {
        const { judul, deskripsi, deadline, pemilik, kategori, prioritas, status, ruangan } = req.body;
        
        if (!judul || !deadline || !ruangan) {
            return res.status(400).json({ 
                error: 'Judul, deadline, dan ruangan wajib diisi!' 
            });
        }
        
        const tugasBaru = await Tugas.create({
            judul,
            deskripsi: deskripsi || '',
            deadline,
            pemilik: pemilik || 'aku',
            kategori: kategori || 'Tugas',
            prioritas: prioritas || 'biasa',
            status: status || 'belum',
            ruangan,
            file: req.body.file || null,
            filename: req.body.filename || null
        });
        
        res.status(201).json(tugasBaru);
    } catch (error) {
        console.error('Error POST tugas:', error);
        res.status(500).json({ error: 'Gagal tambah tugas' });
    }
});

// PUT - Update tugas (toggle status / edit field)
app.put('/api/tugas/:id', async (req, res) => {
    try {
        const tugasCari = await Tugas.findById(req.params.id);
        
        if (!tugasCari) {
            return res.status(404).json({ error: 'Tugas tidak ditemukan' });
        }
        
        // Kalau ada field di body → edit field
        const { judul, deskripsi, deadline, pemilik, kategori, prioritas, status } = req.body;
        
        if (judul || deskripsi || deadline || pemilik || kategori || prioritas) {
            if (judul) tugasCari.judul = judul;
            if (deskripsi) tugasCari.deskripsi = deskripsi;
            if (deadline) tugasCari.deadline = deadline;
            if (pemilik) tugasCari.pemilik = pemilik;
            if (kategori) tugasCari.kategori = kategori;
            if (prioritas) tugasCari.prioritas = prioritas;
        } else {
            // Kalau nggak ada field → toggle status (selesai/belum)
            tugasCari.status = tugasCari.status === 'selesai' ? 'belum' : 'selesai';
        }
        
        if (status) tugasCari.status = status;
        
        await tugasCari.save();
        res.json(tugasCari);
    } catch (error) {
        console.error('Error PUT tugas:', error);
        res.status(500).json({ error: 'Gagal update tugas' });
    }
});

// DELETE - Hapus tugas
app.delete('/api/tugas/:id', async (req, res) => {
    try {
        const tugasHapus = await Tugas.findByIdAndDelete(req.params.id);
        
        if (!tugasHapus) {
            return res.status(404).json({ error: 'Tugas tidak ditemukan' });
        }
        
        res.json({ message: 'Tugas berhasil dihapus! 💕' });
    } catch (error) {
        console.error('Error DELETE tugas:', error);
        res.status(500).json({ error: 'Gagal hapus tugas' });
    }
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
app.post('/api/arsip', async (req, res) => {
    try {
        const { tugasId, matkul, keterangan, file, filename } = req.body;
        
        // Cari tugas di MongoDB
        const tugasAsli = await Tugas.findById(tugasId);
        if (!tugasAsli) {
            return res.status(404).json({ error: 'Tugas tidak ditemukan!' });
        }
        
        // Bikin arsip baru
        const arsipBaru = await Arsip.create({
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
            keterangan: keterangan || '-'
        });
        
        // Hapus tugas dari daftar aktif
        await Tugas.findByIdAndDelete(tugasId);
        
        res.status(201).json(arsipBaru);
    } catch (error) {
        console.error('Error POST arsip:', error);
        res.status(500).json({ error: 'Gagal tambah arsip' });
    }
});

// GET - Ambil semua arsip (filter by ruangan)
app.get('/api/arsip', async (req, res) => {
    try {
        const ruangan = req.query.ruangan;
        
        let dataArsip;
        if (ruangan) {
            dataArsip = await Arsip.find({ ruangan });
        } else {
            dataArsip = await Arsip.find();
        }
        
        res.json(dataArsip);
    } catch (error) {
        console.error('Error GET arsip:', error);
        res.status(500).json({ error: 'Gagal ambil arsip' });
    }
});

// GET - Ambil satu arsip
app.get('/api/arsip/:id', async (req, res) => {
    try {
        const arsip = await Arsip.findById(req.params.id);
        
        if (!arsip) {
            return res.status(404).json({ error: 'Arsip tidak ditemukan!' });
        }
        
        res.json(arsip);
    } catch (error) {
        console.error('Error GET arsip:', error);
        res.status(500).json({ error: 'Gagal ambil arsip' });
    }
});

// DELETE - Hapus arsip
app.delete('/api/arsip/:id', async (req, res) => {
    try {
        const arsipHapus = await Arsip.findByIdAndDelete(req.params.id);
        
        if (!arsipHapus) {
            return res.status(404).json({ error: 'Arsip tidak ditemukan!' });
        }
        
        res.json({ message: 'Arsip berhasil dihapus! 💕' });
    } catch (error) {
        console.error('Error DELETE arsip:', error);
        res.status(500).json({ error: 'Gagal hapus arsip' });
    }
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
        version: '1.0.0'
    });
});

// ============================================
// API ENDPOINT - GALERI (MUSEUM CINTA)
// ============================================

// Setup folder galeri di dalam uploads
const galeriDir = path.join(__dirname, 'uploads/galeri');
try {
    if (!fs.existsSync(galeriDir)) {
        fs.mkdirSync(galeriDir, { recursive: true });
    }
} catch (error) {
    console.log('Skip bikin folder galeri (serverless):', error.message);
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
app.post('/api/galeri', uploadGaleri.single('file'), async (req, res) => {
    try {
        const { judul, kategori, deskripsi, ruangan } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'File wajib diupload!' });
        }
        
        if (!judul || !ruangan) {
            return res.status(400).json({ error: 'Judul dan ruangan wajib diisi!' });
        }
        
        const isVideo = req.file.mimetype.startsWith('video/');
        
        const baru = await Galeri.create({
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
        });
        
        res.status(201).json(baru);
    } catch (error) {
        console.error('Error POST galeri:', error);
        res.status(500).json({ error: 'Gagal tambah galeri' });
    }
});

// GET - Ambil semua galeri (filter by ruangan)
app.get('/api/galeri', async (req, res) => {
    try {
        const ruangan = req.query.ruangan;
        
        let dataGaleri;
        if (ruangan) {
            dataGaleri = await Galeri.find({ ruangan });
        } else {
            dataGaleri = await Galeri.find();
        }
        
        res.json(dataGaleri);
    } catch (error) {
        console.error('Error GET galeri:', error);
        res.status(500).json({ error: 'Gagal ambil galeri' });
    }
});



// ============================================
// API ENDPOINT - KEUANGAN (DOMPETAKU)
// ============================================

// GET - Ambil semua pengeluaran (filter by ruangan)
app.get('/api/keuangan', async (req, res) => {
    try {
        const ruangan = req.query.ruangan;
        
        let dataKeuangan;
        if (ruangan) {
            dataKeuangan = await Keuangan.find({ ruangan });
        } else {
            dataKeuangan = await Keuangan.find();
        }
        
        res.json(dataKeuangan);
    } catch (error) {
        console.error('Error GET keuangan:', error);
        res.status(500).json({ error: 'Gagal ambil keuangan' });
    }
});

// POST - Tambah pengeluaran
app.post('/api/keuangan', async (req, res) => {
    try {
        const { nama, jumlah, tanggal, pemilik, kategori, deskripsi, ruangan } = req.body;
        
        if (!nama || !jumlah || !tanggal || !ruangan) {
            return res.status(400).json({ error: 'Nama, jumlah, tanggal, dan ruangan wajib diisi!' });
        }
        
        const baru = await Keuangan.create({
            nama,
            jumlah: Number(jumlah),
            tanggal,
            pemilik: pemilik || 'haris',
            kategori: kategori || 'Lainnya',
            deskripsi: deskripsi || '',
            ruangan
        });
        
        res.status(201).json(baru);
    } catch (error) {
        console.error('Error POST keuangan:', error);
        res.status(500).json({ error: 'Gagal tambah keuangan' });
    }
});

// DELETE - Hapus pengeluaran
app.delete('/api/keuangan/:id', async (req, res) => {
    try {
        const keuanganHapus = await Keuangan.findByIdAndDelete(req.params.id);
        
        if (!keuanganHapus) {
            return res.status(404).json({ error: 'Pengeluaran tidak ditemukan!' });
        }
        
        res.json({ message: 'Pengeluaran berhasil dihapus! 💕' });
    } catch (error) {
        console.error('Error DELETE keuangan:', error);
        res.status(500).json({ error: 'Gagal hapus keuangan' });
    }
});

// ============================================
// API ENDPOINT - LINK SAVER
// ============================================

// GET - Ambil semua link
app.get('/api/link', async (req, res) => {
    try {
        const ruangan = req.query.ruangan;
        
        let dataLink;
        if (ruangan) {
            dataLink = await Link.find({ ruangan });
        } else {
            dataLink = await Link.find();
        }
        
        res.json(dataLink);
    } catch (error) {
        console.error('Error GET link:', error);
        res.status(500).json({ error: 'Gagal ambil link' });
    }
});

// POST - Tambah link
app.post('/api/link', async (req, res) => {
    try {
        const { judul, url, kategori, pemilik, deskripsi, ruangan } = req.body;
        
        if (!judul || !url || !ruangan) {
            return res.status(400).json({ error: 'Judul, URL, dan ruangan wajib diisi!' });
        }
        
        const baru = await Link.create({
            judul,
            url,
            kategori: kategori || 'Lainnya',
            pemilik: pemilik || 'berdua',
            deskripsi: deskripsi || '',
            ruangan
        });
        
        res.status(201).json(baru);
    } catch (error) {
        console.error('Error POST link:', error);
        res.status(500).json({ error: 'Gagal tambah link' });
    }
});

// DELETE - Hapus link
app.delete('/api/link/:id', async (req, res) => {
    try {
        const linkHapus = await Link.findByIdAndDelete(req.params.id);
        
        if (!linkHapus) {
            return res.status(404).json({ error: 'Link tidak ditemukan!' });
        }
        
        res.json({ message: 'Link berhasil dihapus! 💕' });
    } catch (error) {
        console.error('Error DELETE link:', error);
        res.status(500).json({ error: 'Gagal hapus link' });
    }
});

// ============================================
// API ENDPOINT - GAME SUIT MULTIPLAYER
// ============================================

// POST - Buat room baru
app.post('/api/game/suit/create', async (req, res) => {
    try {
        const { ruangan, pemain } = req.body;
        
        // Generate kode room unik (cek di MongoDB)
        let kodeRoom;
        let sudahAda = true;
        while (sudahAda) {
            kodeRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
            const cek = await GameSuit.findOne({ kodeRoom });
            sudahAda = !!cek;
        }
        
        const roomBaru = await GameSuit.create({
            kodeRoom,
            ruangan,
            pemain1: pemain || 'haris',
            status: 'menunggu'
        });
        
        res.json(roomBaru);
    } catch (error) {
        console.error('Error POST game/suit/create:', error);
        res.status(500).json({ error: 'Gagal buat room' });
    }
});


// POST - Join room
app.post('/api/game/suit/join', async (req, res) => {
    try {
        const { kodeRoom, pemain } = req.body;
        
        // Cari room di MongoDB
        const room = await GameSuit.findOne({ kodeRoom });
        
        if (!room) {
            return res.status(404).json({ error: 'Room tidak ditemukan!' });
        }
        
        // Update pemain2 & status
        room.pemain2 = pemain || 'anita';
        room.status = 'siap';
        await room.save();
        
        res.json(room);
    } catch (error) {
        console.error('Error POST game/suit/join:', error);
        res.status(500).json({ error: 'Gagal join room' });
    }
});

// GET - Cek status room
app.get('/api/game/suit/room/:kodeRoom', async (req, res) => {
    try {
        const room = await GameSuit.findOne({ kodeRoom: req.params.kodeRoom });
        
        if (!room) {
            return res.status(404).json({ error: 'Room tidak ditemukan!' });
        }
        
        res.json(room);
    } catch (error) {
        console.error('Error GET game/suit/room:', error);
        res.status(500).json({ error: 'Gagal ambil room' });
    }
});

// POST - Pilih suit
app.post('/api/game/suit/pilih', async (req, res) => {
    try {
        const { kodeRoom, pemain, pilihan } = req.body;
        
        const room = await GameSuit.findOne({ kodeRoom });
        
        if (!room) {
            return res.status(404).json({ error: 'Room tidak ditemukan!' });
        }
        
        // Set pilihan sesuai pemain
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
        
        await room.save();
        res.json(room);
    } catch (error) {
        console.error('Error POST game/suit/pilih:', error);
        res.status(500).json({ error: 'Gagal pilih suit' });
    }
});

// POST - Reset room (main lagi)
app.post('/api/game/suit/reset', async (req, res) => {
    try {
        const { kodeRoom } = req.body;
        
        const room = await GameSuit.findOne({ kodeRoom });
        
        if (!room) {
            return res.status(404).json({ error: 'Room tidak ditemukan!' });
        }
        
        // Reset pilihan & hasil
        room.pilihan1 = null;
        room.pilihan2 = null;
        room.hasil = null;
        room.status = 'siap';
        
        await room.save();
        res.json(room);
    } catch (error) {
        console.error('Error POST game/suit/reset:', error);
        res.status(500).json({ error: 'Gagal reset room' });
    }
});

// ============================================
// API ENDPOINT - GAME BALAP MULTIPLAYER
// ============================================

// POST - Buat room balap
app.post('/api/game/balap/create', async (req, res) => {
    try {
        const { ruangan, pemain, mobil, warna, nama } = req.body;

        // Generate kode room unik (cek di MongoDB)
        let kodeRoom;
        let sudahAda = true;
        while (sudahAda) {
            kodeRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
            const cek = await GameBalap.findOne({ kodeRoom });
            sudahAda = !!cek;
        }

        const roomBaru = await GameBalap.create({
            kodeRoom,
            ruangan,
            status: 'menunggu',
            pemain1: {
                nama: pemain || 'Haris',
                mobil: mobil || '🚗',
                warna: warna || '#f093fb',
                namaMobil: nama || 'Pemain 1'
            },
            pemain2: null
        });

        res.json(roomBaru);
    } catch (error) {
        console.error('Error POST game/balap/create:', error);
        res.status(500).json({ error: 'Gagal buat room balap' });
    }
});

// POST - Join room balap
app.post('/api/game/balap/join', async (req, res) => {
    try {
        const { kodeRoom, pemain, mobil, warna, nama } = req.body;

        const room = await GameBalap.findOne({ kodeRoom });

        if (!room) {
            return res.status(404).json({ error: 'Room tidak ditemukan!' });
        }

        if (room.pemain2) {
            return res.status(400).json({ error: 'Room sudah penuh!' });
        }

        room.pemain2 = {
            nama: pemain || 'Anita',
            mobil: mobil || '🚙',
            warna: warna || '#4facfe',
            namaMobil: nama || 'Pemain 2'
        };
        room.status = 'siap';

        await room.save();
        res.json(room);
    } catch (error) {
        console.error('Error POST game/balap/join:', error);
        res.status(500).json({ error: 'Gagal join room balap' });
    }
});

// GET - Cek status room
app.get('/api/game/balap/room/:kodeRoom', async (req, res) => {
    try {
        const room = await GameBalap.findOne({ kodeRoom: req.params.kodeRoom });
        
        if (!room) {
            return res.status(404).json({ error: 'Room tidak ditemukan!' });
        }
        
        res.json(room);
    } catch (error) {
        console.error('Error GET game/balap/room:', error);
        res.status(500).json({ error: 'Gagal ambil room balap' });
    }
});

// POST - Update posisi pemain
app.post('/api/game/balap/update', async (req, res) => {
    try {
        const { kodeRoom, pemain, posisiX, posisiY, lap, kecepatan } = req.body;

        const room = await GameBalap.findOne({ kodeRoom });

        if (!room) {
            return res.status(404).json({ error: 'Room tidak ditemukan!' });
        }

        const dataPemain = room[pemain];

        if (dataPemain) {
            dataPemain.posisiX = posisiX;
            dataPemain.posisiY = posisiY;
            dataPemain.lap = lap;
            dataPemain.kecepatan = kecepatan;
        }

        await room.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error POST game/balap/update:', error);
        res.status(500).json({ error: 'Gagal update posisi' });
    }
});

// POST - Pemain finish
app.post('/api/game/balap/finish', async (req, res) => {
    try {
        const { kodeRoom, pemain, waktu } = req.body;

        const room = await GameBalap.findOne({ kodeRoom });

        if (!room) {
            return res.status(404).json({ error: 'Room tidak ditemukan!' });
        }

        if (room[pemain]) {
            room[pemain].selesai = true;
            room[pemain].waktuSelesai = waktu;
        }

        // Cek apakah kedua pemain selesai
        if (room.pemain1?.selesai && room.pemain2?.selesai) {
            room.status = 'selesai';
        }

        await room.save();
        res.json(room);
    } catch (error) {
        console.error('Error POST game/balap/finish:', error);
        res.status(500).json({ error: 'Gagal finish balapan' });
    }
});

// POST - Mulai balapan (kedua pemain siap)
app.post('/api/game/balap/start', async (req, res) => {
    try {
        const { kodeRoom } = req.body;

        const room = await GameBalap.findOne({ kodeRoom });

        if (!room) {
            return res.status(404).json({ error: 'Room tidak ditemukan!' });
        }

        room.status = 'berjalan';
        await room.save();

        res.json(room);
    } catch (error) {
        console.error('Error POST game/balap/start:', error);
        res.status(500).json({ error: 'Gagal start balapan' });
    }
});

// ============================================
// API ENDPOINT - PETUALANGAN (CATAT KEGIATAN)
// ============================================


// Setup folder upload petualangan
const petualanganDir = path.join(__dirname, 'uploads/petualangan');
try {
    if (!fs.existsSync(petualanganDir)) {
        fs.mkdirSync(petualanganDir, { recursive: true });
    }
} catch (error) {
    console.log('Skip bikin folder petualangan (serverless):', error.message);
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
app.post('/api/petualangan', uploadPetualangan.single('foto'), async (req, res) => {
    try {
        const { tempat, tanggal, durasi, jarak, medan, cuaca, deskripsi, ruangan } = req.body;
        
        if (!tempat || !tanggal || !ruangan) {
            return res.status(400).json({ error: 'Tempat, tanggal, dan ruangan wajib diisi!' });
        }
        
        const baru = await Petualangan.create({
            tempat,
            tanggal,
            durasi: durasi || '-',
            jarak: jarak || '-',
            medan: medan || 'Sedang',
            cuaca: cuaca || 'Cerah',
            deskripsi: deskripsi || '',
            foto: req.file ? req.file.filename : null,
            ruangan
        });
        
        res.status(201).json(baru);
    } catch (error) {
        console.error('Error POST petualangan:', error);
        res.status(500).json({ error: 'Gagal tambah petualangan' });
    }
});

// GET - Ambil semua kegiatan (filter by ruangan)
app.get('/api/petualangan', async (req, res) => {
    try {
        const ruangan = req.query.ruangan;
        
        let dataPetualangan;
        if (ruangan) {
            dataPetualangan = await Petualangan.find({ ruangan });
        } else {
            dataPetualangan = await Petualangan.find();
        }
        
        res.json(dataPetualangan);
    } catch (error) {
        console.error('Error GET petualangan:', error);
        res.status(500).json({ error: 'Gagal ambil petualangan' });
    }
});

// DELETE - Hapus kegiatan
app.delete('/api/petualangan/:id', async (req, res) => {
    try {
        // Cari & hapus di MongoDB
        const itemHapus = await Petualangan.findByIdAndDelete(req.params.id);
        
        if (!itemHapus) {
            return res.status(404).json({ error: 'Kegiatan tidak ditemukan!' });
        }
        
        // Hapus file foto dari folder uploads
        if (itemHapus.foto) {
            const filePath = path.join(petualanganDir, itemHapus.foto);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        res.json({ message: 'Kegiatan berhasil dihapus! 💕' });
    } catch (error) {
        console.error('Error DELETE petualangan:', error);
        res.status(500).json({ error: 'Gagal hapus petualangan' });
    }
});

// ============================================
// API ENDPOINT - CHECKLIST PETUALANGAN
// ============================================


// GET - Ambil semua checklist
app.get('/api/checklist', async (req, res) => {
    try {
        const ruangan = req.query.ruangan;
        
        let dataChecklist;
        if (ruangan) {
            dataChecklist = await Checklist.find({ ruangan });
        } else {
            dataChecklist = await Checklist.find();
        }
        
        res.json(dataChecklist);
    } catch (error) {
        console.error('Error GET checklist:', error);
        res.status(500).json({ error: 'Gagal ambil checklist' });
    }
});

// POST - Tambah item checklist
app.post('/api/checklist', async (req, res) => {
    try {
        const { nama, kategori, ruangan } = req.body;
        
        if (!nama || !ruangan) {
            return res.status(400).json({ error: 'Nama & ruangan wajib diisi!' });
        }
        
        const baru = await Checklist.create({
            nama,
            kategori: kategori || 'alat',
            checked: false,
            ruangan
        });
        
        res.status(201).json(baru);
    } catch (error) {
        console.error('Error POST checklist:', error);
        res.status(500).json({ error: 'Gagal tambah checklist' });
    }
});

// PUT - Toggle checked
app.put('/api/checklist/:id', async (req, res) => {
    try {
        const item = await Checklist.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ error: 'Item tidak ditemukan!' });
        }
        
        item.checked = !item.checked;
        await item.save();
        
        res.json(item);
    } catch (error) {
        console.error('Error PUT checklist:', error);
        res.status(500).json({ error: 'Gagal toggle checklist' });
    }
});

// DELETE - Hapus item
app.delete('/api/checklist/:id', async (req, res) => {
    try {
        const itemHapus = await Checklist.findByIdAndDelete(req.params.id);
        
        if (!itemHapus) {
            return res.status(404).json({ error: 'Item tidak ditemukan!' });
        }
        
        res.json({ message: 'Item berhasil dihapus! 💕' });
    } catch (error) {
        console.error('Error DELETE checklist:', error);
        res.status(500).json({ error: 'Gagal hapus checklist' });
    }
});

// POST - Reset semua checklist
app.post('/api/checklist/reset', async (req, res) => {
    try {
        const { ruangan } = req.body;
        
        if (!ruangan) {
            return res.status(400).json({ error: 'Ruangan wajib diisi!' });
        }
        
        // Update semua item di ruangan ini, set checked = false
        await Checklist.updateMany(
            { ruangan },
            { checked: false }
        );
        
        res.json({ message: 'Checklist direset! 💕' });
    } catch (error) {
        console.error('Error RESET checklist:', error);
        res.status(500).json({ error: 'Gagal reset checklist' });
    }
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
app.get('/api/statistik', async (req, res) => {
    try {
        const ruangan = req.query.ruangan;
        
        let dataPetualangan;
        if (ruangan) {
            dataPetualangan = await Petualangan.find({ ruangan });
        } else {
            dataPetualangan = await Petualangan.find();
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
    } catch (error) {
        console.error('Error GET statistik:', error);
        res.status(500).json({ error: 'Gagal ambil statistik' });
    }
});

// POST - Update target
app.post('/api/statistik/target', async (req, res) => {
    try {
        const { targetGunung, targetJarak, targetKegiatan, ruangan } = req.body;
        
        if (targetGunung) targetPetualangan.targetGunung = Number(targetGunung);
        if (targetJarak) targetPetualangan.targetJarak = Number(targetJarak);
        if (targetKegiatan) targetPetualangan.targetKegiatan = Number(targetKegiatan);
        targetPetualangan.ruangan = ruangan;
        
        // Simpan ke MongoDB
        let dataTarget = await Target.findOne({ ruangan });
        
        if (!dataTarget) {
            dataTarget = await Target.create({
                ruangan,
                targetGunung: targetPetualangan.targetGunung,
                targetJarak: targetPetualangan.targetJarak,
                targetKegiatan: targetPetualangan.targetKegiatan
            });
        } else {
            dataTarget.targetGunung = targetPetualangan.targetGunung;
            dataTarget.targetJarak = targetPetualangan.targetJarak;
            dataTarget.targetKegiatan = targetPetualangan.targetKegiatan;
            await dataTarget.save();
        }
        
        res.json({ 
            message: 'Target berhasil diupdate! 💕', 
            target: {
                targetGunung: dataTarget.targetGunung,
                targetJarak: dataTarget.targetJarak,
                targetKegiatan: dataTarget.targetKegiatan
            }
        });
    } catch (error) {
        console.error('Error POST statistik target:', error);
        res.status(500).json({ error: 'Gagal update target' });
    }
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

// GET - Ambil info kado
app.get('/api/kado', async (req, res) => {
    try {
        const ruangan = req.query.ruangan || 'default';
        const tanggalHariIni = new Date().toISOString().split('T')[0];
        
        // Cari kado ruangan — atau bikin baru kalau belum ada
        let data = await Kado.findOne({ ruangan });
        
        if (!data) {
            data = await Kado.create({ ruangan });
        }
        
        // Cek reset harian
        if (data.tanggalTerakhir !== tanggalHariIni) {
            data.tanggalTerakhir = tanggalHariIni;
            data.kadoHariIni = 0;
            data.kadoTerbuka = [];
            await data.save();
        }
        
        res.json({
            ruangan,
            totalDibuka: data.totalDibuka,
            kadoHariIni: data.kadoHariIni,
            kadoTerbuka: data.kadoTerbuka,
            riwayat: data.riwayat,
            maxHariIni: 2
        });
    } catch (error) {
        console.error('Error GET kado:', error);
        res.status(500).json({ error: 'Gagal ambil kado' });
    }
});

// POST - Buka kado
app.post('/api/kado/buka', async (req, res) => {
    try {
        const { index, ruangan } = req.body;
        const tanggalHariIni = new Date().toISOString().split('T')[0];
        
        // Cari kado ruangan — atau bikin baru kalau belum ada
        let data = await Kado.findOne({ ruangan });
        if (!data) {
            data = await Kado.create({ ruangan });
        }
        
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
        
        // Simpan ke MongoDB
        await data.save();
        
        res.json({
            success: true,
            kado: item,
            totalDibuka: data.totalDibuka,
            kadoHariIni: data.kadoHariIni
        });
    } catch (error) {
        console.error('Error POST kado buka:', error);
        res.status(500).json({ error: 'Gagal buka kado' });
    }
});

// POST - Reset kado per ruangan
app.post('/api/kado/reset', async (req, res) => {
    try {
        const { ruangan } = req.body;
        
        if (!ruangan) {
            return res.status(400).json({ error: 'Ruangan wajib diisi!' });
        }
        
        // Cari & reset
        let data = await Kado.findOne({ ruangan });
        
        if (!data) {
            data = await Kado.create({ ruangan });
        } else {
            data.totalDibuka = 0;
            data.riwayat = [];
            data.kadoHariIni = 0;
            data.tanggalTerakhir = null;
            data.kadoTerbuka = [];
            await data.save();
        }
        
        res.json({ message: 'Kado berhasil direset! 💕' });
    } catch (error) {
        console.error('Error POST kado reset:', error);
        res.status(500).json({ error: 'Gagal reset kado' });
    }
});



// ============================================
// JALANKAN SERVER
// ============================================

// Kalau di lokal (bukan Vercel) → jalankan server
if (process.env.NODE_ENV !== 'production') {
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
}

// Export untuk Vercel serverless
module.exports = app;