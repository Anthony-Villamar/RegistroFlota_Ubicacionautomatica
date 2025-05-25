window.onload = () => {
  const choferId = sessionStorage.getItem('choferId');
  if (!choferId) {
    alert("Debes iniciar sesión");
    window.location.href = 'login.html';
  }

  document.getElementById('registrarUbicacion').addEventListener('click', () => {
    if (!navigator.geolocation) {
      return alert('Tu navegador no soporta geolocalización.');
    }

    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      fetch('/api/registros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choferId, lat: latitude, lng: longitude })
      })
      .then(res => res.json())
      .then(data => {
        document.getElementById('qr').innerHTML = `<img src="${data.qr}" alt="QR generado">`;
      });
    });
  });

  // choferId = null; // que se establezca luego del login
  function distanciaEnMetros(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const rad = x => x * Math.PI / 180;
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async function verificarUbicacion() {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const res = await fetch('/api/bases');
      const bases = await res.json();

      for (let base of bases) {
        const dist = distanciaEnMetros(lat, lng, base.latitud, base.longitud);
        if (dist < 50) { // 50 metros
          // Evitar registros duplicados (puedes usar localStorage si quieres)
          fetch('/api/registros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ choferId, lat, lng })
          });
          break;
        }
      }
    });
  }

  setInterval(verificarUbicacion, 15000); // cada 15 segundos

};
