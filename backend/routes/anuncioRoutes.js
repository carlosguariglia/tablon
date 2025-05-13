const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    console.log('[API] Obteniendo anuncios...');
    
    try {
        const sqlQuery = `
            SELECT 
                a.id,
                a.titulo,
                a.descripcion,
                DATE_FORMAT(a.fecha, '%Y-%m-%d %H:%i:%s') as fecha,
                a.lugar,
                a.precio,
                a.categoria,
                a.participantes,
                u.name as autor,
                DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as created_at
            FROM anuncios a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.fecha DESC
        `;

        console.log('[SQL] Ejecutando:', sqlQuery);
        const [results, metadata] = await db.query(sqlQuery);

        console.log('[DEBUG] Resultados crudos:', JSON.stringify(results, null, 2));

        if (!results || results.length === 0) {
            return res.status(200).json([]);
        }

        // Función de mapeo corregida para MariaDB
        const anuncios = results.map(row => {
            const anuncio = {
                id: row.id ? parseInt(row.id) : null,
                titulo: row.titulo ? String(row.titulo) : 'Sin título',
                descripcion: row.descripcion ? String(row.descripcion) : '',
                fecha: row.fecha ? new Date(row.fecha).toISOString() : null,
                lugar: row.lugar ? String(row.lugar) : 'Ubicación no especificada',
                precio: row.precio !== null && !isNaN(row.precio) ? 
                    parseFloat(row.precio) : null,
                categoria: row.categoria ? String(row.categoria) : 'Otros',
                participantes: row.participantes ? String(row.participantes) : '',
                autor: row.autor ? String(row.autor) : 'Anónimo',
                created_at: row.created_at ? new Date(row.created_at).toISOString() : null
            };
            
            console.log('[DEBUG] Anuncio mapeado:', anuncio);
            return anuncio;
        });

        console.log('[INFO] Anuncios formateados correctamente:', anuncios);
        res.json(anuncios);

    } catch (error) {
        console.error('[ERROR] Detalles:', {
            message: error.message,
            sql: error.sql,
            stack: error.stack
        });
        
        res.status(500).json({ 
            error: 'Error al obtener anuncios',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

module.exports = router;