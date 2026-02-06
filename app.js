const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const path = require('path');
const methodOverride = require('method-override');
const fs = require('fs');
const Photo = require('./models/Photo');

const app = express();

/* ===== DB CONNECTION ===== */
async function connectDB() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/pcat-test-db');
    console.log("✅ MongoDB bağlandı");
  } catch (err) {
    console.error("❌ MongoDB bağlantı hatası:", err.message);
  }
}
connectDB();

/* ===== TEMPLATE ENGINE ===== */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ===== MIDDLEWARE ===== */
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(methodOverride('_method', {
  methods: ['POST', 'GET'],
}));

/* ===== ROUTES ===== */

// 1. ANA SAYFA: Tüm fotoğrafları listele
app.get('/', async (req, res) => {
  const photos = await Photo.find({}).sort('-dateCreated');
  res.render('index', { photos });
});

// 2. FOTOĞRAF DETAY SAYFASI
app.get('/photos/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).send("Fotoğraf bulunamadı.");
    res.render('photo', { photo });
  } catch (error) {
    res.status(500).send("Sunucu hatası.");
  }
});

// 3. STATİK SAYFALAR
app.get('/about', (req, res) => res.render('about'));
app.get('/add', (req, res) => res.render('add'));

/* ===== CRUD İŞLEMLERİ ===== */

// 4. OLUŞTURMA: Yeni fotoğraf ekle ve uploads klasörüne kaydet
app.post('/photos', async (req, res) => {
  const uploadDir = 'public/uploads';

  // public/uploads klasörü yoksa oluştur
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('Hiç dosya seçilmedi.');
  }

  let uploadedImage = req.files.image;
  let uploadPath = path.join(__dirname, uploadDir, uploadedImage.name);

  uploadedImage.mv(uploadPath, async () => {
    await Photo.create({
      ...req.body,
      image: '/uploads/' + uploadedImage.name
    });
    res.redirect('/');
  });
});

// 5. GÜNCELLEME SAYFASI: Edit formunu getir
app.get('/photos/edit/:id', async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  res.render('edit', { photo });
});

// 6. GÜNCELLEME: Verileri güncelle (Sadece başlık ve açıklama)
app.put('/photos/:id', async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  photo.title = req.body.title;
  photo.description = req.body.description;
  await photo.save();
  res.redirect(`/photos/${req.params.id}`);
});

// 7. SİLME: Hem veritabanından hem de uploads klasöründen siler
app.delete('/photos/:id', async (req, res) => {
  try {
    const photo = await Photo.findOne({ _id: req.params.id });
    
    // Dosya yolunu oluştur (public + /uploads/resim.jpg)
    let imagePath = __dirname + '/public' + photo.image;

    // Klasörde dosya var mı diye kontrol et ve sil
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Veritabanı kaydını sil
    await Photo.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    res.status(500).send("Silme işlemi sırasında hata oluştu.");
  }
});

/* ===== SERVER START ===== */
const port = 3000;
app.listen(port, () => {
  console.log(`🚀 Sunucu http://localhost:${port} adresinde çalışıyor`);
});