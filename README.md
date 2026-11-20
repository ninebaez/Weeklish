# Weeklish

Página estática para aprender inglés. Está hecha con HTML, CSS y JavaScript; no requiere compilación ni dependencias.

## Archivos

- `index.html`: contenido y secciones de Grammar, Listening, Reading, Vocab, Speaking y Games.
- `styles.css`: diseño adaptable a pantallas grandes y pequeñas.
- `script.js`: navegación, quizzes, niveles, audio, grabación de voz y juegos.
- `vocab-data.js`: catálogo de imágenes de vocabulario.
- `index-github.html`: versión en un solo archivo con CSS, JavaScript y catálogo de vocabulario integrados.
- `assets/`: imágenes, audios y video usados por la página.

## Cómo abrirla

Abre `index.html` en un navegador. Para el micrófono, permite el acceso cuando el navegador lo solicite.

## Subirla a un repositorio

Sube **todo el contenido de esta carpeta** y conserva la estructura, en especial la carpeta `assets/`. Los archivos HTML, CSS y JavaScript hacen referencia a los recursos mediante rutas relativas; si falta un archivo o se cambia de ubicación, esa parte de la página no cargará.

Si prefieres usar un solo archivo de código, copia el contenido de `index-github.html` al `index.html` de tu repositorio. También debes copiar `assets/` al mismo nivel que `index.html`.

El sitio no tiene servidor ni base de datos. Las respuestas de los quizzes se procesan en el navegador y las grabaciones de Speaking solo están disponibles en la página mientras permanece abierta.
