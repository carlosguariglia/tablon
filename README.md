# Tablón de Anuncios

Sistema web para gestionar una cartelera de eventos, donde artistas pueden publicar fechas de presentaciones. Incluye autenticación, registro, panel de anuncios, auditoría de acciones y protección contra XSS.
## Tecnologías
- Node.js (Express)
- MariaDB
- JWT (autenticación)
- Bcrypt (hash de contraseñas)
- HTML, CSS, JavaScript (frontend SPA)

## Estructura del Proyecto

```
backend/
  controllers/      # Lógica de negocio (auth, anuncios, auditoría)
  middlewares/      # Autenticación y autorización (JWT, admin)
  models/           # Modelos de datos (User, Audit)
  routes/           # Rutas API REST
  config/           # Configuración DB y JWT
  scripts/          # Utilidades (crear DB)
  server.js         # Entrada principal del backend
frontend/
  pages/            # Vistas HTML (login, tablon, audit, etc.)
  js/               # Lógica de frontend (auth.js)
  css/              # Estilos
  Media/            # Imágenes (ej: corchea.png)
```

## Instalación

1. Clona el repositorio:
	```
	git clone [url]
	```

2. Instala dependencias en el backend:
	```
	cd backend
	npm install
	```

3. Configura la base de datos MariaDB y crea un usuario.

4. Copia `.env.example` a `.env` y completa tus datos:
	```
	DB_HOST=localhost
	DB_USER=tu_usuario
	DB_PASSWORD=tu_contraseña
	DB_NAME=tablon_db
	DB_PORT=3306
	JWT_SECRET=tu_secreto_super_seguro
	JWT_EXPIRES_IN=1h
	```

5. Crea las tablas necesarias:
se debe crear una base de datos y un usuario antes de usarlo.

	```
	npm run create-db
	```

6. Inicia el servidor backend:
	```
	npm run dev
	```

7. Abre el frontend en tu navegador:
	```
	http://localhost:3000
	```

## Diseño y funcionamiento

- El tablón está pensado para mostrar los 7 días corridos a partir de la fecha ingresada (al inicio tomará la fecha actual). Se debe ingresar la fecha deseada y presionar "Filtrar" para ver los eventos de esa semana.
- Solamente es necesario la registración y login para crear y editar sus propios anuncios. Los anuncios públicos pueden ser visualizados sin autenticación.
- Existe un usuario especial llamado `admin@gmail.com` que es el único que puede editar o borrar anuncios de otros usuarios.
- Además, este usuario admin es el único que puede acceder a la parte de auditoría, donde se registran todos los cambios realizados en la base de datos (login, alta, edición, borrado de anuncios).

- La creación y edición de artistas (perfiles de artista) está restringida únicamente al usuario `admin`. El backend enlaza artistas mencionados en los anuncios sólo si el artista ya existe en la base de datos; no se crean artistas automáticamente desde el campo "participantes". Para crear o modificar artistas utilice la API administrativa (endpoints bajo `/api/admin/artistas`) o el panel de administración.

## Funcionalidades

- **Login y registro**: Desde `login.html` con animación, usando JWT.
- **Panel de anuncios**: Crear, editar, eliminar y filtrar eventos.
- **Auditoría**: Panel admin para ver acciones importantes (login, alta, edición, borrado).
- **Protección XSS**: Sin uso de `innerHTML` para datos de usuario.
- **Admin**: Acceso especial a auditoría y gestión total.

## Scripts útiles

- `npm run create-db`: Crea las tablas en la base de datos.
- `npm run dev`: Inicia el backend en modo desarrollo.

## Notas

- El registro y login están integrados en una sola página.
- El sistema está preparado para ampliaciones (más campos, roles, etc).
# Tablón - Sistema de Autenticación

## Nueva funcionalidad: Sugerir creación de artistas (artist-requests)

Permite que cualquier usuario autenticado envíe una solicitud para que el administrador cree la página de un artista. Las solicitudes son revisadas por el admin, que puede aprobar o rechazar.

### Endpoints principales

- POST /api/artist-requests
	- Autenticación: Bearer token
	- Body (application/json):
		{
			"nombre": "Nombre del artista",            // required
			"bio": "Texto opcional",
			"social_links": [{"platform":"instagram","url":"https://..."}], // o un objeto de key=>url
			"image_urls": ["https://...", "https://..."], // máximo 5 URLs, deben ser http(s)
			"muestras": ["https://..."],
			"notas_usuario": "Mensaje breve al admin"
		}
	- Responses:
		- 201 Created: { message: 'Solicitud creada', id }
		- 400 Bad Request: validación
		- 401 Unauthorized
		- 429 Too Many Requests: límite (3 solicitudes / 24h)

- GET /api/admin/artist-requests
	- Admin only. Params: page, per_page
	- Devuelve lista paginada de solicitudes

- GET /api/admin/artist-requests/:id
	- Admin only. Devuelve detalle de la solicitud

- POST /api/admin/artist-requests/:id/approve
	- Admin only. Body: { admin_notes?: string }
	- Aprueba la solicitud y crea el artista (reusa la lógica existente). Notifica al usuario.

- POST /api/admin/artist-requests/:id/reject
	- Admin only. Body: { reason?: string }
	- Marca la solicitud como 'rejected' y notifica al usuario.

### DB (esquema relevante)

Tabla `artist_requests` (creada en `backend/scripts/createDb.js`):
- id, user_id, nombre, bio, genero, social_links (JSON), image_urls (JSON), muestras (JSON), notas_usuario, status, admin_id, admin_notes, created_at, reviewed_at

Tabla `notifications` (creada por la nueva migración):
- id, user_id, type, title, message, metadata (JSON), is_read, created_at

### Notificaciones
- Al aprobar/rechazar una solicitud, el sistema crea una notificación in-app para el usuario. Opcionalmente puede enviar un email si configuras SMTP (variables de entorno: SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT, SMTP_FROM).

### Seguridad y límites
- Sólo se aceptan URLs `http` o `https` en `image_urls` y `social_links`.
- Límite cliente: máximo 5 image_urls.
- Límite servidor por usuario: máximo 3 solicitudes en 24 horas.

### Cómo probar manualmente (sin UI)
- Ejemplo curl (reemplaza <TOKEN>):
```
curl -X POST http://localhost:3000/api/artist-requests \
	-H "Authorization: Bearer <TOKEN>" \
	-H "Content-Type: application/json" \
	-d '{"nombre":"Artista Demo","bio":"Bio","image_urls":["https://example.com/img.jpg"]}'
```

### Notas para deploy
- Ejecuta `node backend/scripts/createDb.js` para asegurarte que las tablas existen.
- Configura SMTP solo si quieres emails; la funcionalidad en DB (notificaciones) funcionará aunque SMTP no esté presente.

---


