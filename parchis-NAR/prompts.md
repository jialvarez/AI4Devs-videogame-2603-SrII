# Prompts

-----
Quiero hacer un parchís pero no sé si hacerlo en Pygame o en Phaser
-----
Eres un desarrollador de videojuegos experto en Python y la librería **Phaser**. Tu enfoque principal es el desarrollo ágil y el código limpio.

### Responsabilidades:
* **Simplicidad:** Priorizar la funcionalidad sobre la estética. Usar formas geométricas básicas (círculos y rectángulos).
* **Arquitectura:** Implementar un sistema de turnos robusto y una gestión de colisiones simple para las casillas.
* **Documentación:** Escribir código autodocumentado con comentarios breves en español.
* **Eficiencia:** Asegurar que el bucle principal del juego (`game loop`) sea ligero y no consuma recursos innecesarios.

Desarrollar la versión más simplificada del Parchís utilizando `Phaser`. El objetivo es tener un prototipo funcional para un solo jugador que controla los 4 colores.

### Requisitos del Tablero:
* **Diseño:** Un cuadrado central y cuatro pasillos que formen una cruz. 
* **Colores:** Rojo, Verde, Amarillo y Azul.
* **Casillas:** Representadas por cuadrados vacíos; las fichas serán círculos de color.

### Mecánicas Simplificadas:
1.  **Jugador Único:** El usuario controla el turno de cada color secuencialmente.
2.  **Dado Único:** Un botón o tecla que genere un número aleatorio del 1 al 6.
3.  **Movimiento:** Al hacer clic en una ficha, esta avanza automáticamente el número de casillas indicado por el dado.
4.  **Meta:** Si una ficha llega a la casilla final, queda fuera de juego. El juego termina cuando un color lleva sus 4 fichas a la meta.

### Restricciones (Out of Scope):
* No hay "puentes" o bloqueos.
* No hay animaciones de movimiento (teletransporte instantáneo a la casilla destino).
* No hay sistema de "comer" fichas en esta fase inicial.
* Sin menús de inicio ni pantallas de carga.

----
Cancela el diseño libre. El tablero de Parchís es una cuadrícula estricta de 15 x 15 casillas.
* Tamaño de cada casilla: 40x40 píxeles (Ventana total de 600x600 px).
* Las 4 Casas (Esquinas) a cuatro colores, rojo, verde, amarillo y azul: Son bloques de 6 x 6 casillas en cada esquina.
* Los 4 Pasillos: Tienen un ancho de 3 casillas y un largo de 6 casillas.
* El Centro (Meta): Es un bloque de 3 x 3 casillas en el centro exacto.
* Recorrido: El circuito exterior común tiene 68 casillas en total. Cada jugador tiene además su pasillo final de 8 casillas que lleva a la meta.

Haz el código directamente usando bucles basados en esta matriz 15 x 15. No razones más.
----
Sigues razonando muchísimo. Te he añadido un screenshot en tablero.jpg para que lo puedas dejar de fondo y solamente poner las fichas encima.
----
Olvida las reglas del parchís por un momento. Solo quiero que dibujes una cuadrícula de 15 x 15 casillas (cada casilla de 40 x 40 px).
Pinta de Rojo el bloque superior izquierdo 6 x 6.
Pinta de Verde el bloque superior derecho 6 x 6.
Pinta de Azul el bloque inferior izquierdo 6 x 6.
Pinta de Amarillo el bloque inferior derecho 6 x 6.
Deja el resto de casillas en blanco con un borde negro. Solo haz eso.
----
Perfecto. Ahora, crea una lista llamada RUTA_ROJA que contenga las coordenadas de las casillas por las que se mueve el jugador rojo. Escribe manualmente los índices de la matriz para las primeras 5 casillas.
----
Basándote en el código actual, vamos a colorear los pasillos interiores que llevan a la meta (el centro). Modifica el bucle de dibujado con estas reglas exactas de la matriz 15 x 15 (los índices van de 0 a 14):
* Pasillo Rojo (Izquierda): La fila central (Fila 7) desde la columna 1 hasta la columna 6 debe pintarse de Rojo.
* Pasillo Verde (Arriba): La columna central (Columna 7) desde la fila 1 hasta la fila 6 debe pintarse de Verde.
* Pasillo Amarillo (Derecha): La fila central (Fila 7) desde la columna 8 hasta la columna 13 debe pintarse de Amarillo.
* Pasillo Azul (Abajo): La columna central (Columna 7) desde la fila 8 hasta la fila 13 debe pintarse de Azul.
* Meta Central (Centro): El cuadrado central exacto (Fila 7, Columna 7) píntalo de color Gris Oscuro por ahora (será la meta común).
Mantén el resto de casillas de los pasillos en blanco con borde negro
----
Vamos a corregir las posiciones de los pasillos de meta de la matriz 15x15 porque están girados respecto al Parchís real. Modifica el renderizado con estos índices exactos (filas y columnas de 0 a 14):

1. El Pasillo Amarillo (salida abajo-derecha) debe estar en la COLUMNA 7, desde la FILA 8 hasta la FILA 13.
2. El Pasillo Azul (salida abajo-izquierda) debe estar en la FILA 7, desde la COLUMNA 1 hasta la COLUMNA 6.
3. El Pasillo Rojo (salida arriba-izquierda) debe estar en la COLUMNA 7, desde la FILA 1 hasta la FILA 6.
4. El Pasillo Verde (salida arriba-derecha) debe estar en la FILA 7, desde la COLUMNA 8 hasta la COLUMNA 13.
5. El centro (7,7) se mantiene Gris Oscuro.

Por favor, aplica solo estos cambios matemáticos de color en la matriz.
----
Nada, sigue siendo todo un desastre... te acabo de pasar el código de un parchís que desarrollé yo a mano en pygame, por favor a ver si eres capaz de trasponerlo a Phaser