document.getElementById('loginBtn').addEventListener('click', () => {
  const usuario = document.getElementById('usuario').value;
  const password = document.getElementById('password').value;

  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.rol === 'admin') {
      window.location.href = 'admin.html';
    } else if (data.rol === 'chofer') {
      sessionStorage.setItem('choferId', data.id); // 🟢 Guardar ID del chofer
      window.location.href = 'chofer.html';
    } else {
      alert('Rol no reconocido');
    }
  })
  .catch(err => {
    console.error(err);
    alert('Error al iniciar sesión');
  });
})

document.getElementById('registrarBtn').addEventListener('click', () => {
  const nombre = document.getElementById('nombre').value;
  const placa = document.getElementById('nuevaPlaca').value;
  const password = document.getElementById('nuevaPassword').value;

  fetch('/api/choferes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, placa, password })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById('mensaje').textContent = 'Registrado correctamente. Ahora puedes iniciar sesión.';
    document.getElementById('usuario').value = placa;
    document.getElementById('password').value = password;
  }) 
  .catch(err => {
    console.error(err);
    alert('Error al registrar');
  });
}
)
  

