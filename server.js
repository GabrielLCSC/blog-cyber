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
app.post('/api/articles', upload.array('images'), (req, res) => {
  const { title, description } = req.body;
  const date = new Date().toISOString();

  const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
  const imagesJSON = JSON.stringify(imagePaths); // stocker un tableau

  db.run(
    'INSERT INTO articles (title, image, description, date) VALUES (?, ?, ?, ?)',
    [title, imagesJSON, description, date],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Erreur lors de la création de l\'article');
      }
      res.sendStatus(200);
    }
  );
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
