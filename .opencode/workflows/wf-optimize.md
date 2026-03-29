---
description: # Workflow: Optimización de Rendimiento
---

Antes de optimizar, medir. Antes de medir, identificar.
No se propone ninguna optimización sin datos que la justifiquen.

---

## Paso 1 — Medir el estado actual

Registrar métricas de referencia antes de tocar nada:

**Frontend:**
- Core Web Vitals reales o de laboratorio: LCP, INP, CLS, TTFB.
- Tamaño del bundle (total y por chunk).
- Número de requests en la carga inicial.
- Tiempo de carga en red lenta (throttling 3G simulado).

**Backend:**
- Tiempo de respuesta de los endpoints involucrados (p50, p95, p99).
- Tiempo de ejecución de queries relevantes.
- Uso de memoria y CPU bajo carga.

**Objetivos a alcanzar:**

| Métrica | Objetivo  | Estado actual |
|---------|-----------|---------------|
| LCP     | < 2.5s    | ?             |
| INP     | < 200ms   | ?             |
| CLS     | < 0.1     | ?             |
| TTFB    | < 600ms   | ?             |

---

## Paso 2 — Identificar cuellos de botella

Listar los problemas encontrados ordenados por impacto estimado:

| # | Área | Problema identificado | Impacto estimado |
|---|------|-----------------------|------------------|
| 1 | ... | ... | Alto / Medio / Bajo |
| 2 | ... | ... | ... |

**Áreas de análisis obligatorias:**

**Bundle y carga:**
- ¿Imports completos donde bastaría un import parcial?
- ¿Rutas/páginas sin lazy loading?
- ¿Imports síncronos que deberían ser dinámicos?
- ¿Algún chunk JS supera los 200KB gzipped?

**Renderizado (React / framework):**
- ¿Re-renders innecesarios por referencias inestables o funciones/objetos inline en JSX?
- ¿Computaciones costosas sin memoización?
- ¿Listas de más de 100 ítems sin virtualización?

**Red y fetching:**
- ¿Llamadas a API duplicadas o sin caché?
- ¿Peticiones secuenciales donde podrían ser paralelas?
- ¿Overfetching (campos innecesarios en la respuesta)?

**Assets:**
- ¿Imágenes en formato no moderno (sin WebP/AVIF)?
- ¿Imágenes sin dimensiones explícitas (causa CLS)?
- ¿Imágenes below-the-fold sin `loading="lazy"`?
- ¿Imagen LCP sin `<link rel="preload">`?
- ¿Fuentes sin `font-display: swap`?
- ¿Assets estáticos sin cache headers de larga duración?

**CSS y animaciones:**
- ¿Patrones de layout thrashing (lecturas y escrituras del DOM intercaladas)?
- ¿Animaciones en propiedades no composited (que no sean `transform`/`opacity`)?
- ¿CSS en producción sin purgar?

**Backend:**
- ¿Queries N+1?
- ¿Índices de base de datos ausentes en columnas usadas para filtrar u ordenar?
- ¿Operaciones costosas repetidas sin caché?
- ¿Colecciones sin paginación?
- ¿Respuestas sin compresión gzip/brotli?

---

## Paso 3 — Proponer mejoras

Para cada cuello de botella identificado, proponer:

- La solución concreta con código de ejemplo si aplica.
- La mejora esperada en términos medibles.
- El esfuerzo de implementación estimado.
- Cualquier tradeoff o riesgo que introduzca el cambio.

---

## Paso 4 — Implementar

- Aplicar los cambios de uno en uno, en orden de impacto (mayor primero).
- No acumular múltiples optimizaciones en un solo cambio.
- Hacer commit atómico por cada optimización aplicada.

---

## Paso 5 — Medir el después

Comparar con las métricas de referencia del paso 1.

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| LCP     | ?     | ?       | ?      |
| INP     | ?     | ?       | ?      |
| CLS     | ?     | ?       | ?      |
| Bundle  | ?     | ?       | ?      |

Si la mejora no es significativa o el cambio introduce regresiones,
revertir y reevaluar la hipótesis.