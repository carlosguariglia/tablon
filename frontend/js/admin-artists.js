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

    const meta = document.createElement('div');
    meta.className = 'artist-meta';
    const nameInput = document.createElement('input');
    nameInput.type = 'text'; nameInput.value = a.name; nameInput.dataset.id = a.id;
    const bioInput = document.createElement('textarea'); bioInput.rows = 2; bioInput.value = a.bio || '';

  // Admin thumbnail: show photo if available, otherwise a small playing_music.svg placeholder
  const thumb = document.createElement('img');
  thumb.className = 'admin-photo-thumb';
  thumb.alt = 'foto';
  thumb.src = a.photo || '/assets/images/playing_music_icon_176915.png';
  // ensure fallback on load error
  thumb.onerror = function() { this.onerror = null; this.src = '/assets/images/playing_music_icon_176915.png'; };

  meta.appendChild(thumb);
  meta.appendChild(nameInput);
  meta.appendChild(bioInput);

    // photo is editable via the edit row input but we do not display its filename here
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

  // Order: name & bio (meta), then socials (photo first), then edit row, then actions
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
  
  // Build social links from dynamic fields
  const socialRows = document.querySelectorAll('#adminSocialLinksContainer .social-link-row');
  const payload = {
    name: document.getElementById('newName').value.trim(),
    photo: document.getElementById('newPhoto').value.trim(),
    bio: document.getElementById('newBio').value.trim(),
    email: document.getElementById('newEmail').value.trim(),
    phone: document.getElementById('newPhone').value.trim(),
    website: document.getElementById('newWebsite').value.trim(),
  };
  
  // Map social platforms to backend field names
  const platformMap = {
    'instagram': 'instagram',
    'facebook': 'facebook', 
    'spotify': 'spotify',
    'youtube': 'youtube',
    'whatsapp': 'whatsapp',
    'threads': 'threads',
    'tiktok': 'tiktok',
    'bandcamp': 'bandcamp'
  };
  
  socialRows.forEach(row => {
    const platform = row.querySelector('.social-platform').value.trim().toLowerCase();
    const url = row.querySelector('.social-url').value.trim();
    if (platform && url) {
      // Check if platform matches one of our known fields
      const fieldName = platformMap[platform] || null;
      if (fieldName) {
        payload[fieldName] = url;
      } else {
        // If not a known platform, add to website if not set
        if (!payload.website) payload.website = url;
      }
    }
  });
  
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
      // Reset form
      document.getElementById('createArtistForm').reset();
      // Reset to one social link row
      const container = document.getElementById('adminSocialLinksContainer');
      container.innerHTML = `
        <div class="social-link-row">
          <input type="text" class="social-platform" placeholder="Red social (ej: Instagram, Facebook, Spotify)" />
          <input type="url" class="social-url" placeholder="Link (ej: https://instagram.com/...)" />
        </div>
      `;
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
  // Add social link row functionality
  const addAdminSocialBtn = document.getElementById('addAdminSocialBtn');
  const adminSocialContainer = document.getElementById('adminSocialLinksContainer');
  
  if (addAdminSocialBtn && adminSocialContainer) {
    addAdminSocialBtn.addEventListener('click', () => {
      const row = document.createElement('div');
      row.className = 'social-link-row';
      row.innerHTML = `
        <input type="text" class="social-platform" placeholder="Red social (ej: Instagram, Facebook, Spotify)" />
        <input type="url" class="social-url" placeholder="Link (ej: https://instagram.com/...)" />
      `;
      adminSocialContainer.appendChild(row);
    });
  }
  
  if (document.getElementById('refreshBtn')) {
    document.getElementById('refreshBtn').addEventListener('click', fetchArtists);
  }
  if (document.getElementById('createBtn')) {
    const form = document.getElementById('createArtistForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createArtist();
      });
    } else {
      document.getElementById('createBtn').addEventListener('click', createArtist);
    }
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
  // no preview handlers for newPhoto
});
