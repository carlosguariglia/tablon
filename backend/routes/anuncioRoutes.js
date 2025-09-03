const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middlewares/authMiddleware');
const { logAction } = require('../controllers/auditController');



router.get('/', async (req, res) => {
    console.log('[API] Obteniendo anuncios con filtros...');
    try {
        // Filtros por query params
        let { fecha, desde, hasta, categoria } = req.query;
        const params = [];
        let whereClauses = [];

        // Si la fecha viene en formato yyyy-mm-dd, agregar hora 00:00:00 si no está presente
        function normalizeDate(str) {
            if (str && /^\d{4}-\d{2}-\d{2}$/.test(str)) {
                return `${str} 00:00:00`;
            }
            return str;
        }
        if (fecha) fecha = normalizeDate(fecha);
        if (desde) desde = normalizeDate(desde);
        if (hasta) hasta = normalizeDate(hasta);

        // Si no hay filtros, mostrar próximos 7 días por defecto
        if (!fecha && !desde && !hasta && !categoria) {
            const now = new Date();
            desde = now.toISOString().slice(0, 19).replace('T', ' ');
            const endDateObj = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            hasta = endDateObj.toISOString().slice(0, 19).replace('T', ' ');
        }

        if (fecha) {
            whereClauses.push('a.fecha = ?');
            params.push(fecha);
        }
        if (desde) {
            whereClauses.push('a.fecha >= ?');
            params.push(desde);
        }
        if (hasta) {
            whereClauses.push('a.fecha <= ?');
            params.push(hasta);
        }
        if (categoria) {
            whereClauses.push('a.categoria = ?');
            params.push(categoria);
        }

        const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

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
            ${whereSQL}
            ORDER BY a.fecha ASC
        `;

        console.log('[SQL] Ejecutando:', sqlQuery, params);
        const [results, metadata] = await db.query(sqlQuery, params);
        console.log('[SQL] Resultados:', results);

        if (!results || results.length === 0) {
            console.log('[API] No se encontraron anuncios para los filtros dados.');
            return res.status(200).json([]);
        }

        const anuncios = results.map(row => ({
            id: row.id ? parseInt(row.id) : null,
            titulo: row.titulo ? String(row.titulo) : 'Sin título',
            descripcion: row.descripcion ? String(row.descripcion) : '',
            fecha: row.fecha ? new Date(row.fecha).toISOString() : null,
            lugar: row.lugar ? String(row.lugar) : 'Ubicación no especificada',
            precio: row.precio !== null && !isNaN(row.precio) ? parseFloat(row.precio) : null,
            categoria: row.categoria ? String(row.categoria) : 'Otros',
            participantes: row.participantes ? String(row.participantes) : '',
            autor: row.autor ? String(row.autor) : 'Anónimo',
            created_at: row.created_at ? new Date(row.created_at).toISOString() : null
        }));

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

// Crear anuncio (solo usuarios logueados)
router.post('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { titulo, descripcion, fecha, lugar, precio, categoria, participantes } = req.body;
        if (!titulo || !descripcion || !fecha || !lugar || !categoria) {
            return res.status(400).json({ message: 'Todos los campos obligatorios deben estar completos.' });
        }
        const sql = `INSERT INTO anuncios (titulo, descripcion, fecha, lugar, precio, categoria, participantes, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
        await db.query(sql, [titulo, descripcion, fecha, lugar, precio || 0, categoria, participantes, userId]);
        await logAction(req, 'CREAR_ANUNCIO', `Título: ${titulo}`);
        res.status(201).json({ message: 'Anuncio creado correctamente.' });
    } catch (error) {
        console.error('[ERROR] Crear anuncio:', error);
        res.status(500).json({ message: 'Error al crear el anuncio.' });
    }
});

// Editar anuncio
router.put('/:id', protect, async (req, res) => {
    try {
        const anuncioId = req.params.id;
        const userId = req.user.id;
        const { name, email } = req.user;
        const { titulo, descripcion, fecha, lugar, precio, categoria, participantes } = req.body;
        // Obtener el anuncio
        const [anuncioRows] = await db.query('SELECT * FROM anuncios WHERE id = ?', [anuncioId]);
        const anuncio = anuncioRows[0];
        if (!anuncio) return res.status(404).json({ message: 'Anuncio no encontrado.' });
        // Permitir solo al autor o al admin
        if (anuncio.user_id !== userId && !(name === 'admin' && email === 'admin@gmail.com')) {
            return res.status(403).json({ message: 'No tienes permiso para editar este anuncio.' });
        }
        await db.query(
            'UPDATE anuncios SET titulo=?, descripcion=?, fecha=?, lugar=?, precio=?, categoria=?, participantes=? WHERE id=?',
            [titulo, descripcion, fecha, lugar, precio || 0, categoria, participantes, anuncioId]
        );
        await logAction(req, 'EDITAR_ANUNCIO', `ID: ${anuncioId}, Título: ${titulo}`);
        res.json({ message: 'Anuncio editado correctamente.' });
    } catch (error) {
        console.error('[ERROR] Editar anuncio:', error);
        res.status(500).json({ message: 'Error al editar el anuncio.' });
    }
});

// Eliminar anuncio
router.delete('/:id', protect, async (req, res) => {
    try {
        const anuncioId = req.params.id;
        const userId = req.user.id;
        const { name, email } = req.user;
        // Obtener el anuncio
        const [anuncioRows] = await db.query('SELECT * FROM anuncios WHERE id = ?', [anuncioId]);
        const anuncio = anuncioRows[0];
        if (!anuncio) return res.status(404).json({ message: 'Anuncio no encontrado.' });
        // Permitir solo al autor o al admin
        if (anuncio.user_id !== userId && !(name === 'admin' && email === 'admin@gmail.com')) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este anuncio.' });
        }
    await db.query('DELETE FROM anuncios WHERE id = ?', [anuncioId]);
    await logAction(req, 'ELIMINAR_ANUNCIO', `ID: ${anuncioId}, Título: ${anuncio.titulo}`);
    res.json({ message: 'Anuncio eliminado correctamente.' });
    } catch (error) {
        console.error('[ERROR] Eliminar anuncio:', error);
        res.status(500).json({ message: 'Error al eliminar el anuncio.' });
    }
});

module.exports = router;