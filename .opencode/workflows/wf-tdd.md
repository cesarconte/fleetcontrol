---
description: # Workflow: TDD — Test-Driven Development
---

El código de producción no se escribe antes de que exista al menos un test fallando.
Este orden no es opcional.

---

## Paso 1 — Define

Antes de escribir ningún test ni código, responder estas preguntas:

- ¿Qué debe hacer exactamente esta funcionalidad en términos observables y medibles?
- ¿Cuáles son los inputs posibles y sus rangos válidos?
- ¿Cuáles son los outputs esperados para cada input?
- ¿Qué efectos secundarios tiene (si los tiene)?
- ¿Qué dependencias externas tiene (APIs, base de datos, tiempo, etc.)?

Documentar la respuesta en forma de contrato antes de continuar.

---

## Paso 2 — Tests primero

Escribir los tests que definirán el comportamiento **antes** del código de producción.
Estructurarlos en tres grupos:

### Happy path (mínimo 2 tests)
Los casos donde todo funciona como se espera con inputs válidos y representativos.

### Edge cases (mínimo 3 tests)
Los límites y casos especiales:
- Valores vacíos, null, undefined.
- Valores en el límite del rango válido (mínimo, máximo).
- Colecciones vacías.
- Strings vacíos o con solo espacios.
- Números negativos o cero si aplica.

### Gestión de errores (mínimo 2 tests)
Los fallos controlados:
- ¿Qué pasa cuando una dependencia externa falla?
- ¿Qué pasa cuando el input es inválido?
- ¿Se lanza la excepción correcta con el mensaje correcto?

**Formato obligatorio para cada test:**

```
describe('[Nombre del módulo/función]', () => {
  it('debería [comportamiento esperado] cuando [condición]', () => {
    // Arrange
    [preparar datos y mocks]

    // Act
    [ejecutar la función]

    // Assert
    [verificar el resultado]
  })
})
```

Los tests deben fallar en este punto. Si pasan sin código, el test no está probando nada.

---

## Paso 3 — Implementa

Escribe el código mínimo necesario para que los tests pasen.

- Solo el código que hace pasar los tests. Nada más.
- Sin optimizaciones prematuras.
- Sin generalizar antes de que haya casos que lo requieran.

Ejecutar los tests después de cada pequeño cambio.

---

## Paso 4 — Refactoriza

Con los tests en verde, mejorar el código sin romper ningún test:

- Aplicar los principios de código limpio (SRP, DRY, naming).
- Extraer lógica reutilizable.
- Mejorar legibilidad y estructura.
- Optimizar si hay una razón medible para hacerlo.

Ejecutar los tests después de cada cambio de refactoring.
Si algún test rompe, el refactoring ha cambiado el comportamiento — revisar.

---

## Notas

- Las dependencias externas se mockean siempre en tests unitarios.
- Si el test es difícil de escribir, es una señal de que el diseño tiene un problema.
  Revisar el contrato definido en el paso 1 antes de forzar el test.
- Los tests de integración y E2E se añaden después de los unitarios, no en su lugar.