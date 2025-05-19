document.getElementById('registrarPaso').addEventListener('click', () => {
  const choferId = localStorage.getItem('choferId');
  if (!choferId) return alert("No se encontró el chofer");

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const res = await fetch('/api/registros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choferId, lat, lng })
    });

    const data = await res.json();
    document.getElementById('qr').innerHTML = `<img src="${data.qr}" alt="QR Registro">`;
  }, () => {
    alert('No se pudo obtener ubicación.');
  });
});
