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
function showToast(message, isError = true) {
  // Elimina toasts anteriores para evitar duplicados
  const oldToasts = document.querySelectorAll('.toast');
  oldToasts.forEach(toast => toast.remove());

  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.textContent = message;
  
  // Añade estilos inline como respaldo
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.right = '20px';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '4px';
  toast.style.color = 'white';
  toast.style.zIndex = '1000';
  toast.style.animation = 'fadeIn 0.3s';
  toast.style.backgroundColor = isError ? '#ff4444' : '#00C851';

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s';
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
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
  let email = document.getElementById('email').value;
  let password = document.getElementById('password').value;
  email = email.trim().replace(/[<>&"']/g, '');
  password = password.trim().replace(/[<>&"']/g, '');

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
        window.location.href = '/pages/tablon.html';
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
  let name = document.getElementById('name').value;
  name = name.trim().replace(/[<>&"']/g, '');
  // Usar emailReg si existe, sino usar email
  let email = document.getElementById('emailReg') ? document.getElementById('emailReg').value : document.getElementById('email').value;
  email = email.trim().replace(/[<>&"']/g, '');
  // Usar passwordReg si existe, sino usar password
  let password = document.getElementById('passwordReg') ? document.getElementById('passwordReg').value : document.getElementById('password').value;
  password = password.trim().replace(/[<>&"']/g, '');

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      if (response.ok) {
        // Usar registerMsg si existe, sino usar message
        const messageId = document.getElementById('registerMsg') ? 'registerMsg' : 'message';
        showMessage(messageId, data.message, false);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => window.location.href = '/pages/welcome.html', 1500);
      } else {
        const messageId = document.getElementById('registerMsg') ? 'registerMsg' : 'message';
        showMessage(messageId, data.message || 'Error al registrarse');
      }
    } catch (error) {
      const messageId = document.getElementById('registerMsg') ? 'registerMsg' : 'message';
      showMessage(messageId, 'Error de conexión');
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
