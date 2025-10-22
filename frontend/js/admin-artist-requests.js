document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) { document.getElementById('list').textContent = 'Debes iniciar sesión como admin.'; return; }

  let page = 1;
  const perPage = 10;

  async function load() {
    const res = await fetch(`/api/admin/artist-requests?per_page=${perPage}&page=${page}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) {
      document.getElementById('list').textContent = 'Error al cargar solicitudes.'; return;
    }
    const items = await res.json();
    
    const container = document.getElementById('list');
    container.innerHTML = '';
    if (!items || items.length === 0) { container.textContent = 'No hay solicitudes.'; return; }
    for (const it of items) {
      const div = document.createElement('div');
      div.className = 'admin-request';
      div.style.border = '2px solid #e9d5ff';
      div.style.padding = '16px';
      div.style.marginBottom = '16px';
      div.style.borderRadius = '8px';
      div.style.background = '#faf5ff';
      
      const statusLabel = document.createElement('div');
      statusLabel.textContent = `Estado: ${it.status || 'pending'}`;
      statusLabel.style.fontWeight = '700';
      statusLabel.style.marginBottom = '8px';
      statusLabel.style.color = it.status === 'approved' ? '#059669' : it.status === 'rejected' ? '#dc2626' : '#ea580c';
      div.appendChild(statusLabel);
      
      const title = document.createElement('div');
      title.innerHTML = `<strong style="font-size: 1.2rem; color: #581c87;">${it.nombre}</strong> <span style="color: #64748b;">— ${it.created_at || ''}</span>`;
      div.appendChild(title);
      
      // Bio
      if (it.bio) {
        const bioLabel = document.createElement('div');
        bioLabel.textContent = 'Biografía:';
        bioLabel.style.fontWeight = '600';
        bioLabel.style.marginTop = '12px';
        bioLabel.style.color = '#4a148c';
        div.appendChild(bioLabel);
        const bio = document.createElement('div'); 
        bio.textContent = it.bio; 
        bio.style.marginTop = '4px';
        bio.style.color = '#334155';
        div.appendChild(bio);
      }
      
      // Social links
      if (it.social_links && Array.isArray(it.social_links) && it.social_links.length > 0) {
        const socialLabel = document.createElement('div');
        socialLabel.textContent = 'Redes sociales:';
        socialLabel.style.fontWeight = '600';
        socialLabel.style.marginTop = '12px';
        socialLabel.style.color = '#4a148c';
        div.appendChild(socialLabel);
        const socialList = document.createElement('div');
        socialList.style.marginTop = '4px';
        it.social_links.forEach(link => {
          const linkDiv = document.createElement('div');
          linkDiv.style.marginBottom = '4px';
          linkDiv.innerHTML = `<strong>${link.platform || 'Link'}:</strong> <a href="${link.url}" target="_blank" style="color: #8b5cf6;">${link.url}</a>`;
          socialList.appendChild(linkDiv);
        });
        div.appendChild(socialList);
      }
      
      // Images
      if (it.image_urls && it.image_urls.length) {
        const imgLabel = document.createElement('div');
        imgLabel.textContent = 'Imagen:';
        imgLabel.style.fontWeight = '600';
        imgLabel.style.marginTop = '12px';
        imgLabel.style.color = '#4a148c';
        div.appendChild(imgLabel);
        const imgs = document.createElement('div'); 
        imgs.style.marginTop = '8px';
        it.image_urls.forEach(u => { 
          const img = document.createElement('img'); 
          img.src = u; 
          img.style.maxWidth = '200px'; 
          img.style.marginRight='8px'; 
          img.style.borderRadius = '8px';
          img.style.border = '2px solid #c084fc';
          imgs.appendChild(img); 
        });
        div.appendChild(imgs);
      }
      
      // User notes
      if (it.notas_usuario) {
        const userNotesLabel = document.createElement('div');
        userNotesLabel.textContent = 'Notas del usuario:';
        userNotesLabel.style.fontWeight = '600';
        userNotesLabel.style.marginTop = '12px';
        userNotesLabel.style.color = '#4a148c';
        div.appendChild(userNotesLabel);
        const userNotes = document.createElement('div');
        userNotes.textContent = it.notas_usuario;
        userNotes.style.marginTop = '4px';
        userNotes.style.color = '#334155';
        userNotes.style.fontStyle = 'italic';
        div.appendChild(userNotes);
      }

      // Admin notes textarea and action buttons
      const notesLabel = document.createElement('label'); 
      notesLabel.textContent = 'Notas admin:'; 
      notesLabel.style.display = 'block'; 
      notesLabel.style.marginTop = '12px';
      notesLabel.style.fontWeight = '600';
      notesLabel.style.color = '#4a148c';
      const notesArea = document.createElement('textarea'); 
      notesArea.style.width = '100%'; 
      notesArea.style.marginTop = '4px'; 
      notesArea.style.padding = '8px';
      notesArea.style.borderRadius = '6px';
      notesArea.style.border = '2px solid #e9d5ff';
      notesArea.value = it.admin_notes || '';
      div.appendChild(notesLabel); div.appendChild(notesArea);

      const actions = document.createElement('div'); actions.style.marginTop = '8px';
      const approveBtn = document.createElement('button'); approveBtn.textContent = 'Aprobar'; approveBtn.className = 'btn';
      approveBtn.addEventListener('click', async () => {
        approveBtn.disabled = true; rejectBtn.disabled = true; deleteBtn.disabled = true;
        const r = await fetch(`/api/admin/artist-requests/${it.id}/approve`, { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ admin_notes: notesArea.value || null }) });
        if (r.ok) { load(); } else { alert('Error al aprobar'); approveBtn.disabled = false; rejectBtn.disabled = false; deleteBtn.disabled = false; }
      });
      const rejectBtn = document.createElement('button'); rejectBtn.textContent = 'Rechazar'; rejectBtn.style.marginLeft='8px'; rejectBtn.className = 'btn';
      rejectBtn.addEventListener('click', async () => {
        const reason = notesArea.value || prompt('Motivo del rechazo (opcional)');
        rejectBtn.disabled = true; approveBtn.disabled = true; deleteBtn.disabled = true;
        const r = await fetch(`/api/admin/artist-requests/${it.id}/reject`, { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ reason }) });
        if (r.ok) { load(); } else { alert('Error al rechazar'); approveBtn.disabled = false; rejectBtn.disabled = false; deleteBtn.disabled = false; }
      });
      const deleteBtn = document.createElement('button'); deleteBtn.textContent = 'Eliminar'; deleteBtn.style.marginLeft='8px'; deleteBtn.className = 'btn';
      deleteBtn.style.background = '#dc2626'; deleteBtn.style.color = '#fff';
      deleteBtn.addEventListener('click', async () => {
        if (!confirm(`¿Está seguro de eliminar la solicitud de "${it.nombre}"? Esta acción no se puede deshacer.`)) return;
        deleteBtn.disabled = true; approveBtn.disabled = true; rejectBtn.disabled = true;
        const r = await fetch(`/api/admin/artist-requests/${it.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (r.ok) { load(); } else { alert('Error al eliminar'); approveBtn.disabled = false; rejectBtn.disabled = false; deleteBtn.disabled = false; }
      });
      actions.appendChild(approveBtn); actions.appendChild(rejectBtn); actions.appendChild(deleteBtn);
      div.appendChild(actions);

      container.appendChild(div);
    }
    document.getElementById('pageInfo').textContent = `Página ${page}`;
  }

  document.getElementById('prevPage').addEventListener('click', () => { if (page>1) { page--; load(); } });
  document.getElementById('nextPage').addEventListener('click', () => { page++; load(); });

  // Back button to main tablon
  const backBtn = document.getElementById('backToTablon');
  if (backBtn) backBtn.addEventListener('click', () => { window.location.href = '/pages/tablon.html'; });

  load();
});
