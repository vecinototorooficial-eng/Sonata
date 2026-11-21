# Sonata — MVP instalable (v1)

Aplicación web progresiva (PWA) diseñada para probarse en Android, iPhone y Chromebook.

## Qué funciona
- 8 lecciones secuenciales, 5 de principiante y 3 de nivel intermedio.
- Teclado en pantalla con sonido y validación de notas. El teclado del ordenador usa el nombre de la letra, como en el piano: C Do, D Re, E Mi, F Fa, G Sol, A La, B Si. Si el ejercicio espera esa misma letra en la octava aguda (Do5–Sol5), la letra sin mayúsculas toca la nota esperada; si no, suena la octava de Do4 a Si4. Mayús+letra fuerza la octava 5 (Do5–Sol5) y la tecla 8 es siempre Do agudo. La y Si solo existen en la octava grave, así que Mayús+A y Mayús+B no tocan otra nota.
- Micrófono experimental (necesita HTTPS y permisos), y Web MIDI si está disponible y hay piano compatible.
- Resultado por precisión con 1, 2 o 3 estrellas, XP al completar por primera vez una lección.
- 4 canciones de práctica originales (2 gratuitas, 2 de nivel intermedio).
- 5 cofres de rarezas, desbloqueados al completar 1, 2, 4, 6 y 8 lecciones. Cada cofre se abre una sola vez. XP y monedas se guardan en el navegador.
- Progreso conservado con localStorage del dispositivo.
- Pantalla de Sonata Completo a 10 € **sin cobro operativo**.
- Perfil de prueba: se puede guardar un correo solo en este dispositivo. No inicia sesión ni desbloquea contenido.
- Manifest, iconos y service worker para instalación y funcionamiento básico sin conexión tras la primera carga.

## Lo que NO funciona aún
- Compras y pagos reales. No introduzcas datos de tarjetas: no hay checkout.
- Identidad validada y acceso Premium real. Esta versión pública no incluye un desbloqueo por correo.
- Sincronización entre dispositivos, gestión de usuarios, revisión de compras y restauración.
- Análisis profesional del ritmo, manos o calidad de interpretación.
- Detección de micrófono garantizada: está en fase **experimental** y depende del entorno, dispositivo y navegador.
- App Store o Google Play nativas: esta es una PWA, no una publicación en tiendas.

## Probar en un ordenador
Dentro de esta carpeta ejecuta `python -m http.server 8080`, y visita `http://localhost:8080`.

## Instalar en Android / Chromebook
1. Publica **todos los archivos de esta carpeta** en una URL HTTPS, preservando rutas y nombres (por ejemplo, GitHub Pages o Netlify).
2. Abre la URL en Chrome.
3. En el menú del navegador elige **Instalar aplicación** o **Añadir a pantalla de inicio**.

## Instalar en iPhone
1. Publica el proyecto en HTTPS y abre la URL en Safari.
2. Pulsa **Compartir** → **Añadir a pantalla de inicio** (en versiones recientes puede estar bajo **Más**).
3. Abre Sonata desde la pantalla de inicio.

## Pruebas básicas
1. Inicia la primera lección y toca las notas que se indican. Si tocas una nota distinta, debes recibir una corrección; si aciertas, avanza.
2. Termina la lección, comprueba estrellas y XP. La siguiente debe desbloquearse.
3. En Recompensas abre el cofre común. Comprueba que solo puede abrirse una vez.
4. Actualiza la página y comprueba que el progreso sigue guardado.
5. Abre un contenido intermedio: debe aparecer Sonata Completo (10 €, sin cobro).
6. En Perfil puedes guardar un correo local. No desbloquea el nivel intermedio: ese contenido sigue mostrando Sonata Completo a 10 €, sin cobro.
7. En un móvil prueba también orientación vertical, teclado táctil y, con HTTPS, permisos del micrófono.

## Archivo de prueba directa
`index.html` se puede abrir en algunos navegadores como archivo para ver la interfaz, pero para instalarse o funcionar offline necesita HTTP(s), normalmente **HTTPS** fuera de localhost.
