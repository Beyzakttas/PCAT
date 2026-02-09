const Photo = require('../models/Photo');
const fs = require('fs');   // Bunu ekledik
const path = require('path'); // Bunu da eklemeni öneririm
exports.getAboutPage=(req, res) => res.render('about');
exports.getAddPage=(req, res) => res.render('add');
exports.geteditPage=async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  res.render('edit', { photo })}