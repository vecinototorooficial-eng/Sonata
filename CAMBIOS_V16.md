# Sonata V16 — el micrófono escucha el piano

- Al abrir la aplicación por primera vez, Sonata explica para qué quiere el micrófono y lo pide con un toque (necesario en Safari del iPhone).
- Si se permite, las lecciones y las canciones avanzan con lo que oye el micrófono de un piano acústico o digital.
- Si se rechaza o no hay micrófono, se puede seguir con el teclado de la pantalla o con las letras del ordenador. La elección queda guardada en este dispositivo.
- La detección de nota es monofónica (YIN), con umbral de silencio, ataque para que una nota repetida cuente otra vez, y tolerancia en cents. El sonido de los ejemplos de la propia app no se cuenta como una nota tocada.
- En la práctica se ve el nivel, el estado «escuchando» y el nombre de la nota (letra y solfeo), en español y en inglés.
- Hay una prueba «toca un Do» para comprobar que el micrófono responde.
- La caché del service worker pasa a v16. El progreso sigue en `sonata_mvp_v1`.
