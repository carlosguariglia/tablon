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

