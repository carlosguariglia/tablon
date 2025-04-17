const API_URL = '/api/auth';

async function verifyAuth() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.success ? data.user : false;
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    return false;
  }
}

function showMessage(elementId, message, isError = true) {
  const messageEl = document.getElementById(elementId);
  messageEl.textContent = message;
  messageEl.className = `message ${isError ? 'error' : 'success'}`;
}

// Manejo de Login
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/pages/welcome.html';
      } else {
        showMessage('message', data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      showMessage('message', 'Error de conexión');
    }
  });
}

// Manejo de Registro
if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      if (response.ok) {
        showMessage('message', data.message, false);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => window.location.href = '/pages/welcome.html', 1500);
      } else {
        showMessage('message', data.message || 'Error al registrarse');
      }
    } catch (error) {
      showMessage('message', 'Error de conexión');
    }
  });
}

// Manejo de Logout
if (document.getElementById('logoutBtn')) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && document.getElementById('userName')) {
    document.getElementById('userName').textContent = user.name;
  }
  
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/login.html';
  });
}