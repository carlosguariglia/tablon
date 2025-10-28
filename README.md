# Tablón de Anuncios

Sistema web para gestionar una cartelera de eventos, donde artistas pueden publicar fechas de presentaciones. Incluye autenticación, registro, panel de anuncios, auditoría de acciones y protección contra XSS.
## Tecnologías
- Node.js (Express)
- MariaDB
- JWT (autenticación)
- Bcrypt (hash de contraseñas)
- HTML, CSS, JavaScript (frontend SPA)

## Estructura del Proyecto

# Tablón de Anuncios y Artistas

Sistema web para gestionar una cartelera de eventos musicales y perfiles de artistas. Los usuarios pueden ver eventos, crear anuncios, y sugerir nuevos artistas. Los administradores pueden aprobar sugerencias, gestionar artistas y auditar acciones del sistema.

## 🎯 Características Principales

- **Gestión de Anuncios**: Crear, editar y eliminar eventos/fechas de presentaciones
- **Perfiles de Artistas**: Páginas individuales con bio, redes sociales e imágenes
- **Sugerencias de Artistas**: Los usuarios pueden proponer nuevos artistas para el sistema
- **Sistema de Aprobación**: Administradores revisan y aprueban/rechazan sugerencias
- **Notificaciones**: Sistema de notificaciones in-app para usuarios
- **Auditoría**: Registro completo de acciones importantes del sistema
- **Autenticación JWT**: Sistema seguro con tokens y protección de rutas
- **Rate Limiting**: Protección contra abuso con límites por IP y por usuario

## 🛠 Tecnologías

- **Backend**: Node.js, Express, MariaDB
- **Autenticación**: JWT (JSON Web Tokens)
- **Seguridad**: Bcrypt (hash de contraseñas), Sanitización de entradas, Rate limiting
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS - SPA)
- **Base de datos**: MariaDB con driver nativo (auto-parsing de JSON)

## 📁 Estructura del Proyecto

```
backend/
  config/           # Configuración (DB, JWT)
  controllers/      # Lógica de negocio
    - authController.js          # Login, registro, verificación
    - anuncioController.js       # CRUD de anuncios
    - artistaController.js       # Lectura pública de artistas
    - artistAdminController.js   # Gestión admin de artistas
    - artistRequestController.js # Sugerencias de artistas
    - auditController.js         # Auditoría de acciones
    - userController.js          # Gestión de usuarios
  repositories/     # Capa de acceso a datos
    - AnuncioRepository.js
    - ArtistRepository.js
    - ArtistRequestRepository.js
    - AuditRepository.js
    - NotificationRepository.js
    - UserRepository.js
  middlewares/      # Autenticación y autorización
    - authMiddleware.js # protect, isAdmin
  routes/           # Rutas API REST
  services/         # Lógica de negocio compleja
    - notificationService.js # Envío de notificaciones
  utils/            # Utilidades (sanitización, validación)
  scripts/          # Scripts de utilidad
    - createDb.js   # Creación de tablas
  server.js         # Entrada principal del backend

frontend/
  pages/            # Vistas HTML
    - login.html                  # Autenticación
    - welcome.html                # Bienvenida post-login
    - tablon.html                 # Tablón de anuncios público
    - artist.html                 # Página individual de artista
    - suggest-artist.html         # Formulario para sugerir artistas
    - admin.html                  # Panel de administración
    - admin-artists.html          # Gestión de artistas (admin)
    - admin-artist-requests.html  # Revisión de sugerencias (admin)
    - audit.html                  # Auditoría (admin)
  js/               # Lógica de frontend
    - auth.js                     # Manejo de autenticación
    - suggest-artist.js           # Formulario de sugerencias
    - admin-artists.js            # Panel admin artistas
    - admin-artist-requests.js    # Panel admin sugerencias
  css/              # Estilos
    - styles.css    # Estilos generales
    - tablon.css    # Estilos del tablón y artistas
  Media/            # Recursos multimedia
  assets/           # Recursos estáticos
```

## 🚀 Instalación

### Requisitos Previos
- Node.js (v14 o superior)
- MariaDB (v10.5 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone [url-del-repositorio]
   cd tablon
   ```

2. **Instalar dependencias del backend**:
   ```bash
   cd backend
   npm install
   ```

3. **Configurar MariaDB**:
   - Crea una base de datos:
     ```sql
     CREATE DATABASE tablon_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
   - Crea un usuario con permisos:
     ```sql
     CREATE USER 'tablon_user'@'localhost' IDENTIFIED BY 'tu_contraseña';
     GRANT ALL PRIVILEGES ON tablon_db.* TO 'tablon_user'@'localhost';
     FLUSH PRIVILEGES;
     ```

4. **Configurar variables de entorno**:
   - Crea un archivo `.env` en la carpeta `backend/`:
     ```env
     # Base de datos
     DB_HOST=localhost
     DB_USER=tablon_user
     DB_PASSWORD=tu_contraseña
     DB_NAME=tablon_db
     DB_PORT=3306
     
     # JWT
     JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion
     JWT_EXPIRES_IN=24h
     
     # Frontend (para CORS)
     FRONTEND_URL=http://localhost:3000
     
     # Puerto del servidor
     PORT=3000
     
     # Email (OPCIONAL - para notificaciones por email)
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=tu_email@gmail.com
     SMTP_PASS=tu_contraseña_de_aplicacion
     SMTP_FROM=tu_email@gmail.com
     ```

5. **Crear las tablas en la base de datos**:
   ```bash
   npm run create-db
   ```
   Este script crea todas las tablas necesarias: `users`, `artists`, `anuncios`, `artist_requests`, `notifications`, `audit_log`.

6. **Iniciar el servidor**:
   ```bash
   npm run dev
   ```

7. **Acceder a la aplicación**:
   - Abre tu navegador en: `http://localhost:3000`

### Usuario Administrador

El script `createDb.js` crea automáticamente un usuario administrador:
- **Email**: `admin@gmail.com`
- **Contraseña**: `admin123`

⚠️ **IMPORTANTE**: Cambia esta contraseña en producción.

## 📖 Funcionalidades Detalladas

### 1. Sistema de Anuncios
Los usuarios autenticados pueden crear anuncios de eventos/presentaciones.

**Características**:
- ✅ Crear anuncios con fecha, hora, lugar y descripción
- ✅ Editar y eliminar sus propios anuncios
- ✅ Ver anuncios públicos sin necesidad de login
- ✅ Filtrar anuncios por fecha (vista de 7 días)
- ✅ El admin puede editar/eliminar cualquier anuncio

**Endpoints API**:
- `GET /api/anuncios` - Listar anuncios públicos
- `POST /api/anuncios` - Crear anuncio (autenticado)
- `PUT /api/anuncios/:id` - Editar anuncio (autenticado)
- `DELETE /api/anuncios/:id` - Eliminar anuncio (autenticado)

### 2. Sistema de Artistas

#### 2.1 Vista Pública de Artistas
Cualquier usuario puede ver los perfiles de artistas con:
- Foto de perfil
- Biografía
- Enlaces a redes sociales (Instagram, Spotify, YouTube, etc.)
- Información de contacto

**Endpoints API**:
- `GET /api/artistas` - Listar todos los artistas
- `GET /api/artistas/:id` - Ver detalle de un artista

#### 2.2 Gestión de Artistas (Solo Admin)
El administrador puede crear, editar y eliminar artistas desde el panel administrativo.

**Características**:
- ✅ Crear artistas con múltiples redes sociales
- ✅ Sistema dinámico para agregar/quitar redes sociales
- ✅ Subir URLs de imágenes
- ✅ Validación de URLs

**Endpoints API**:
- `POST /api/admin/artistas` - Crear artista (admin)
- `PUT /api/admin/artistas/:id` - Editar artista (admin)
- `DELETE /api/admin/artistas/:id` - Eliminar artista (admin)

### 3. Sugerencias de Artistas (Artist Requests)

Los usuarios autenticados pueden sugerir nuevos artistas para que el administrador los apruebe.

#### Flujo de Trabajo:
1. **Usuario sugiere artista**: Llena formulario con nombre, bio, redes sociales e imágenes
2. **Sistema valida**: Verifica URLs, limita a 1 imagen, controla rate limiting (máx. 3 sugerencias/24h)
3. **Admin revisa**: Ve todas las sugerencias en el panel administrativo
4. **Admin aprueba/rechaza**: 
   - Si aprueba: Se crea automáticamente el artista con todos los datos
   - Si rechaza: Se notifica al usuario con el motivo
5. **Usuario recibe notificación**: Ve el resultado en su panel de notificaciones

**Características de Seguridad**:
- ✅ Validación de URLs (solo http/https)
- ✅ Sanitización de entradas (protección XSS)
- ✅ Rate limiting: máximo 3 sugerencias por usuario cada 24 horas
- ✅ Límite de 1 imagen por sugerencia
- ✅ Verificación de duplicados antes de crear artista

**Endpoints API**:
- `POST /api/artist-requests` - Crear sugerencia (autenticado)
  ```json
  {
    "nombre": "Nombre del artista",
    "bio": "Biografía",
    "social_links": [
      {"platform": "Instagram", "url": "https://instagram.com/..."},
      {"platform": "Spotify", "url": "https://spotify.com/..."}
    ],
    "image_urls": ["https://example.com/imagen.jpg"],
    "notas_usuario": "Comentario adicional"
  }
  ```
- `GET /api/admin/artist-requests` - Listar sugerencias (admin)
- `GET /api/admin/artist-requests/:id` - Ver detalle (admin)
- `POST /api/admin/artist-requests/:id/approve` - Aprobar (admin)
- `POST /api/admin/artist-requests/:id/reject` - Rechazar (admin)
- `DELETE /api/admin/artist-requests/:id` - Eliminar (admin)

### 4. Sistema de Notificaciones

Las notificaciones se generan automáticamente cuando:
- El admin aprueba una sugerencia de artista
- El admin rechaza una sugerencia de artista

**Características**:
- ✅ Notificaciones in-app persistentes
- ✅ Marcar como leídas
- ✅ Soporte para notificaciones por email (opcional, requiere configurar SMTP)

**Endpoints API**:
- `GET /api/notifications` - Ver notificaciones del usuario (autenticado)
- `POST /api/notifications/:id/read` - Marcar como leída (autenticado)

### 5. Auditoría (Solo Admin)

El sistema registra automáticamente todas las acciones importantes:
- Login de usuarios
- Creación, edición y eliminación de anuncios
- Creación, edición y eliminación de artistas
- Aprobación/rechazo de sugerencias

**Información registrada**:
- Usuario que realizó la acción
- Tipo de acción (login, create, update, delete)
- Tabla afectada
- ID del registro afectado
- Timestamp

**Endpoints API**:
- `GET /api/audit` - Ver log de auditoría (admin)

## 🔒 Seguridad

El sistema implementa múltiples capas de seguridad:

### Autenticación y Autorización
- **JWT Tokens**: Autenticación stateless con tokens seguros
- **Bcrypt**: Hash de contraseñas con salt automático
- **Middleware protect**: Protege rutas que requieren autenticación
- **Middleware isAdmin**: Restringe acceso a funciones administrativas

### Protección contra Ataques
- **XSS**: Sanitización de todas las entradas de usuario
- **SQL Injection**: Uso de prepared statements en todas las queries
- **Rate Limiting**: 
  - General: 100 requests/15min por IP
  - Autenticación: 5 intentos/15min por IP
  - Sugerencias de artistas: 3 sugerencias/24h por usuario
- **CORS**: Configuración restrictiva por origen

### Validación de Datos
- Validación de URLs (solo http/https)
- Validación de formatos de email
- Sanitización con DOMPurify en frontend
- Escape de caracteres especiales en backend

## 📝 Scripts Disponibles

En el directorio `backend/`:

```bash
npm run dev        # Inicia servidor en modo desarrollo (nodemon)
npm start          # Inicia servidor en modo producción
npm run create-db  # Crea/actualiza estructura de base de datos
```

## 🗄️ Esquema de Base de Datos

### Tabla `users`
- `id` (INT, PK, AUTO_INCREMENT)
- `username` (VARCHAR(100), UNIQUE)
- `email` (VARCHAR(100), UNIQUE)
- `password` (VARCHAR(255)) - Hash bcrypt
- `is_admin` (BOOLEAN, default: false)
- `created_at` (DATETIME)

### Tabla `artists`
- `id` (INT, PK, AUTO_INCREMENT)
- `name` (VARCHAR(150), UNIQUE)
- `bio` (TEXT)
- `photo` (VARCHAR(1000)) - URL de imagen
- `instagram`, `spotify`, `youtube`, `website`, `bandcamp`, `tiktok`, `threads` (VARCHAR(1000)) - URLs de redes sociales
- `whatsapp`, `email`, `phone` (VARCHAR)
- `created_at` (DATETIME)

### Tabla `anuncios`
- `id` (INT, PK, AUTO_INCREMENT)
- `user_id` (INT, FK → users)
- `fecha`, `hora`, `lugar`, `descripcion`
- `participantes` (TEXT)
- `created_at` (DATETIME)

### Tabla `artist_requests`
- `id` (INT, PK, AUTO_INCREMENT)
- `user_id` (INT, FK → users)
- `nombre` (VARCHAR(150))
- `bio` (TEXT)
- `genero` (VARCHAR(80))
- `social_links` (JSON) - Array de objetos {platform, url}
- `image_urls` (JSON) - Array de URLs
- `muestras` (JSON) - Array de URLs de muestras
- `notas_usuario` (TEXT)
- `status` (ENUM: 'pending', 'approved', 'rejected')
- `admin_id` (INT, FK → users)
- `admin_notes` (TEXT)
- `created_at`, `reviewed_at` (DATETIME)

### Tabla `notifications`
- `id` (INT, PK, AUTO_INCREMENT)
- `user_id` (INT, FK → users)
- `type` (VARCHAR(50))
- `title` (VARCHAR(200))
- `message` (TEXT)
- `metadata` (JSON)
- `is_read` (BOOLEAN, default: false)
- `created_at` (DATETIME)

### Tabla `audit_log`
- `id` (INT, PK, AUTO_INCREMENT)
- `user_id` (INT, FK → users)
- `action` (VARCHAR(50)) - 'login', 'create', 'update', 'delete'
- `table_name` (VARCHAR(50))
- `record_id` (INT)
- `details` (TEXT)
- `created_at` (DATETIME)

## 🎨 Diseño y UX

### Vista de Usuario Regular
- **Login/Registro**: Página única con formularios integrados
- **Tablón**: Vista de anuncios con filtro por fecha (7 días)
- **Artistas**: Galería de perfiles con búsqueda
- **Sugerir Artista**: Formulario dinámico con validación en tiempo real

### Vista de Administrador
- **Panel Admin**: Acceso centralizado a todas las funciones
- **Gestión de Artistas**: CRUD completo con formularios intuitivos
- **Revisión de Sugerencias**: Vista detallada con imágenes y redes sociales
- **Auditoría**: Tabla con filtros y búsqueda

### Características de UI
- ✨ Diseño responsive
- ✨ Validación en tiempo real de formularios
- ✨ Mensajes de error/éxito claros
- ✨ Carga dinámica sin recargar página
- ✨ Botones de navegación consistentes
## 🚧 Desarrollo y Extensión

### Agregar una Nueva Red Social

1. **Backend** - Actualizar tabla `artists`:
   ```sql
   ALTER TABLE artists ADD COLUMN nueva_red VARCHAR(1000) NULL;
   ```

2. **Frontend** - Agregar opción en el selector:
   ```javascript
   // En admin-artists.html o suggest-artist.html
   <option value="nueva_red">Nueva Red</option>
   ```

3. **Backend** - Actualizar `platformMap` en `artistRequestController.js`:
   ```javascript
   const platformMap = {
     // ... existentes
     'nueva_red': 'nueva_red'
   };
   ```

### Agregar un Nuevo Tipo de Notificación

1. Crear función en `notificationService.js`
2. Llamar desde el controlador correspondiente
3. La notificación se guardará automáticamente en la BD

### Personalizar Rate Limits

Editar en `server.js`:
```javascript
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100  // Cambiar este número
});
```

## 🐛 Solución de Problemas Comunes

### Error: "Cannot find module 'nodemailer'"
**Solución**: Este error es normal si no configuraste SMTP. Las notificaciones in-app funcionarán igualmente. Para habilitarlo:
```bash
npm install nodemailer
```

### Las imágenes de Instagram no se cargan
**Causa**: Instagram usa URLs temporales con tokens que expiran.
**Solución**: Usar URLs permanentes (Imgur, servidor propio) o implementar un servicio de proxy.

### Error: "Data too long for column 'photo'"
**Causa**: URLs muy largas.
**Solución**: Ya está resuelto - las columnas de URLs soportan hasta 1000 caracteres.

### MariaDB auto-parsea JSON
**Nota técnica**: El driver MariaDB convierte automáticamente columnas JSON a objetos JavaScript. El código verifica `typeof === 'string'` antes de hacer `JSON.parse()` para evitar errores.

## 📚 Recursos Adicionales

### Documentación de Referencia
- [Express.js](https://expressjs.com/)
- [JWT](https://jwt.io/)
- [MariaDB](https://mariadb.org/documentation/)
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)

### Próximas Mejoras Sugeridas
- [ ] Paginación en lista de artistas
- [ ] Búsqueda avanzada con filtros
- [ ] Upload de imágenes al servidor (en lugar de URLs)
- [ ] Sistema de roles más granular
- [ ] Tests automatizados (Jest, Supertest)
- [ ] Migración a TypeScript
- [ ] API documentation con Swagger

## 👥 Contribuciones

Este es un proyecto educativo. Si encuentras bugs o tienes sugerencias:
1. Abre un issue describiendo el problema
2. Propón mejoras mediante pull requests
3. Documenta tus cambios claramente

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.

---

**Desarrollado como proyecto anual - ISFT 151**

---


