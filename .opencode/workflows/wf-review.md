---
description: # Workflow: Code Review — El Crítico
---

Revisión estructurada como un tech lead senior revisando un PR real.
Directo. Específico. Sin elogios de relleno.
Por cada dimensión: **✅ Bien / ⚠️ Mejorable / ❌ Problema**.
Si hay problema o mejora, mostrar el código corregido.

---

## Dimensión 1 — Corrección y lógica

¿El código hace lo que se supone que debe hacer?

- Errores de lógica, condiciones incorrectas, off-by-one.
- Edge cases no contemplados: null, undefined, array vacío, valores extremos.
- Asunciones implícitas sobre los datos que pueden no cumplirse.
- Comportamiento en condiciones de error o fallo de red.

---

## Dimensión 2 — Seguridad

¿Hay vulnerabilidades?

- Inyección SQL/NoSQL (queries no parametrizadas).
- XSS (uso de innerHTML con datos no sanitizados, falta de CSP).
- CSRF (endpoints de mutación sin protección).
- Exposición de datos sensibles (en logs, respuestas de API, cliente).
- Credenciales o secrets en el código.
- Falta de validación o sanitización de inputs.
- Autenticación o autorización incorrecta o ausente.
- Headers de seguridad ausentes.

---

## Dimensión 3 — Rendimiento

¿Hay cuellos de botella?

- Queries N+1.
- Operaciones O(n²) en datasets potencialmente grandes.
- Re-renders innecesarios (referencias inestables, objetos/funciones inline en props/JSX).
- Computaciones costosas sin memoización en caminos calientes.
- Listas grandes sin virtualización.
- Carga de assets sin optimizar (imágenes, fonts, bundle).
- Llamadas a API redundantes o sin caché.
- Colecciones sin paginación.

---

## Dimensión 4 — Código limpio

¿Cumple los principios del proyecto?

- SRP: ¿cada función y componente hace una sola cosa?
- Nombres: ¿son descriptivos, sin abreviaciones, sin ambigüedad?
- Duplicación: ¿hay lógica repetida que deba extraerse?
- Anidamiento: ¿el nivel máximo es 3?
- Longitud: ¿hay funciones de más de 30 líneas o ficheros de más de 300?
- Código muerto: variables sin usar, imports innecesarios, console.logs.
- Tipado: ¿hay `any` injustificados, tipos ausentes, supresiones de error?
- Comentarios: ¿explican el por qué o simplemente describen el qué?

---

## Dimensión 5 — Arquitectura y patrones

¿La estructura es sólida?

- ¿Respeta la separación de capas del proyecto
  (rutas → controladores → servicios → modelos)?
- ¿Mezcla lógica de negocio con lógica de presentación?
- ¿Hay acoplamiento innecesario entre módulos?
- ¿Usa los patrones establecidos en el proyecto o introduce inconsistencia?
- ¿La abstracción es apropiada o está sobre/infra-ingeniada?
- ¿Es fácilmente testeable tal como está escrito?

---

## Dimensión 6 — Manejo de errores y UX

¿Los fallos están gestionados y comunicados?

- ¿Todos los caminos de error son explícitos? ¿Hay errores silenciosos?
- ¿El usuario recibe feedback de toda acción (cargando, éxito, error)?
- ¿Los mensajes de error son orientados a la solución y sin información técnica?
- ¿Las acciones destructivas tienen confirmación?
- ¿Los estados de carga, vacío y error están implementados?

---

## Dimensión 7 — Accesibilidad

¿La interfaz es accesible?

- ¿HTML semántico correcto? ¿Sin divitis interactivo?
- ¿Todos los elementos interactivos son operables por teclado?
- ¿ARIA correcto donde hace falta y ausente donde no?
- ¿Contraste de color correcto (4.5:1 texto, 3:1 UI)?
- ¿Formularios con labels, errores accesibles y campos requeridos marcados?
- ¿Modales con focus trap y devolución del foco al cerrar?

---

## Dimensión 8 — Tests

¿El código está bien cubierto?

- ¿Hay tests para la lógica nueva?
- ¿Cubren happy path, edge cases y errores?
- ¿Prueban comportamiento o detalles de implementación?
- ¿Los nombres son descriptivos?
- ¿Hay caminos críticos sin cobertura?

---

## Resultado del Code Review

**Puntuación global:** [X/10]

**Resumen:** [valoración en una línea]

**Hallazgos por severidad:**

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Bloqueante — debe corregirse antes del merge | ? |
| 🟠 Mayor — recomendación fuerte              | ? |
| 🟡 Menor — a tratar en seguimiento           | ? |
| 🟢 Sugerencia — mejora opcional              | ? |

**Los 3 cambios de mayor impacto** (si solo se pudieran cambiar 3 cosas):

1. ...
2. ...
3. ...