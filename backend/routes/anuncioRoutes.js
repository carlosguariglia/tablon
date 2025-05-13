const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    console.log('[API] Iniciando consulta de anuncios...');
    
    try {
        // 1. Verificar conexión
        const [testResult] = await db.query('SELECT 1+1 AS test');
        console.log('[TEST] Conexión OK:', testResult);

        // 2. Consulta principal - FORZAR siempre array
        const sqlQuery = `
            SELECT 
                a.id,
                a.titulo,
                a.descripcion,
                a.fecha,
                a.lugar,
                a.precio,
                a.categoria,
                a.participantes,
                u.name as autor,
                a.created_at
            FROM anuncios a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.fecha DESC
        `;

        console.log('[SQL] Ejecutando:', sqlQuery);
        const [results] = await db.query(sqlQuery);

        // 3. Normalizar resultados (siempre array)
        let anuncios = [];
        
        if (results) {
            // Si es un solo objeto (como en tu caso), convertirlo a array
            if (!Array.isArray(results)) {
                anuncios = [results];
            } else {
                anuncios = results;
            }
        }

        console.log(`[INFO] Anuncios encontrados: ${anuncios.length}`);

        // 4. Formatear respuesta
        const response = anuncios.map(item => ({
            id: item.id,
            titulo: item.titulo || 'Sin título',
            descripcion: item.descripcion || '',
            fecha: formatDate(item.fecha),
            lugar: item.lugar || 'Ubicación no especificada',
            precio: item.precio !== null ? parseFloat(item.precio) : null,
            categoria: item.categoria || 'Otros',
            participantes: item.participantes || '',
            autor: item.autor || 'Anónimo',
            created_at: formatDate(item.created_at)
        }));

        res.json(response);

    } catch (error) {
        console.error('[ERROR] Detalles:', {
            message: error.message,
            sql: error.sql,
            stack: error.stack
        });
        
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener anuncios',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

function formatDate(dateValue) {
    if (!dateValue) return null;
    try {
        return new Date(dateValue).toISOString();
    } catch {
        return dateValue;
    }
}

module.exports = router;