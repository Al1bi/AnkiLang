# AnkiLang

Aplicación móvil desarrollada con React Native. Su propósito principal es ayudar a los estudiantes de japonés a gestionar su vocabulario, analizar oraciones y facilitar la creación de material de estudio para aplicaciones de repetición espaciada como Anki.

## Funcionalidades Principales

- **Gestión de Vocabulario:** Permite agregar, visualizar y administrar listas de palabras.
- **Soporte para Japonés:** Incluye una función para analizar oraciones y extraer el Furigana correspondiente.
- **Transferencia de Datos:** Permite importar listas de palabras desde archivos CSV y exportar el vocabulario pendiente, ya sea en formato CSV o en un formato compatible con Anki.

## Instrucciones de Ejecución (Expo Go)

### 1. Requisitos Previos

- Tener instalado Node.js en la computadora.
- Instalar la aplicación "Expo Go" en el dispositivo móvil.
- Ambos dispositivos (computadora y teléfono) deben estar conectados a la misma red Wi-Fi.

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Configuración de Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto para conectar la aplicación con la base de datos de Supabase. Añadir las siguientes líneas con las credenciales del proyecto:

```text
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 4. Iniciar el Servidor Local

Ejecutar el siguiente comando en la terminal para iniciar el servidor de desarrollo de Expo:

```bash
npx expo start
```

### 5. Abrir la Aplicación en el Teléfono

Al iniciar el servidor, aparecerá un código QR en la terminal.

Abrir la aplicación Expo Go, seleccionar "Scan QR code" y escanear el código de la terminal.

La aplicación comenzará a cargar y se mostrará en la pantalla del dispositivo.

## Mejoras a Considerar

- **Identificación de palabras homógrafas**: Actualmente, el identificador principal en la base de datos es la palabra escrita. Sin embargo, en japonés existen palabras que se escriben igual pero tienen lecturas (furigana) y significados distintos. Es necesario modificar el modelo de datos para que el identificador contemple la lectura, así como actualizar la interfaz gráfica para que el usuario pueda distinguirlas claramente y sin confusiones.

- **Automatización de significados y etiquetas**: El flujo actual de trabajo requiere exportar las palabras a un archivo CSV para luego generar sus significados y etiquetas mediante un modelo de lenguaje externo (LLM) de forma manual. Se explorará la integración de una API de bajo costo para automatizar este enriquecimiento de datos directamente desde la aplicación.

- **Soporte multiusuario**: Al día de hoy, el proyecto está diseñado como una aplicación personal donde el usuario debe configurar su propio entorno y base de datos. Se evaluará la implementación de un sistema de autenticación y una reestructuración en Supabase para permitir que múltiples usuarios puedan registrarse y gestionar su propio vocabulario de manera independiente.
