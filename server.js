const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Aquí debe estar tu index.html, chofer.html, etc.

// Conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // tu contraseña
  database: 'flota'
});

// ✅ Registrar chofer o devolver su ID si ya existe
app.post('/api/choferes', (req, res) => {
  const { nombre, placa } = req.body;

  // Buscar por placa si ya existe
  db.query('SELECT id FROM choferes WHERE placa = ?', [placa], (err, rows) => {
    if (err) return res.status(500).send(err);

    if (rows.length > 0) {
      // Ya existe, devolver su ID
      return res.json({ id: rows[0].id });
    } else {
      // No existe, lo insertamos
      db.query('INSERT INTO choferes (nombre, placa) VALUES (?, ?)', [nombre, placa], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ id: result.insertId });
      });
    }
  });
});

// ✅ Registrar paso por base (ubicación)
app.post('/api/registros', (req, res) => {
  const { choferId, lat, lng } = req.body;
  db.query(
    'INSERT INTO registros (chofer_id, latitud, longitud) VALUES (?, ?, ?)',
    [choferId, lat, lng],
    (err) => {
      if (err) return res.status(500).send(err);
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Chofer:${choferId}|${lat},${lng}`;
      res.json({ qr });
    }
  );
});

// ✅ Obtener lista de choferes con conteo de registros
app.get('/api/choferes', (req, res) => {
  db.query(`
    SELECT c.id, c.nombre, c.placa, COUNT(r.id) as registros
    FROM choferes c
    LEFT JOIN registros r ON c.id = r.chofer_id
    GROUP BY c.id
  `, (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// ✅ Obtener chofer y sus registros por ID
app.get('/api/choferes/:id', (req, res) => {
  const choferId = req.params.id;

  db.query('SELECT * FROM choferes WHERE id = ?', [choferId], (err, choferRows) => {
    if (err) return res.status(500).send(err);
    if (choferRows.length === 0) return res.status(404).send({ error: 'Chofer no encontrado' });

    db.query('SELECT latitud, longitud, fecha FROM registros WHERE chofer_id = ?', [choferId], (err, registros) => {
      if (err) return res.status(500).send(err);

      res.json({ chofer: choferRows[0], registros });
    });
  });
});

// Iniciar el servidor
// app.listen(3000, () => {
//   console.log('✅ Servidor corriendo en http://localhost:3000');
// });
// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto http://localhost:${PORT}`));