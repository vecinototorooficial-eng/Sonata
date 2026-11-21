# Sonata MVP — Informe de verificación

## Pruebas automatizadas realizadas
- Sintaxis JavaScript revisada con Node.js.
- Pantalla inicial renderizada a 390 × 844 px en Chromium headless.
- Inicio de lección, nota incorrecta y secuencia correcta.
- Finalización de lección y pantalla de resultados.
- Apertura de cofre, cambio a estado abierto y navegación.
- Pantalla Premium para contenido intermedio.
- Perfil local del propietario y autorización local de otra dirección.
- Recorrido completo de las ocho lecciones, apertura de los cinco cofres y acceso a canción intermedia de prueba.
- Sin errores de JavaScript en los escenarios anteriores.

## No comprobado todavía
- Instalación real en Android, iPhone o Chromebook: requiere publicar en una URL HTTPS y probar en dispositivos.
- Funcionamiento sin conexión en dispositivos reales.
- Micrófono en distintos modelos de móviles y ambientes.
- Piano MIDI en hardware real.
- Autenticación y compra reales: aún no implementadas.

## Nota técnica de las pruebas
El navegador automatizado se ejecutó con el documento inyectado localmente porque el entorno de pruebas bloquea la navegación HTTP y file://. Por ello, el service worker no se ha probado de extremo a extremo.
