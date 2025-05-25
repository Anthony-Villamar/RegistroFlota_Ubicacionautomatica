window.onload = () => {
  const choferId = sessionStorage.getItem('choferId');
  if (!choferId) {
    alert("Debes iniciar sesión");
    window.location.href = 'login.html';
  }

  document.getElementById('registrarUbicacion').addEventListener('click', async () => {
    if (!navigator.geolocation) {
      return alert('Tu navegador no soporta geolocalización.');
    }

    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude } = position.coords;

      // Buscar bases cercanas
      const res = await fetch('/api/bases');
      const bases = await res.json();

      let nombreBase = null;

      for (let base of bases) {
        const dist = distanciaEnMetros(latitude, longitude, base.latitud, base.longitud);
        if (dist < 50) {
          nombreBase = base.nombre;
          break;
        }
      }

      // Enviar registro con nombreBase (si se encontró) o null
      const respuesta = await fetch('/api/registros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choferId,
          lat: latitude,
          lng: longitude,
          nombreBase
        })
      });

      const data = await respuesta.json();
      document.getElementById('qr').innerHTML = `<img src="${data.qr}" alt="QR generado">`;
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

  let contadorMismoLugar = 0;
  let ultimaUbicacion = null;
  let yaRegistrado = false;

  async function verificarUbicacion() {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      if (ultimaUbicacion) {
        const distDesdeUltima = distanciaEnMetros(lat, lng, ultimaUbicacion.lat, ultimaUbicacion.lng);

        if (distDesdeUltima < 10) {
          contadorMismoLugar++;
        } else {
          contadorMismoLugar = 1;
          yaRegistrado = false; // se movió, permitimos registrar de nuevo
        }
      } else {
        contadorMismoLugar = 1;
      }

      ultimaUbicacion = { lat, lng };

      if (contadorMismoLugar >= 3 && !yaRegistrado) {
        const res = await fetch('/api/bases');
        const bases = await res.json();

        for (let base of bases) {
          const dist = distanciaEnMetros(lat, lng, base.latitud, base.longitud);
          if (dist < 50) {
            await fetch('/api/registros', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ choferId, nombreBase: base.nombre, lat, lng })
            });
            contadorMismoLugar = 0;
            yaRegistrado = true; // evitamos registrar de nuevo si no se ha movido
            break;
          }
        }
      }
    });
  }



  setInterval(verificarUbicacion, 10000); // cada 10 segundos

};
