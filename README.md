# Tablón - Sistema de Autenticación

## Requisitos
- Node.js v18+
- MariaDB

## Instalación
1. Clonar repo: `git clone [url]`
2. Instalar dependencias: `npm install`
3. Configurar `.env` (copiar de `.env.example`)
4. Ejecutar: `npm run dev`


Repositorio para ir subiendo el proyecto de una cartelera donde los artistas pueen ir subiendo las fechas de sus presentaciones, 
por ahora solo esta hecho el login y registro usando node.js, mariadb, jwt, bcrypt


para usarlo hay que crear un archivo .env dentro del directorio backend. 

ejecutar npm install en la carpeta backend
(instalara los modulos de node necesarios)

se debe crear una base de datos y un usuario antes de usarlo.
corriendo npm run create-db se crea la tabla en la base de datos

esta es la estructura del .env

DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=tablon_db
DB_PORT=3306
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=1h


una vez hecho esto:
desde el directorio backend correr
npm run dev
y luego en un navegador abrir
http:localhost:3