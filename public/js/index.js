document.getElementById('formRegistro').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const placa = document.getElementById('placa').value.trim();
  const mensaje = document.getElementById('mensaje');

  try {
    const res = await fetch('/api/choferes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, placa }),
    });

    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

    const data = await res.json();
    const choferId = data.id;

    // Obtener datos del chofer para validar nombre
    const choferRes = await fetch(`/api/choferes/${choferId}`);
    if (!choferRes.ok) throw new Error(`Error HTTP: ${choferRes.status}`);
    const choferData = await choferRes.json();

    if (choferData.chofer.nombre !== nombre) {
      mensaje.style.color = 'orange';
      mensaje.textContent = `La placa "${placa}" ya está registrada para otro chofer (${choferData.chofer.nombre}). No se puede registrar nuevamente con un nombre diferente.`;
      return; // No redirigir ni continuar
    }

    // Si todo ok, guardar ID y redirigir
    sessionStorage.setItem('choferId', choferId);
    mensaje.style.color = 'green';
    mensaje.textContent = `Registro exitoso. Redirigiendo...`;

    setTimeout(() => {
      window.location.href = '/chofer.html';
    }, 1000);

  } catch (err) {
    mensaje.style.color = 'red';
    mensaje.textContent = `Error al registrar: ${err.message}`;
  }
});
