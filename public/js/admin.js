document.addEventListener('DOMContentLoaded', async () => {
  const cont = document.getElementById('listaChoferes');
  cont.innerHTML = 'Cargando choferes...';

  try {
    const res = await fetch('/api/choferes');
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    const data = await res.json();

    if (data.length === 0) {
      cont.innerHTML = '<p>No hay choferes registrados.</p>';
      return;
    }

    cont.innerHTML = '';
    data.forEach(chofer => {
      cont.innerHTML += `
        <div style="margin-bottom:15px;">
          <h3>${chofer.nombre} (${chofer.placa})</h3>
          <p>Bases registradas: ${chofer.registros}</p>
          <button onclick="mostrarDetallesChofer(${chofer.id})">Ver detalles</button>
        </div>
      `;
    });
  } catch (e) {
    cont.innerHTML = `<p>Error al cargar choferes: ${e.message}</p>`;
  }
});

const detallesDiv = document.getElementById('detallesRegistros');

async function mostrarDetallesChofer(choferId) {
  detallesDiv.innerHTML = 'Cargando detalles...';
  try {
    const res = await fetch(`/api/choferes/${choferId}`);
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    const data = await res.json();

    if (!data.registros || data.registros.length === 0) {
      detallesDiv.innerHTML = '<p>No hay registros para este chofer.</p>';
      return;
    }

    detallesDiv.innerHTML = `<h2>Detalles de ${data.chofer.nombre} (${data.chofer.placa})</h2>`;
    detallesDiv.innerHTML += data.registros.map(r =>
      `<p>📍 Fecha: ${new Date(r.fecha).toLocaleString()}<br>
       Ubicación: <a href="https://www.google.com/maps?q=${r.latitud},${r.longitud}" target="_blank" rel="noopener noreferrer">Ver mapa</a></p>`
    ).join('');
  } catch (e) {
    detallesDiv.innerHTML = `<p>Error al cargar detalles: ${e.message}</p>`;
  }
}
