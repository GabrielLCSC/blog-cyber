const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// Pour servir les images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configuration de multer pour stocker les images dans /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// POST avec image : multipart/form-data
app.post('/api/articles', upload.single('image'), (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  const date = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD

  const stmt = db.prepare('INSERT INTO articles (title, image, description, date) VALUES (?, ?, ?, ?)');
  stmt.run([title, image, description, date], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, image });
  });
});


// GET
app.get('/api/articles', (req, res) => {
  db.all('SELECT * FROM articles', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
