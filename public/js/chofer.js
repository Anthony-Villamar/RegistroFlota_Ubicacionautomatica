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
};
