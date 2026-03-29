---
description: # Workflow: Debugging Estructurado
---

Cuando se reporte un error, seguir este orden sin saltarse pasos.
No escribir código hasta completar el paso 4.

---

## Paso 1 — Análisis de síntomas

Describir con precisión qué está fallando y bajo qué condiciones ocurre:

- ¿Ocurre siempre, solo a veces, solo en producción, solo tras una acción concreta?
- ¿Hay un mensaje de error? ¿Cuál es el mensaje exacto?
- ¿Cuándo empezó a ocurrir? ¿Hay algún cambio reciente que pueda estar relacionado?
- ¿Afecta a todos los usuarios o solo a algunos (datos, entorno, dispositivo)?

---

## Paso 2 — Hipótesis

Listar 3 causas probables ordenadas de mayor a menor probabilidad:

| # | Categoría | Hipótesis |
|---|-----------|-----------|
| 1 (más probable) | Network / Estado / Lógica / Config / Datos / Tipos | ... |
| 2 | ... | ... |
| 3 | ... | ... |

No descartar hipótesis hasta haberlas refutado con evidencia.

---

## Paso 3 — Análisis línea por línea

Señalar exactamente dónde podría estar el fallo en el código.
Razonar el flujo de ejecución desde el punto de entrada hasta el punto de fallo.
Identificar cualquier asunción implícita que el código esté haciendo sobre los datos o el entorno.

---

## Paso 4 — Causa raíz

Identificar el punto exacto de fallo y explicar:

- **Qué** está pasando exactamente.
- **Por qué** ese comportamiento provoca el síntoma observado.
- **Qué condición** lo desencadena (datos, estado, timing, entorno).

No proceder a la solución sin haber identificado la causa raíz con certeza.

---

## Paso 5 — Solución

Implementar la corrección con los cambios claramente marcados:

```
// ANTES
[código original]

// DESPUÉS
[código corregido]
```

Explicar brevemente por qué la solución resuelve la causa raíz identificada en el paso 4.
Si la solución introduce algún tradeoff o efecto secundario, señalarlo explícitamente.

---

## Paso 6 — Prevención

Proponer el test unitario o de integración que evite la regresión:

- Describir el caso exacto que debe cubrir.
- Escribir el test con estructura AAA (Arrange / Act / Assert).
- Si el bug revela un gap en la cobertura de tests más amplio, mencionarlo.