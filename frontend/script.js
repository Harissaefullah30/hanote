// ============================================
// HANOTE - FRONTEND LOGIC
// ============================================

// Konfigurasi
const API_URL = 'https://hanote-backend.vercel.app/api';
let ruanganAktif = '';
let semuaTugas = [];
let filterAktif = 'semua';

// Quote cinta (random)
const quotes = [
    '💕 "Cinta itu seperti belajar, butuh kesabaran dan keikhlasan"',
    '🌸 "Belajar bersamamu, membuat segala hal terasa indah"',
    '❤️ "Cinta dan ilmu, dua hal yang tak pernah cukup dipelajari"',
    '🌺 "Setiap tugas selesai, cinta kita makin kuat"',
    '💖 "Bersamamu, belajar jadi petualangan yang menyenangkan"',
    '🌷 "Cinta adalah guru terbaik dalam hidup"',
    '💗 "Menghitung deadline, sambil menghitung detik bertemu denganmu"',
    '🌻 "Belajar itu berat, tapi bersama kamu terasa ringan"'
];

// ============================================
// FUNGSI LOGIN / MASUK RUANGAN
// ============================================

// ============================================
// FUNGSI LOGIN / MASUK RUANGAN (MONGODB)
// ============================================
async function masukRuangan() {
    const input = document.getElementById('inputRuangan');
    const pesan = document.getElementById('pesanLogin');
    const kode = input.value.trim().toUpperCase();

    if (!kode) {
        pesan.className = 'pesan error';
        pesan.textContent = '⚠️ Masukkan kode ruangan!';
        return;
    }

    try {
        pesan.className = 'pesan';
        pesan.textContent = '⏳ Memeriksa ruangan...';

        // Verifikasi kode ruangan ke backend MongoDB Vercel
        const response = await fetch(`${API_URL}/ruangan/masuk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kode: kode })
        });

        const data = await response.json();

        if (!response.ok) {
            pesan.className = 'pesan error';
            pesan.textContent = `❌ ${data.error || 'Kode ruangan tidak ditemukan!'}`;
            return;
        }

        // Simpan ruangan aktif
        ruanganAktif = data.kode;
        localStorage.setItem('ruanganHanote', data.kode);

        pesan.className = 'pesan success';
        pesan.textContent = '✅ Berhasil masuk ke ruangan! 💕';

        // Pindah ke dashboard setelah 1 detik
        setTimeout(() => {
    // Redirect ke dashboard.html
    window.location.href = 'dashboard.html';
}, 1000);

    } catch (err) {
        console.error('Error login:', err);
        pesan.className = 'pesan error';
        pesan.textContent = '❌ Gagal terhubung ke server backend.';
    }
}

function buatRuangan() {
    // Sembunyikan halaman login
    document.getElementById('halamanLogin').style.display = 'none';
    // Tampilkan halaman buat ruangan
    document.getElementById('halamanBuatRuangan').style.display = 'block';
    
    // Kosongkan input
    document.getElementById('inputNamaRuangan').value = '';
    document.getElementById('inputSandiRuangan').value = '';
    document.getElementById('inputDeskripsiRuangan').value = '';
    document.getElementById('pesanBuatRuangan').textContent = '';
    document.getElementById('pesanBuatRuangan').className = 'pesan';
}

function kembaliKeLogin() {
    document.getElementById('halamanBuatRuangan').style.display = 'none';
    document.getElementById('halamanLogin').style.display = 'block';
}

async function simpanRuanganBaru() {
    const nama = document.getElementById('inputNamaRuangan').value.trim();
    const sandi = document.getElementById('inputSandiRuangan').value.trim();
    const deskripsi = document.getElementById('inputDeskripsiRuangan').value.trim();
    const pesan = document.getElementById('pesanBuatRuangan');
    
    // Validasi
    if (!nama) {
        pesan.className = 'pesan error';
        pesan.textContent = '⚠️ Nama ruangan wajib diisi!';
        return;
    }
    
    if (nama.length < 4) {
        pesan.className = 'pesan error';
        pesan.textContent = '⚠️ Nama ruangan minimal 4 karakter!';
        return;
    }
    
    try {
        pesan.className = 'pesan';
        pesan.textContent = '⏳ Membuat ruangan...';
        
        // Kirim ke backend MongoDB
        const response = await fetch(`${API_URL}/ruangan/buat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kode: nama })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            pesan.className = 'pesan error';
            pesan.textContent = `❌ ${data.error || 'Gagal membuat ruangan!'}`;
            return;
        }
        
        // Simpan ke localStorage (untuk auto-login)
        localStorage.setItem('ruanganHanote', nama);
        
        pesan.className = 'pesan success';
        pesan.textContent = `✅ Ruangan "${nama}" berhasil dibuat! 💕`;
        
        // Redirect ke index.html setelah 1,5 detik
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error buat ruangan:', error);
        pesan.className = 'pesan error';
        pesan.textContent = '❌ Gagal terhubung ke server backend.';
    }
}

function tutupModalBuatRuangan() {
    document.getElementById('modalBuatRuangan').style.display = 'none';
    document.getElementById('pesanBuatRuangan').textContent = '';
    document.getElementById('pesanBuatRuangan').className = 'pesan';
}

function keluarRuangan() {
    if (confirm('Yakin mau keluar? Data tetap tersimpan kok! 💕')) {
        ruanganAktif = '';
        localStorage.removeItem('ruanganHanote');
        document.getElementById('halamanLogin').style.display = 'flex';
        document.getElementById('halamanUtama').style.display = 'none';
        document.getElementById('inputRuangan').value = '';
    }
}

function tampilkanQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    document.getElementById('quoteBanner').textContent = quotes[randomIndex];
}

// ============================================
// FUNGSI RESET (HAPUS SEMUA RUANGAN)
// ============================================

function resetRuangan() {
    if (confirm('Yakin mau hapus semua ruangan?')) {
        localStorage.removeItem('daftarRuangan');
        localStorage.removeItem('ruanganHanote');
        alert('✅ Semua ruangan telah direset!');
        location.reload();
    }
}

// ============================================
// FUNGSI CRUD TUGAS
// ============================================

// Ambil semua tugas dari server
async function ambilTugas() {
    try {
        const response = await fetch(`${API_URL}/tugas?ruangan=${ruanganAktif}`);
        if (!response.ok) throw new Error('Gagal mengambil data');
        semuaTugas = await response.json();
        tampilkanTugas();
        updateStatistik();
    } catch (error) {
        console.error('Gagal ambil tugas:', error);
        document.getElementById('daftarTugas').innerHTML = `
            <div class="kosong">
                <span>⚠️</span>
                <p>Gagal konek ke server!</p>
                <p class="sub">Pastikan server backend berjalan di localhost:3000</p>
            </div>
        `;
    }
}

// Tampilkan tugas ke layar
function tampilkanTugas() {
    let tugasFilter = [...semuaTugas];
    
    // Filter
    if (filterAktif === 'aku') {
        tugasFilter = tugasFilter.filter(t => t.pemilik === 'aku');
    } else if (filterAktif === 'pacar') {
        tugasFilter = tugasFilter.filter(t => t.pemilik === 'pacar');
    } else if (filterAktif === 'selesai') {
        tugasFilter = tugasFilter.filter(t => t.status === 'selesai');
    } else if (filterAktif === 'belum') {
        tugasFilter = tugasFilter.filter(t => t.status !== 'selesai');
    }
    
    // Urutkan berdasarkan deadline terdekat
    tugasFilter.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    const container = document.getElementById('daftarTugas');
    
    if (tugasFilter.length === 0) {
        container.innerHTML = `
            <div class="kosong">
                <span>📭</span>
                <p>${filterAktif === 'semua' ? 'Belum ada tugas di ruangan ini' : 'Tidak ada tugas di filter ini'}</p>
                <p class="sub">${filterAktif === 'semua' ? 'Ayo tambah tugas pertama! 💕' : 'Coba filter lain ya!'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tugasFilter.map(t => {
        const deadline = new Date(t.deadline);
        const sekarang = new Date();
        const selisihHari = Math.ceil((deadline - sekarang) / (1000 * 60 * 60 * 24));
        
        let badgeDeadline = 'badge-hijau';
        let labelDeadline = `${selisihHari} hari lagi`;
        if (selisihHari < 0) {
            badgeDeadline = 'badge-merah';
            labelDeadline = '⏰ Lewat!';
        } else if (selisihHari <= 2) {
            badgeDeadline = 'badge-kuning';
            labelDeadline = `⚠️ ${selisihHari} hari`;
        }
        
        const badgePemilik = t.pemilik === 'aku' ? 'badge-aku' : 'badge-pacar';
        const labelPemilik = t.pemilik === 'aku' ? '👨 Haris' : '👩 Anita';
        
        const badgeKategori = 'badge-kategori';
        const labelKategori = t.kategori || '📚 Tugas';
        
        const badgePrioritas = 'badge-prioritas';
        const labelPrioritas = t.prioritas === 'penting' ? '🔴 Penting' : t.prioritas === 'ringan' ? '🟢 Ringan' : '⚪ Biasa';
        
        const statusSelesai = t.status === 'selesai' ? 'selesai' : '';
        const tombolStatus = t.status === 'selesai' ? '↩️ Batal' : '✅ Selesai';
        
        return `
            <div class="tugas-item ${statusSelesai}">
                <div class="tugas-info">
                    <div class="tugas-judul">${t.judul}</div>
                    ${t.deskripsi ? `<div class="tugas-deskripsi">${t.deskripsi}</div>` : ''}
                    <div class="tugas-meta">
                        <span>📅 ${t.deadline}</span>
                        <span class="badge ${badgeDeadline}">${labelDeadline}</span>
                        <span class="badge ${badgePemilik}">${labelPemilik}</span>
                        <span class="badge ${badgeKategori}">${labelKategori}</span>
                        <span class="badge ${badgePrioritas}">${labelPrioritas}</span>
                    </div>
                    ${t.file ? `
    <div class="tugas-file">
        <a href="${API_URL.replace('/api', '')}/uploads/${t.file}" download class="btn btn-small btn-outline">
            📎 Download ${t.filename || 'file'}
        </a>
    </div>
` : ''}
                </div>
                <div class="tugas-aksi">
                    <button class="btn btn-success btn-small" onclick="toggleSelesai('${t._id}')">
                        ${tombolStatus}
                    </button>
                    <button class="btn btn-danger btn-small" onclick="hapusTugas('${t._id}')">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

// Update statistik
function updateStatistik() {
    const total = semuaTugas.length;
    const selesai = semuaTugas.filter(t => t.status === 'selesai').length;
    const belum = total - selesai;
    
    document.getElementById('totalTugas').textContent = total;
    document.getElementById('totalSelesai').textContent = selesai;
    document.getElementById('totalBelum').textContent = belum;
}

// Tambah tugas baru
async function tambahTugas() {
    const judul = document.getElementById('inputJudul').value.trim();
    const deadline = document.getElementById('inputDeadline').value;
    const pemilik = document.getElementById('inputPemilik').value;
    const kategori = document.getElementById('inputKategori').value;
    const prioritas = document.getElementById('inputPrioritas').value;
    const deskripsi = document.getElementById('inputDeskripsi').value.trim();
    const fileInput = document.getElementById('inputFile');
    const file = fileInput.files[0];
    
    if (!judul || !deadline) {
        alert('⚠️ Judul dan deadline wajib diisi!');
        return;
    }
    
    let fileData = null;
    
    // Upload file jika ada
    if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const uploadRes = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (!uploadRes.ok) throw new Error('Gagal upload file');
            fileData = await uploadRes.json();
        } catch (error) {
            console.error('Error upload:', error);
            alert('❌ Gagal upload file!');
            return;
        }
    }
    
    const data = {
        judul,
        deskripsi,
        deadline,
        pemilik,
        kategori,
        prioritas,
        ruangan: ruanganAktif,
        file: fileData ? fileData.filename : null,
        filename: fileData ? fileData.originalname : null
    };
    
    try {
        const response = await fetch(`${API_URL}/tugas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Gagal tambah tugas');
        
        // Kosongkan form
        document.getElementById('inputJudul').value = '';
        document.getElementById('inputDeskripsi').value = '';
        document.getElementById('inputDeadline').value = '';
        document.getElementById('inputFile').value = '';
        
        await ambilTugas();
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Gagal menambah tugas! Pastikan server backend jalan.');
    }
}
   

// Toggle status selesai/belum
function toggleSelesai(id) {
    // Buka form arsip
    bukaFormArsip(id);
}

// Hapus tugas
async function hapusTugas(id) {
    if (!confirm('Yakin mau hapus tugas ini? 💔')) return;
    
    try {
        await fetch(`${API_URL}/tugas/${id}`, { method: 'DELETE' });
        await ambilTugas();
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Gagal hapus tugas!');
    }
}

function filterTugas(filter, element) {
    filterAktif = filter;
    document.querySelectorAll('.filter button').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    tampilkanTugas();
}

// ============================================
// FUNGSI ARSIP TUGAS
// ============================================

let arsipId = null;

function bukaFormArsip(id) {
    const tugas = semuaTugas.find(t => t._id === id);
    if (!tugas) {
        alert('Tugas tidak ditemukan!');
        return;
    }
    
    arsipId = id;
    
    document.getElementById('arsipJudul').value = tugas.judul;
    document.getElementById('arsipMatkul').value = tugas.matkul || '';
    document.getElementById('arsipDeadline').value = tugas.deadline;
    document.getElementById('arsipDeskripsi').value = tugas.deskripsi || '';
    document.getElementById('arsipKeterangan').value = '';
    document.getElementById('arsipFile').value = '';
    document.getElementById('pesanArsip').textContent = '';
    document.getElementById('pesanArsip').className = 'pesan';
    
    document.getElementById('modalArsip').style.display = 'flex';
}

function tutupModalArsip() {
    document.getElementById('modalArsip').style.display = 'none';
    arsipId = null;
}

async function simpanArsip() {
    const matkul = document.getElementById('arsipMatkul').value.trim();
    const keterangan = document.getElementById('arsipKeterangan').value.trim();
    const fileInput = document.getElementById('arsipFile');
    const file = fileInput.files[0];
    const pesan = document.getElementById('pesanArsip');
    
    if (!matkul) {
        pesan.className = 'pesan error';
        pesan.textContent = '⚠️ Mata kuliah wajib diisi!';
        return;
    }
    
    let fileData = null;
    
    // Upload file jika ada
    if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const uploadRes = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (!uploadRes.ok) throw new Error('Gagal upload file');
            fileData = await uploadRes.json();
        } catch (error) {
            pesan.className = 'pesan error';
            pesan.textContent = '❌ Gagal upload file!';
            return;
        }
    }
    
    const data = {
        tugasId: arsipId,
        matkul: matkul,
        keterangan: keterangan || '-',
        file: fileData ? fileData.filename : null,
        filename: fileData ? fileData.originalname : null
    };
    
    try {
        const response = await fetch(`${API_URL}/arsip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Gagal mengarsipkan tugas');
        
        pesan.className = 'pesan success';
        pesan.textContent = '✅ Tugas berhasil diarsipkan! 💕';
        
        // Hapus tugas dari daftar aktif
        await fetch(`${API_URL}/tugas/${arsipId}`, { method: 'DELETE' });
        
        setTimeout(() => {
            tutupModalArsip();
            ambilTugas();
        }, 1000);
        
    } catch (error) {
        console.error('Error:', error);
        pesan.className = 'pesan error';
        pesan.textContent = '❌ Gagal mengarsipkan tugas!';
    }
}

// ============================================
// FUNGSI TAB
// ============================================

function bukaTab(tab, element) {
    // Sembunyikan semua tab
    document.getElementById('daftarTugas').style.display = 'none';
    document.getElementById('daftarArsip').style.display = 'none';
    
    // Tampilkan tab yang dipilih
    if (tab === 'tugas') {
        document.getElementById('daftarTugas').style.display = 'block';
    } else if (tab === 'arsip') {
        document.getElementById('daftarArsip').style.display = 'block';
        ambilArsip();
    }
    
    // Update class aktif
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }
}

// ============================================
// FUNGSI ARSIP
// ============================================

async function ambilArsip() {
    try {
        const response = await fetch(`${API_URL}/arsip?ruangan=${ruanganAktif}`);
        if (!response.ok) throw new Error('Gagal mengambil arsip');
        const data = await response.json();
        tampilkanArsip(data);
    } catch (error) {
        console.error('Error ambil arsip:', error);
        document.getElementById('daftarArsip').innerHTML = `
            <div class="kosong">
                <span>⚠️</span>
                <p>Gagal memuat arsip!</p>
            </div>
        `;
    }
}

function tampilkanArsip(data) {
    const container = document.getElementById('daftarArsip');
    
    if (data.length === 0) {
        container.innerHTML = `
            <div class="kosong">
                <span>📭</span>
                <p>Belum ada tugas yang diarsipkan</p>
                <p class="sub">Selesaikan tugas dulu ya! 💕</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.map(a => {
        const badgePemilik = a.pemilik === 'aku' ? 'badge-aku' : 'badge-pacar';
        const labelPemilik = a.pemilik === 'aku' ? '👨 Haris' : '👩 Anita';
        
        return `
            <div class="tugas-item" style="border-left-color: #a78bb8;">
                <div class="tugas-info">
                    <div class="tugas-judul">📂 ${a.judul}</div>
                    <div class="tugas-deskripsi">${a.deskripsi || 'Tidak ada deskripsi'}</div>
                    <div class="tugas-meta">
                        <span>📚 ${a.matkul || 'Tidak ada'}</span>
                        <span>📅 Deadline: ${a.deadline}</span>
                        <span>📅 Diarsip: ${a.tanggalDiarsip ? a.tanggalDiarsip.split('T')[0] : '-'}</span>
                        <span class="badge ${badgePemilik}">${labelPemilik}</span>
                        <span class="badge badge-kategori">${a.kategori || 'Tugas'}</span>
                        <span class="badge badge-prioritas">${a.prioritas || 'biasa'}</span>
                    </div>
                    ${a.keterangan ? `<div class="tugas-deskripsi" style="color:#f5576c;">✏️ Keterangan: ${a.keterangan}</div>` : ''}
                    ${a.file ? `
                        <div class="tugas-file">
                            <a href="${API_URL.replace('/api', '')}/uploads/${a.file}" download class="btn btn-small btn-outline">
                                📎 Download ${a.filename || 'file'}
                            </a>
                        </div>
                    ` : ''}
                </div>
                <div class="tugas-aksi">
                    <button class="btn btn-danger btn-small" onclick="hapusArsip('${a._id}')">🗑️ Hapus</button>
                </div>
            </div>
        `;
    }).join('');
}

async function hapusArsip(id) {
    if (!confirm('Yakin mau menghapus arsip ini? 💔')) return;
    
    try {
        const response = await fetch(`${API_URL}/arsip/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Gagal hapus arsip');
        await ambilArsip();
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Gagal menghapus arsip!');
    }
}