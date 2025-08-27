#!/bin/bash

# Cargar nvm y usar la versión correcta de node
export NVM_DIR="/home/carlosguariglia/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Cambiar al directorio del proyecto
cd "/home/carlosguariglia/cloud-drive/ISFT_151/2do_ISFT/Practicas_Prof_2/Proyecto_anual/tablonV3/tablon/backend" || {
    echo "Error: No se pudo acceder al directorio del proyecto"
    read
    exit 1
}

# Mostrar qué versión de node estamos usando
echo "Versión de node:"
node --version

# Arrancar servidor con nodemon
npx nodemon server.js

# Mantener ventana abierta
echo -e "\n❌ Servidor detenido. Presiona Enter para cerrar..."
read
