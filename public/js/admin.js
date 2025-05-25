window.onload = function () {
  fetch('/api/choferes')
    .then(res => res.json())
    .then(choferes => {
      const tbody = document.querySelector('#tablaChoferes tbody');
      tbody.innerHTML = '';
      choferes.forEach(chofer => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${chofer.id}</td>
          <td>${chofer.nombre}</td>
          <td>${chofer.placa}</td>
          <td>${chofer.registros}</td>
          <td><button onclick="verDetalles(${chofer.id})">Detalles</button></td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => console.error('Error al obtener choferes:', err));


    document.getElementById('formBase').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombreBase').value;
    const lat = parseFloat(document.getElementById('latitudBase').value);
    const lng = parseFloat(document.getElementById('longitudBase').value);

    const res = await fetch('/api/bases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, lat, lng })
    });

    const data = await res.json();
    document.getElementById('mensajeBase').textContent = data.message || 'Base registrada con éxito';

    // Limpia campos
    document.getElementById('formBase').reset();
  });

};

function verDetalles(choferId) {
  fetch(`/api/choferes/${choferId}`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#tablaRegistros tbody');
      tbody.innerHTML = '';

      if (!data.registros || data.registros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Sin registros</td></tr>';
        return;
      }

      data.registros.forEach(r => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${r.latitud}</td>
          <td>${r.longitud}</td>
          <td>${new Date(r.fecha).toLocaleString()}</td>
          <td><a href="https://www.google.com/maps?q=${r.latitud},${r.longitud}" target="_blank">Ver</a></td>
        `;
        tbody.appendChild(fila);
      });
    })
    .catch(err => console.error('Error al obtener detalles:', err));
}
