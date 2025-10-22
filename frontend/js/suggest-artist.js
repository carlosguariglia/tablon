document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('suggestForm');
  if (!form) return;

  // Add social link row functionality
  const addSocialBtn = document.getElementById('addSocialBtn');
  const socialContainer = document.getElementById('socialLinksContainer');
  
  addSocialBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'social-link-row';
    row.innerHTML = `
      <input type="text" class="social-platform" placeholder="Red social (ej: Instagram, Facebook)" />
      <input type="url" class="social-url" placeholder="Link (ej: https://instagram.com/...)" />
    `;
    socialContainer.appendChild(row);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = '';
    resultDiv.className = '';
    
    const token = localStorage.getItem('token');
    if (!token) { 
      resultDiv.textContent = 'Debes iniciar sesión para enviar una sugerencia.';
      resultDiv.className = 'error';
      return; 
    }

    const nombre = document.getElementById('nombre').value.trim();
    const bio = document.getElementById('bio').value.trim();
    const notas = document.getElementById('notas').value.trim();
    const imageUrl = document.getElementById('image_url').value.trim();

    // Build social_links array from the dynamic fields
    const socialRows = document.querySelectorAll('.social-link-row');
    const social_links = [];
    socialRows.forEach(row => {
      const platform = row.querySelector('.social-platform').value.trim();
      const url = row.querySelector('.social-url').value.trim();
      if (platform && url) {
        social_links.push({ platform, url });
      }
    });

    // Validate image URL
    const isValidUrl = (u) => {
      if (!u) return true; // optional field
      try { const url = new URL(u); return url.protocol === 'http:' || url.protocol === 'https:'; } catch(e) { return false; }
    };
    
    if (imageUrl && !isValidUrl(imageUrl)) { 
      resultDiv.textContent = 'URL de imagen inválida';
      resultDiv.className = 'error';
      return; 
    }

    // Validate social links URLs
    for (const link of social_links) {
      if (!isValidUrl(link.url)) {
        resultDiv.textContent = `URL inválida en redes sociales: ${link.url}`;
        resultDiv.className = 'error';
        return;
      }
    }

    const image_urls = imageUrl ? [imageUrl] : [];
    const body = { 
      nombre, 
      bio: bio || null, 
      social_links: social_links.length > 0 ? social_links : null, 
      image_urls: image_urls.length > 0 ? image_urls : null, 
      notas_usuario: notas || null 
    };

    try {
      const res = await fetch('/api/artist-requests', { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }, 
        body: JSON.stringify(body) 
      });
      const data = await res.json();
      if (res.ok) {
        resultDiv.textContent = '✓ Solicitud enviada correctamente. Estado: pendiente de revisión.';
        resultDiv.className = 'success';
        form.reset();
        // Reset to one social link row
        socialContainer.innerHTML = `
          <div class="social-link-row">
            <input type="text" class="social-platform" placeholder="Red social (ej: Instagram, Facebook)" />
            <input type="url" class="social-url" placeholder="Link (ej: https://instagram.com/...)" />
          </div>
        `;
      } else {
        resultDiv.textContent = data.message || 'Error al enviar solicitud.';
        resultDiv.className = 'error';
      }
    } catch (err) {
      resultDiv.textContent = 'Error de conexión.';
      resultDiv.className = 'error';
    }
  });

  // Back button handler
  const backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.addEventListener('click', () => { window.location.href = '/pages/tablon.html'; });
});
