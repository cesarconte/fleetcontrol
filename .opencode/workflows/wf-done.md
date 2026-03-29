---
description: # Workflow: Definition of Done — Checklist de Salida
---

Ninguna tarea se marca como completada sin pasar por este checklist al completo.
Cada punto es una pregunta real, no un trámite.

---

## Funcionalidad

- [ ] ¿Todo funciona según los requisitos definidos al inicio?
- [ ] ¿Se han probado manualmente los flujos principales y los casos límite?
- [ ] ¿Los cuatro estados del componente/feature están implementados?
      (cargando → vacío → error → poblado)
- [ ] ¿Las acciones destructivas tienen confirmación explícita?
- [ ] ¿El usuario recibe feedback de cada acción (éxito, error, cargando)?

---

## Calidad de código

- [ ] ¿Se cumplen todos los principios del AGENTS.md (DRY, KISS, SRP, Clean Code)?
- [ ] ¿Los ficheros y carpetas siguen la estructura acordada del proyecto?
- [ ] ¿Hay código muerto, variables sin usar o imports innecesarios?
- [ ] ¿Se han eliminado todos los `console.log` y comentarios temporales?
- [ ] ¿Se han resuelto o documentado todos los TODO/FIXME pendientes (con fecha y ticket)?
- [ ] ¿El tipado es 100% estricto? ¿Hay algún `any` injustificado?
- [ ] ¿Ningún fichero supera las 300 líneas sin propuesta de división?
- [ ] ¿El nivel de anidamiento máximo es 3?

---

## Testing

- [ ] ¿Los tests pasan al 100%?
- [ ] ¿Cubren los casos críticos: happy path + edge cases + errores?
- [ ] ¿Se han añadido tests para toda lógica de negocio nueva?
- [ ] ¿Los tests prueban comportamiento, no detalles de implementación?
- [ ] ¿Los nombres de los tests son descriptivos y en formato narrativo?

---

## Seguridad

- [ ] ¿Toda entrada de usuario está validada y sanitizada?
- [ ] ¿No hay credenciales, API keys ni secrets en el código?
- [ ] ¿Las dependencias están actualizadas y sin vulnerabilidades conocidas?
- [ ] ¿Los mensajes de error al usuario son genéricos (sin información técnica)?
- [ ] ¿Las variables de entorno nuevas están en `.env.example`?

---

## Rendimiento

- [ ] ¿Las imágenes usan el formato correcto (WebP/AVIF), tienen dimensiones
      explícitas y `loading="lazy"` donde corresponde?
- [ ] ¿Se ha aplicado code splitting en rutas o módulos pesados?
- [ ] ¿Hay re-renders o recomputaciones innecesarias que optimizar?
- [ ] ¿Los listados están paginados? ¿Ninguna colección se devuelve ilimitada?
- [ ] ¿Las optimizaciones de rendimiento críticas están aplicadas antes del despliegue?

---

## Accesibilidad

- [ ] ¿El HTML es semántico y la jerarquía de headings es correcta?
- [ ] ¿Todos los elementos interactivos son operables via teclado?
- [ ] ¿Los contrastes de color cumplen WCAG 2.1 AA (4.5:1 texto, 3:1 UI)?
- [ ] ¿Las imágenes tienen alt text apropiado?
- [ ] ¿Los formularios tienen labels visibles y mensajes de error accesibles?
- [ ] ¿Los modales atrapan el foco y lo devuelven al trigger al cerrarse?
- [ ] ¿Los estados dinámicos se anuncian a lectores de pantalla (aria-live)?

---

## Documentación y entrega

- [ ] ¿El README está actualizado con cualquier cambio relevante?
- [ ] ¿La documentación JSDoc/TSDoc está actualizada para funciones públicas modificadas?
- [ ] ¿El CHANGELOG refleja los cambios de esta versión (si aplica)?
- [ ] ¿El commit sigue el formato Conventional Commits?
- [ ] ¿El branch está listo para revisión (sin commits de WIP, sin merge conflicts)?

---

**Si algún punto no se puede marcar, la tarea no está terminada.**