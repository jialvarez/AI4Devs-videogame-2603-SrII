Open Code con GLM-5.1

# Primer prompt:

Eres un experto en desarrollar video juegos web. Vas a desarrollar el clásico juego pong de un solo jugador. Debe podes jugarte en los navegadores mas usados como chrome, firefox, microsoft edge, entre otros.
El juego debe estar en css, js vanilla con jsdoc y ts-check activado, y html. Debemos tener un archivo por cada lenguaje. Creame en primer lugar el promt indicado para comenzar con este desarrollo.

# Segundo prompt:

agreguemos que debemos respetar los principios solid, dry, kiss.
tambien agregar que debemos tener 3 niveles de juego: facil,intermedio y dificil. La diferencia entre cada uno de ellos debe ser la velocidad con la que va la pelota y la respuesta del contrincante. El prompt damelo en formato md

# Tercer prompt

# Prompt — Pong Un Jugador (Web Vanilla)

> Eres un desarrollador experto en videojuegos web con HTML5 Canvas. Desarrolla el clásico juego Pong en su versión de un solo jugador usando tecnologías web puras sin frameworks ni librerías externas.

## Requisitos técnicos

- **HTML**: estructura mínima con un `<canvas>` como área de juego. Semántico, accesible.
- **CSS**: estilos visuales del juego (fondo, centrado del canvas, tipografía para marcador, responsive). Sin frameworks.
- **JavaScript vanilla** con:
  - `// @ts-check` activado en la primera línea
  - JSDoc completo en todas las funciones, clases y tipos custom
  - Tipado estricto vía JSDoc (`@type`, `@param`, `@returns`, `@typedef`)
  - ES modules (`import`/`export`) o IIFE para encapsulamiento

## Estructura de archivos

- `index.html` — markup y carga de assets
- `style.css` — estilos visuales
- `game.js` — lógica completa del juego

## Mecánicas del juego

- **Un jugador**: la paleta inferior la controla el usuario, la paleta superior es la IA
- **Pelota**: rebota en paredes laterales y paletas; si cruza un lado vertical, punto para el oponente
- **IA**: sigue la pelota con velocidad limitada según el nivel seleccionado
- **Marcador**: visible en pantalla, primero a 5 puntos gana
- **Estados del juego**: START (selección de dificultad) → PLAYING → GAME OVER (con opción de reiniciar)
- **Controles**: teclado (flechas arriba/abajo o W/S) y mouse/touch para la paleta del jugador
- **Dificultad progresiva**: la velocidad de la pelota incrementa gradualmente con cada golpe

## Niveles de dificultad

El jugador selecciona el nivel antes de comenzar:

| Nivel | Velocidad inicial pelota | Velocidad IA | Incremento por golpe |
|---|---|---|---|
| **Fácil** | Lenta | Baja (reacciona con delay, no siempre sigue la pelota) | Mínimo |
| **Intermedio** | Media | Media (sigue la pelota la mayor parte del tiempo) | Moderado |
| **Difícil** | Rápida | Alta (sigue la pelota casi en tiempo real,predice trayectoria) | Alto |

La diferencia entre niveles es únicamente **velocidad de la pelota** y **respuesta del contrincante IA**. Sin modificar dimensiones ni reglas.

## Visual y UX

- Estilo retro/neón sobre fondo oscuro
- Línea central punteada (estilo clásico)
- Efecto visual en los rebotes (flash breve en la paleta)
- Canvas centrado y responsive (mantiene aspect ratio en resize)
- Texto de marcador renderizado dentro del canvas
- Selector de dificultad visible en pantalla de START

## Compatibilidad

- Debe funcionar en Chrome, Firefox, Safari y Edge (últimas 2 versiones mayor)
- Usar exclusivamente APIs de Canvas ampliamente soportadas (sin WebGL, sin experimentales)
- Sin dependencias de build tools, bundlers ni npm

## Calidad de código

### Principios de diseño

- **SOLID**: una responsabilidad por módulo/clase, abierto-cerrado para agregar niveles sin modificar lógica core, inversión de dependencias mediante abstracciones (interfaces vía JSDoc `@typedef`)
- **DRY**: sin duplicación de lógica; constantes de configuración centralizadas; funciones genéricas reutilizables (colisiones, rendering, input)
- **KISS**: sin over-engineering; la solución más simple que funcione; sin patrones innecesarios para un juego de esta escala

### Estándares

- Game loop con `requestAnimationFrame` y deltaTime para movimiento frame-rate independent
- Separación clara de responsabilidades: rendering, update, input, collision detection
- Constantes de configuración al inicio (velocidades, dimensiones, colores)
- Sin hardcoded magic numbers
