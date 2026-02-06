const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Photo = require('./models/Photo');

const app = express();

/* ===== TEMPLATE ENGINE ===== */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ===== MIDDLEWARE ===== */
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ===== DB ===== */
async function connectDB() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/pcat-test-db');
    console.log("✅ MongoDB bağlandı");
  } catch (err) {
    console.error("❌ MongoDB bağlantı hatası:", err.message);
  }
}
connectDB();

/* ===== ROUTES ===== */
app.get('/', async (req, res) => {
  const photos = await Photo.find({});
  
  res.render('index', {
    photos
  });
});

/* ===== CREATE ===== */
app.post('/photos', async (req, res) => {
  await Photo.create(req.body);
  res.redirect('/');
});

/* ===== UPDATE ===== */
app.post('/photos/:id', async (req, res) => {
  const updatedPhoto = await Photo.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updatedPhoto);
});
app.get('/', async (req, res) => {
  const photos = await Photo.find();
  res.render('index', { photos });
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/add', (req, res) => {
  res.render('add');
});

/* ===== SERVER ===== */
const port = 3000;
app.listen(port, () => {
  console.log(`🚀 Sunucu ${port} portunda çalışıyor`);
});