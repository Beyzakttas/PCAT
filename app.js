const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const path = require('path');
const methodOverride = require('method-override');
const PhotoController=require('./controllers/photoControllers');
const pageController=require('./controllers/pageController');
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
app.get('/',PhotoController.getAllPhotos);
// 2. FOTOĞRAF DETAY SAYFASI
app.get('/photos/:id', PhotoController.getPhoto);
// 3. STATİK SAYFALAR
app.get('/about',pageController.getAboutPage );
app.get('/add',pageController.getAddPage );
// 5. GÜNCELLEME SAYFASI: Edit formunu getir
app.get('/photos/edit/:id',pageController.geteditPage );
/* ===== CRUD İŞLEMLERİ ===== */
// 4. OLUŞTURMA: Yeni fotoğraf ekle ve uploads klasörüne kaydet
app.post('/photos',PhotoController.createPhoto);
// 6. GÜNCELLEME: Verileri güncelle (Sadece başlık ve açıklama)
app.put('/photos/:id',PhotoController.updatePhoto);
// 7. SİLME: Hem veritabanından hem de uploads klasöründen siler
app.delete('/photos/:id',PhotoController.deletePhoto);
/* ===== SERVER START ===== */
const port = 3000;
app.listen(port, () => {
  console.log(`🚀 Sunucu http://localhost:${port} adresinde çalışıyor`);
});