const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.json());

// Mostrar login al acceder a la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, 'style')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Conexión a base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'flota1'
});

// Endpoint para login
app.post('/api/login', (req, res) => {
  const { usuario, password } = req.body;

  db.query('SELECT * FROM admin WHERE usuario = ? AND password = ?', [usuario, password], (err, adminRows) => {
    if (err) return res.status(500).send(err);
    if (adminRows.length > 0) return res.json({ rol: 'admin' });

    db.query('SELECT * FROM choferes WHERE placa = ? AND password = ?', [usuario, password], (err, choferRows) => {
      if (err) return res.status(500).send(err);
      if (choferRows.length > 0) {
        return res.json({ rol: 'chofer', id: choferRows[0].id });
      }

      res.status(401).json({ error: 'Credenciales inválidas' });
    });
  });
});

// Endpoint para registrar chofer
app.post('/api/choferes', (req, res) => {
  const { nombre, placa, password } = req.body;

  db.query('SELECT id FROM choferes WHERE placa = ?', [placa], (err, rows) => {
    if (err) return res.status(500).send(err);

    if (rows.length > 0) {
      return res.json({ id: rows[0].id });
    } else {
      db.query(
        'INSERT INTO choferes (nombre, placa, password) VALUES (?, ?, ?)',
        [nombre, placa, password],
        (err, result) => {
          if (err) return res.status(500).send(err);
          res.json({ id: result.insertId });
        }
      );
    }
  });
});

// Lista de todos los choferes con contador de registros
app.get('/api/choferes', (req, res) => {
  const query = `
    SELECT c.id, c.nombre, c.placa, COUNT(r.id) AS registros
    FROM choferes c
    LEFT JOIN registros r ON c.id = r.chofer_id
    GROUP BY c.id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Detalles de un chofer
app.get('/api/choferes/:id', (req, res) => {
  const id = req.params.id;

  db.query('SELECT * FROM choferes WHERE id = ?', [id], (err, choferRows) => {
    if (err) return res.status(500).send(err);
    if (choferRows.length === 0) return res.status(404).json({ error: 'Chofer no encontrado' });

    db.query('SELECT latitud, longitud, fecha FROM registros WHERE chofer_id = ?', [id], (err, registros) => {
      if (err) return res.status(500).send(err);
      res.json({ chofer: choferRows[0], registros });
    });
  });
});



// Para registrar ubicación
app.post('/api/registros', (req, res) => {
    console.log('Datos recibidos en POST /api/registros:', req.body);
  const { choferId, lat, lng, nombreBase  } = req.body;
  db.query(
    'INSERT INTO registros (chofer_id, base_nombre, latitud, longitud) VALUES (?, ?, ?, ?)',
    [choferId, nombreBase , lat, lng],
    (err) => {
      if (err) return res.status(500).send(err);
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Chofer:${choferId}|${lat},${lng}`;
      res.json({ qr });
    }
  );
});

// Registrar nueva base
app.post('/api/bases', (req, res) => {
  const { nombre, lat, lng } = req.body;
  db.query('INSERT INTO bases (nombre, latitud, longitud) VALUES (?, ?, ?)', [nombre, lat, lng], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Base registrada correctamente' });
  });
});

// Obtener todas las bases
app.get('/api/bases', (req, res) => {
  db.query('SELECT * FROM bases', (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});



// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
