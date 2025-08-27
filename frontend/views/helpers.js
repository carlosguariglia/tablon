// Función para formatear fechas en EJS
exports.formatDate = (dateString) => {
    if (!dateString) return 'Fecha no especificada';
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
};

// Función para escape de HTML
exports.escapeHTML = (str) => {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};