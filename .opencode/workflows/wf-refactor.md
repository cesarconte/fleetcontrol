---
description: # Workflow: Refactoring — El Optimizador
---

Regla fundamental: el comportamiento externo no cambia.
La entrada y la salida son exactamente las mismas antes y después.
No se entrega código refactorizado sin explicar qué cambió y por qué.

---

## Antes de empezar

1. Confirmar que hay tests que cubren el comportamiento actual.
   Si no los hay, escribirlos primero. No refactorizar código sin red de seguridad.
2. Definir el alcance: ¿qué fichero(s) o función(es) se van a refactorizar?
3. Identificar qué objetivo persigue este refactor (ver dimensiones abajo).

---

## Dimensiones de mejora — aplicar todas las que sean relevantes

**1. Legibilidad**
- Mejorar nombres de variables, funciones y componentes.
- Extraer valores literales a constantes nombradas.
- Simplificar condicionales complejos (early returns, guard clauses).
- Reducir el nivel de anidamiento (máximo 3 niveles).

**2. Responsabilidad única**
- Dividir funciones que hacen más de una cosa.
- Extraer lógica de presentación de lógica de negocio.
- Separar ficheros que acumulan demasiadas responsabilidades (> 200–300 líneas).

**3. Eliminación de duplicación**
- Extraer lógica repetida a utilidades, hooks o servicios reutilizables.
- Unificar constantes duplicadas en un único punto de definición.

**4. Manejo de errores**
- Hacer todos los caminos de error explícitos y consistentes.
- Eliminar errores silenciosos (catch vacíos, promesas sin `.catch()`).

**5. Tipado (TypeScript)**
- Reemplazar cualquier `any` injustificado.
- Mejorar la inferencia de tipos donde sea posible.
- Añadir tipos de retorno explícitos donde falten.

**6. Testeabilidad**
- Extraer funciones puras de funciones con efectos secundarios.
- Hacer las dependencias inyectables en lugar de importarlas directamente.
- Eliminar efectos secundarios ocultos.

**7. Rendimiento (cuando sea claramente beneficioso)**
- Memoización justificada.
- Eliminación de computaciones redundantes en caminos calientes.
- Complejidad algorítmica: registrar si mejora (`Antes: O(n²) → Después: O(n log n)`).

---

## Restricciones sin excepción

- **No cambiar el comportamiento externo ni los contratos de API pública.**
- **No añadir features.** Si se descubre una mejora funcional, se documenta aparte.
- **Si se detecta un bug durante el refactor, no se corrige en silencio.**
  Se señala explícitamente y se trata como un cambio separado.

---

## Formato de entrega

### 1. Código refactorizado completo

Para cada bloque modificado, mostrar antes y después:

```
// ANTES
[código original]

// DESPUÉS
[código refactorizado]
```

### 2. Tabla de cambios

| Qué cambié | Por qué | Impacto esperado |
|------------|---------|------------------|
| ...        | ...     | ...              |

### 3. Complejidad algorítmica (si aplica)

`Antes: O(?) → Después: O(?)`

### 4. Dependencias o patrones nuevos (si aplica)

Si el refactor introduce una dependencia nueva o un patrón diferente al existente
en el proyecto, justificarlo explícitamente.

### 5. Tests

Confirmar que todos los tests existentes siguen pasando.
Si el refactor habilita tests nuevos más precisos, añadirlos.