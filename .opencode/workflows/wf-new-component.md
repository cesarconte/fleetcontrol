---
description: Workflow — Nuevo Componente Vue
---

Genera un componente Vue 3 completo y listo para producción para este stack
(FleetControl: Vue 3, Vuetify 4, Supabase). No saltarse ningún paso.

---

## Paso 1 — Clarificar antes de construir

Si la petición es ambigua, hacer UNA pregunta concreta antes de proceder.

Preguntas clave:
- ¿Es un componente de presentación puro o necesita comunicarse con stores/Supabase?
- ¿Qué props recibe? ¿Qué eventos emite?
- ¿Forma parte de un formulario, una lista, un diálogo?
- ¿Tiene estados de carga o error propios o los hereda del padre?

---

## Paso 2 — Definir el contrato del componente

```javascript
// Props (con tipos JSDoc)
/**
 * @prop {string} vehicleId - ID del vehículo a mostrar (requerido)
 * @prop {boolean} [compact=false] - modo compacto para listas densas
 * @prop {('primary'|'secondary')} [variant='primary'] - variante visual
 */

// Emits
/**
 * @emits select - cuando el usuario selecciona el elemento { id, data }
 * @emits delete - cuando se confirma el borrado { id }
 */
```

---

## Paso 3 — Implementar los cuatro estados sin excepción

**Cargando:** Skeleton loader de Vuetify (`VSkeletonLoader`) con la forma del contenido final.

**Vacío:** Estado descriptivo con icono MDI, título explicativo y, si aplica, una acción para salir del estado vacío.

**Error:** Mensaje orientado a la solución (no técnico), con botón de reintento si la operación es repetible.

**Poblado:** El estado principal con los datos renderizados.

---

## Paso 4 — Accesibilidad integrada

- HTML semántico correcto. Vuetify ya provee base; completar lo que falte.
- ARIA solo donde la semántica nativa no es suficiente.
- Si el componente es interactivo: verificar navegación por teclado.
- Si hay iconos como botones standalone: `aria-label`.
- `data-testid` en todos los elementos interactivos.

---

## Paso 5 — Comportamiento responsive (mobile-first)

El componente debe funcionar correctamente en:
- 320px (mobile pequeño)
- 375px (mobile estándar)
- 768px (tablet)
- 1024px+ (desktop)

Usar el sistema de grid de Vuetify (`VContainer > VRow > VCol`) o las clases de utilidad.

---

## Paso 6 — Integración con el stack

Si el componente necesita datos:
- Consumir desde la store correspondiente o composable.
- El componente no sabe de dónde vienen los datos, solo los consume.

Si el componente tiene formulario:
- Usar `VForm` con `ref` y validación via `:rules`.
- Reglas de validación definidas fuera del template como constantes.
- Errores de servidor mapeados a `error-messages` de los campos correspondientes.

---

## Paso 7 — Tests del componente (TDD)

Generar el archivo de test junto al componente. Vitest + Vue Test Utils.

Cubrir obligatoriamente:
- Renderiza correctamente con props mínimas (happy path).
- Estado de carga visible cuando `isLoading` es true.
- Estado de error visible con mensaje correcto.
- Estado vacío visible cuando `items` está vacío.
- Eventos emitidos correctamente al interactuar.
- Navegación por teclado en elementos interactivos.

```javascript
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ComponentName from './ComponentName.vue'

describe('ComponentName', () => {
  const defaultProps = { /* props mínimas para renderizar */ }

  it('debería renderizarse correctamente con props válidas', () => { })
  it('debería mostrar el skeleton loader cuando isLoading es true', () => { })
  it('debería mostrar el estado vacío cuando no hay items', () => { })
  it('debería mostrar el mensaje de error cuando error tiene valor', () => { })
  it('debería emitir el evento "select" al hacer click en un elemento', async () => { })
})
```

---

## Entrega

Archivos a generar:
1. `src/components/[ComponentName].vue`
2. `src/components/[ComponentName].spec.js`

Si el componente requiere un composable: `src/composables/use-[name].js`

Formato: archivos completos + nota sobre decisiones de diseño no obvias.
