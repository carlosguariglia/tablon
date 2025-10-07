// admin-artists.js - simple admin UI to manage artists
const API_BASE = '/api/admin/artistas';

async function getToken() {
  return localStorage.getItem('token');
}

function ensureAuthOrRedirect() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Debe iniciar sesión como admin para acceder.');
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
}

async function fetchArtists() {
  if (!ensureAuthOrRedirect()) return;
  const token = await getToken();
  try {
    const res = await fetch(API_BASE, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.status === 401) { showToast('Sesión inválida. Por favor ingresa de nuevo.'); return; }
    const data = await res.json();
    renderArtists(data);
  } catch (err) {
    console.error(err);
    showToast('Error al obtener artistas');
  }
}

function renderArtists(artists) {
  const container = document.getElementById('artistsList');
  container.innerHTML = '';
  if (!artists || artists.length === 0) {
    container.textContent = 'No hay artistas registrados.';
    return;
  }

  artists.forEach(a => {
    const card = document.createElement('div');
    card.className = 'artist-card';

    const photo = document.createElement('div');
    photo.className = 'artist-photo';
    if (a.photo) {
      const img = document.createElement('img');
      img.src = a.photo;
      img.alt = a.name;
      photo.appendChild(img);
    } else {
      photo.textContent = a.name.charAt(0).toUpperCase();
    }

    const meta = document.createElement('div');
    meta.className = 'artist-meta';
    const nameInput = document.createElement('input');
    nameInput.type = 'text'; nameInput.value = a.name; nameInput.dataset.id = a.id;
    const bioInput = document.createElement('textarea'); bioInput.rows = 2; bioInput.value = a.bio || '';

    meta.appendChild(nameInput);
    meta.appendChild(bioInput);

    const socials = document.createElement('div');
    socials.className = 'social-links';
  const socialFields = ['spotify','youtube','whatsapp','instagram','threads','tiktok','bandcamp','website','email','phone'];
    socialFields.forEach(field => {
      const val = a[field];
      if (val) {
        const aLink = document.createElement('a');
        aLink.href = val.startsWith('http') || field === 'email' || field === 'phone' ? val : (field === 'email' ? `mailto:${val}` : `https://${val}`);
        aLink.target = '_blank';
        aLink.rel = 'noopener noreferrer';
        aLink.className = `social ${field}`;
        aLink.title = field;
        // simple icon using text fallback; icons can be replaced with SVG later
        const span = document.createElement('span'); span.className = 'social-icon'; span.textContent = field[0].toUpperCase();
        aLink.appendChild(span);
        socials.appendChild(aLink);
      }
    });

    const actions = document.createElement('div');
    actions.className = 'artist-actions';
    const saveBtn = document.createElement('button'); saveBtn.className = 'btn primary'; saveBtn.textContent = 'Guardar';
    saveBtn.addEventListener('click', () => {
      const payload = {
        name: nameInput.value.trim(),
        bio: bioInput.value.trim(),
        photo: a.photo || document.getElementById(`editPhoto_${a.id}`)?.value || '',
        spotify: a.spotify || '', youtube: a.youtube || '', whatsapp: a.whatsapp || '', instagram: a.instagram || '', threads: a.threads || '', tiktok: a.tiktok || '', bandcamp: a.bandcamp || '', website: a.website || '', email: a.email || '', phone: a.phone || ''
      };
      // try to pick up edited social inputs if present
      ['spotify','youtube','whatsapp','instagram','threads','tiktok','bandcamp','website','email','phone','photo'].forEach(f => {
        const el = document.getElementById(`${f}_${a.id}`);
        if (el) payload[f] = el.value.trim();
      });
      updateArtist(a.id, payload);
    });

    actions.appendChild(saveBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn admin-danger';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', () => {
      if (!confirm(`¿Eliminar artista "${a.name}"? Esta acción no se puede deshacer.`)) return;
      deleteArtist(a.id);
    });
    actions.appendChild(deleteBtn);

    // Build edit fields for socials below
    const editRow = document.createElement('div'); editRow.className = 'artist-edit-row';
    ['photo','spotify','youtube','whatsapp','instagram','threads','tiktok','bandcamp','website','email','phone'].forEach(f => {
      const inp = document.createElement(f === 'photo' ? 'input' : (f === 'email' ? 'input' : 'input'));
      inp.type = (f === 'email') ? 'email' : 'text';
      inp.id = `${f}_${a.id}`;
      inp.placeholder = f;
      inp.value = a[f] || '';
      inp.className = 'artist-edit-input';
      editRow.appendChild(inp);
    });

    card.appendChild(photo);
    card.appendChild(meta);
    card.appendChild(socials);
    card.appendChild(editRow);
    card.appendChild(actions);

    container.appendChild(card);
  });
}

async function deleteArtist(id) {
  if (!ensureAuthOrRedirect()) return;
  const token = await getToken();
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message || 'Artista eliminado', false);
      fetchArtists();
    } else {
      showToast(data.message || 'Error eliminando artista');
    }
  } catch (err) {
    console.error(err);
    showToast('Error de red al eliminar artista');
  }
}

async function createArtist() {
  if (!ensureAuthOrRedirect()) return;
  const payload = {
    name: document.getElementById('newName').value.trim(),
    photo: document.getElementById('newPhoto').value.trim(),
    bio: document.getElementById('newBio').value.trim(),
    spotify: document.getElementById('newSpotify').value.trim(),
    youtube: document.getElementById('newYoutube').value.trim(),
    whatsapp: document.getElementById('newWhatsapp').value.trim(),
    instagram: document.getElementById('newInstagram').value.trim(),
    threads: document.getElementById('newThreads').value.trim(),
    tiktok: document.getElementById('newTiktok').value.trim(),
    bandcamp: document.getElementById('newBandcamp').value.trim(),
    website: document.getElementById('newWebsite').value.trim(),
    email: document.getElementById('newEmail').value.trim(),
    phone: document.getElementById('newPhone').value.trim(),
  };
  if (!payload.name) { showToast('El nombre es requerido'); return; }
  const token = await getToken();
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Artista creado', false);
      // reset fields
    ['newName','newPhoto','newBio','newSpotify','newYoutube','newWhatsapp','newInstagram','newThreads','newTiktok','newBandcamp','newWebsite','newEmail','newPhone'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      fetchArtists();
    } else {
      showToast(data.message || 'Error creando artista');
    }
  } catch (err) {
    console.error(err);
    showToast('Error de red al crear artista');
  }
}

async function updateArtist(id, payload) {
  if (!ensureAuthOrRedirect()) return;
  if (!payload || !payload.name) { showToast('El nombre no puede estar vacío'); return; }
  const token = await getToken();
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Artista actualizado', false);
      fetchArtists();
    } else {
      showToast(data.message || 'Error actualizando artista');
    }
  } catch (err) {
    console.error(err);
    showToast('Error de red al actualizar');
  }
}

// Events
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('refreshBtn')) {
    document.getElementById('refreshBtn').addEventListener('click', fetchArtists);
  }
  if (document.getElementById('createBtn')) {
    document.getElementById('createBtn').addEventListener('click', createArtist);
  }
  if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/pages/login.html';
    });
  }

  // initial load
  fetchArtists();
});
