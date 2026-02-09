const Photo =require('../models/Photo');
const fs = require('fs');   // Bunu ekledik
const path = require('path'); // Bunu da eklemeni öneririm
exports.getAllPhotos=async (req, res) => {
    const page=req.query.page || 1;
    const photosPerPage=3;
    const totalPhotos= await Photo.find().countDocuments();
    const photos = await Photo.find({})
    .sort('-dateCreated')
    .skip((page-1)*photosPerPage)
    .limit(photosPerPage)
    res.render('index', { 
        photos,
        current: page,
        pages:Math.ceil(totalPhotos /photosPerPage)
     });

//   const photos = await Photo.find({}).sort('-dateCreated');
//  
}
  exports.getPhoto=async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).send("Fotoğraf bulunamadı.");
    res.render('photo', { photo });
  } catch (error) {
    res.status(500).send("Sunucu hatası.");
  }
}
exports.createPhoto=async (req, res) => {
  const uploadDir = 'public/uploads';
  // public/uploads klasörü yoksa oluştur
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('Hiç dosya seçilmedi.');
  }
  let uploadedImage = req.files.image;
  let uploadPath = path.join(__dirname,'/../public/uploads/', uploadedImage.name);

  uploadedImage.mv(uploadPath, async () => {
    await Photo.create({
      ...req.body,
      image: '/uploads/' + uploadedImage.name
    });
    res.redirect('/');
  });
}
exports.updatePhoto=async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  photo.title = req.body.title;
  photo.description = req.body.description;
  await photo.save();
  res.redirect(`/photos/${req.params.id}`);
};
  
exports.updatePhototitle= async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  photo.title = req.body.title;
  photo.description = req.body.description;
  await photo.save();
  res.redirect(`/photos/${req.params.id}`);
}
exports.deletePhoto= async (req, res) => {
  try {
    const photo = await Photo.findOne({ _id: req.params.id });
    
    // Dosya yolunu oluştur (public + /uploads/resim.jpg)
    let imagePath = __dirname + '/../public' + photo.image;

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
}