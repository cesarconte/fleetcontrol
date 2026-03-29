# PRD — FleetControl
## Documento de Requisitos de Producto

**Versión:** 2.0
**Fecha:** 2026-03-29
**Estado:** Borrador actualizado
**Propietario del producto:** [Nombre del responsable]

---

## 1. Resumen Ejecutivo

**FleetControl** es una aplicación web de gestión integral de flotas de transporte de mercancías por carretera, diseñada para empresas españolas sujetas a la normativa vigente del Ministerio de Transportes, la DGT, la Agencia Tributaria y la legislación de la Unión Europea aplicable.

La aplicación centraliza en una única plataforma toda la información operativa, legal y logística de la flota: vehículos, conductores, rutas, mantenimiento, **tacógrafos**, **documentación de transporte** y cumplimiento normativo. El objetivo es eliminar la dispersión de información entre hojas de cálculo, carpetas físicas y herramientas no integradas, y dar a los gestores de flota visibilidad completa y en tiempo real sobre el estado de su operación.

**Problema que resuelve:**
Los gestores de flotas medianas y grandes en España operan con información fragmentada, lo que provoca: vencimientos de documentación no detectados a tiempo (ITV, seguros, tarjetas de transporte, tacógrafos), planificación de rutas ineficiente, dificultad para demostrar cumplimiento normativo ante inspecciones, y pérdida de tiempo en tareas administrativas repetitivas.

---

## 2. Usuarios Objetivo

### 2.1 Perfiles de usuario

**Administrador / Gestor de flota** *(usuario primario)*
- Gestiona toda la flota desde oficina.
- Necesita visión global del estado operativo, alertas de vencimientos y capacidad de planificación.
- Acceso completo a todas las secciones.

**Jefe de tráfico / Coordinador de rutas**
- Asigna conductores a rutas, gestiona la planificación diaria.
- Necesita el mapa en tiempo real y la gestión de rutas.
- Acceso a: rutas, conductores, mapa en vivo, planificación.

**Agente de tráfico**
- Gestiona la asignación operativa diaria: carga/descarga, rutas, documentación.
- Necesita acceso rápido a estado de vehículos, conductores disponibles y documentación.
- Acceso a: rutas, cargas, vehículos, documentación, alertas.

**Técnico de mantenimiento**
- Registra revisiones, incidencias mecánicas y programas de mantenimiento preventivo.
- Acceso a: mantenimiento, ficha de vehículo, historial de intervenciones.

**Conductor** *(acceso reducido, futuro)*
- Consulta sus rutas asignadas, documentos propios, horas disponibles.
- Acceso de solo lectura a su perfil, rutas asignadas y documentación propia.

---

## 3. Alcance — Versión 1.0

### 3.1 Dentro del alcance (MVP)

- Dashboard principal con KPIs operativos en tiempo real.
- Gestión completa de vehículos (cabinas y remolques).
- Gestión de conductores y su documentación.
- Control de rutas: activas, historial y planificación.
- Gestión de mantenimiento preventivo y correctivo.
- Control documental con alertas de vencimiento.
- Mapa de flota en tiempo real (integración con GPS/telemática).
- Módulo de cargas/mercancías.
- Sistema de alertas y notificaciones.
- Informes exportables.
- Gestión de combustible.
- Módulo de tacógrafos (descarga DDD, análisis conducción/descanso, infracciones).
- Gestión documental centralizada (ITV, seguros, CAP, ADR, tacógrafo).
- Generación de documentos de transporte (Carta de Porte CMR, nacional, albarán, hoja de ruta, factura, POD, ADR, etc.).

### 3.2 Fuera del alcance (versiones futuras)

- App móvil nativa para conductores.
- Integración con sistemas de facturación / ERP.
- Módulo de gestión de clientes (CRM).
- Optimización automática de rutas con IA.
- Portal de acceso para clientes finales.
- Módulo de análisis avanzado (CPM, TCO, scoring, huella de carbono).

---

## 4. Módulos Funcionales

---

### 4.1 Dashboard Principal

**Descripción:** Vista central de mando con el estado operativo de la flota en tiempo real.

**KPIs obligatorios:**
- Camiones totales en flota (con delta vs. mes anterior).
- Camiones en ruta ahora (con delta vs. ayer).
- Conductores activos (sobre total disponibles).
- Unidades en mantenimiento (con indicador de urgentes).
- Rutas completadas hoy (con % vs. ayer).
- Alertas activas (documentación vencida o próxima a vencer).
- Violaciones de tacógrafo pendientes.

**Mapa de flota en tiempo real:**
- Visualización de todos los vehículos activos sobre mapa de España/Europa.
- Filtros: Todos / En Ruta / En Mantenimiento / Alertas.
- Marcadores diferenciados por estado del vehículo.
- Trazado de ruta activa por vehículo al hacer clic.
- Actualización automática (intervalo configurable, mínimo cada 60 segundos).

**Criterios de aceptación:**
- El dashboard carga en menos de 3 segundos con flota de hasta 500 vehículos.
- Los KPIs se actualizan sin necesidad de recargar la página.
- El mapa es funcional en pantallas desde 320px de ancho.

---

### 4.2 Gestión de Vehículos

#### 4.2.1 Ficha de Vehículo — Datos obligatorios

**Identificación:**
- Matrícula española (formato actual: 0000-XXX o antiguo formato provincial).
- Número de bastidor/VIN (17 caracteres, estándar ISO 3779).
- Número de Tarjeta de Transporte (MDL — Mercancías en régimen de carga completa, MDL/MDC según corresponda).
- Marca y modelo.
- Variante/versión.
- Color.
- Año de fabricación.
- Fecha de primera matriculación.
- Distintivo Ambiental DGT (0, Eco, C, B, A — conforme a la clasificación DGT vigente).
- Etiqueta de emisiones Euro (I a VI-D, conforme Directiva 2005/55/CE y Reglamento CE 595/2009).

**Masas y Dimensiones** *(conforme Real Decreto 2822/1998 y Reglamento UE 1230/2012)*:
- MMA del vehículo (kg).
- Tara (masa en vacío) (kg).
- MMA del conjunto (tractor + semirremolque) (kg) — máximo legal: 44.000 kg en combinaciones especiales autorizadas; 40.000 kg estándar.
- Carga útil máxima (kg).
- Anchura máxima (m) — máximo legal: 2,55 m; 2,60 m para vehículos con paredes isotermas.
- Altura máxima (m) — máximo legal: 4,00 m.
- Número de ejes.
- Longitud total (m) — máximo legal conjunto articulado: 16,50 m.

**Motor y Emisiones:**
- Tipo de combustible (Diésel, GNC, GNL, Hidrógeno, Eléctrico, Híbrido).
- Cilindrada (cc).
- Potencia máxima (CV / kW).
- Par motor máximo (Nm).
- Caja de cambios (manual/automática y modelo).
- Velocidad máxima autorizada (km/h) — limitada a 90 km/h en España para vehículos > 3.500 kg (DGT).
- Norma de emisiones Euro (vinculado al campo anterior).
- Consumo medio homologado (l/100km o kg/100km según combustible).
- Combustible/aditivo (AdBlue si aplica).

**Tipo de vehículo:**
- Tractora / Vehículo rígido / Semirremolque / Remolque / Portacoches / Cisterna / Frigorífico / Basculante / Lona / Caja cerrada / Especial.
- Si es tractora: matrícula del semirremolque habitualmente asociado.
- Si es semirremolque: tipo de enganche (quinta rueda), longitud de caja, volumen de carga (m³).

#### 4.2.2 Control Documental del Vehículo

Cada documento tiene: estado actual, fecha de vencimiento, alerta configurable (X días antes), histórico de renovaciones y campo para adjuntar PDF/imagen.

**Documentos obligatorios por ley española/UE:**

| Documento | Base Legal | Periodicidad / Notas |
|---|---|---|
| ITV (Inspección Técnica de Vehículos) | RD 2042/1994 | Anual para vehículos > 3.500 kg en servicio público |
| Seguro de Responsabilidad Civil Obligatoria | RDL 8/2004 + Ley 5/2025 | Anual — mínimo cobertura vigente |
| Tarjeta de Transporte (MDL/MDC) | LOTT — Ley 16/1987 | Cada 5 años — renovación obligatoria |
| Calibración Tacógrafo Digital | Reglamento UE 165/2014 | Cada 2 años o tras intervención |
| Permiso de Circulación | DGT | Sin vencimiento ordinario — baja voluntaria |
| Certificado ADR (si procede) | ADR 2025 — RD 97/2014 | Anual para vehículos que transportan mercancías peligrosas |
| Autorización transporte especial (si procede) | RD 1837/2009 | Por expedición o periódica según tipo |
| Revisión de limitador de velocidad | Directiva 92/6/CEE | Vinculado a ITV |

**Estados de documento:**
- `En regla` — vence en más de 30 días.
- `Próximo a vencer` — vence en 30 días o menos (configurable).
- `Crítico` — vence en 7 días o menos.
- `Vencido` — fecha de vencimiento superada.
- `No aplica` — el vehículo no requiere este documento.

#### 4.2.3 Estado en Tiempo Real

*Requiere integración con dispositivo GPS/telemática instalado en el vehículo.*

- Velocidad actual (km/h).
- Posición GPS (latitud/longitud → mostrar en mapa + dirección aproximada).
- Temperatura del motor (°C).
- Nivel de combustible (%).
- Estado del conductor (en conducción / en pausa / en descanso / sin actividad).
- Odómetro actual (km).
- Tiempo de conducción acumulado del día (vinculado a tacógrafo).

#### 4.2.4 Estadísticas del Vehículo

- Odómetro total (km).
- Km este mes / año.
- Rutas completadas (total / mes / año).
- Consumo medio real (l/100km) — calculado sobre datos reales de repostaje.
- Tiempo medio por ruta.

---

### 4.3 Gestión de Conductores

**Datos del conductor:**
- Nombre completo, NIF/NIE.
- Fecha de nacimiento, nacionalidad.
- Dirección, teléfono, email.
- Foto de perfil.
- Fecha de incorporación a la empresa.
- Estado: Activo / Baja temporal / Baja definitiva.

**Documentación del conductor:**

| Documento | Base Legal | Notas |
|---|---|---|
| Carné de conducir (clase C, CE) | RDL 6/2015 | Fecha de expedición y vencimiento por categoría |
| CAP (Certificado de Aptitud Profesional) | RD 1032/2007 / Directiva 2003/59/CE | Renovación cada 5 años — 35 h formación |
| Tarjeta de conductor (tacógrafo digital) | Reglamento UE 165/2014 | Validez 5 años |
| Reconocimiento médico | RD 818/2009 | Periodicidad según edad: >45 años cada 2 años |
| Certificado ADR (si procede) | ADR 2025 + RD 97/2014 | Para conductores que transportan mercancías peligrosas — validez 5 años |

**Control de tiempos de conducción** *(Reglamento CE 561/2006)*:
- Tiempo de conducción diario (máximo: 9 horas; excepcionalmente 10 horas, máximo 2 veces por semana).
- Tiempo de conducción semanal (máximo: 56 horas).
- Tiempo de conducción en dos semanas consecutivas (máximo: 90 horas).
- Descanso diario mínimo: 11 horas consecutivas (o 9 horas reducido, máximo 3 veces entre descansos semanales).
- Descanso semanal mínimo: 45 horas (o 24 horas reducido, con compensación).
- Visualización de semáforo: verde / ámbar (>80% del límite) / rojo (límite alcanzado).

**Historial de infracciones y sanciones** (si aplica):
- Fecha, tipo de infracción, expediente, importe, estado (pendiente/pagado/recurrido).

---

### 4.4 Gestión de Rutas

#### 4.4.1 Rutas Activas

- Listado en tiempo real de todas las rutas en curso.
- Por cada ruta: vehículo, conductor, origen, destino, distancia total (km), distancia recorrida, ETA, carga transportada, estado.
- Vista en mapa con trazado de ruta y posición actual del vehículo.
- Posibilidad de contactar al conductor (teléfono / mensaje interno).

#### 4.4.2 Historial de Rutas

Campos por ruta:
- Fecha y hora de salida / llegada.
- Origen y destino (municipio, provincia, país).
- Distancia real recorrida (km).
- Duración real.
- Vehículo y conductor asignados.
- Tipo y peso de carga (kg) — no superar MMA del conjunto.
- Consumo real de combustible (L o kg).
- Coste total de la ruta (combustible + peajes) (€).
- Resultado: Completada / Retrasada (minutos) / Incidencia / Cancelada.
- Observaciones.
- Vinculación con albarán/CMR (Carta de Porte Internacional — Convenio CMR).

#### 4.4.3 Planificación de Rutas

- Creación de rutas futuras con asignación de vehículo, conductor, fecha/hora salida, origen, destino y carga prevista.
- Validación automática antes de confirmar:
  - ¿El conductor tiene horas disponibles según el Reglamento CE 561/2006?
  - ¿El vehículo tiene documentación en regla?
  - ¿El peso de la carga supera la carga útil del vehículo?
  - ¿El vehículo está disponible (no en mantenimiento)?
- Vista de calendario semanal y mensual.
- Exportación de hoja de ruta en PDF (con datos del vehículo, conductor, carga, origen/destino, instrucciones).

---

### 4.5 Mantenimiento

#### 4.5.1 Mantenimiento Preventivo

Plan de mantenimiento por vehículo basado en km o tiempo (lo que ocurra antes):

| Tipo de revisión | Intervalo orientativo |
|---|---|
| Cambio de aceite y filtros | Cada 40.000-60.000 km (según fabricante) |
| Revisión de frenos | Cada 60.000 km o anualmente |
| Revisión completa | Cada 100.000 km o anualmente |
| Revisión neumáticos | Cada 6 meses o según desgaste |
| Revisión sistema AdBlue | Cada 50.000 km |
| Revisión tacógrafo | Cada 2 años (obligatorio por ley) |
| Inspección correas y distribución | Según fabricante |

Para cada revisión programada: km o fecha previstos, taller asignado (si aplica), estado (Pendiente / En curso / Completada), coste real (€).

#### 4.5.2 Mantenimiento Correctivo

Registro de averías e incidencias:
- Fecha y km al momento de la incidencia.
- Descripción del problema.
- Diagnóstico.
- Intervención realizada.
- Recambios utilizados (con referencia y coste).
- Taller y responsable.
- Tiempo de inmovilización del vehículo (horas/días).
- Coste total (€).
- Estado: Abierto / En reparación / Cerrado.

#### 4.5.3 Próximas Revisiones

- Lista de las próximas revisiones de toda la flota, ordenadas por urgencia.
- Alerta cuando un vehículo está a menos de 5.000 km o 30 días de una revisión programada.

---

### 4.6 Gestión de Cargas

- Registro de cargas/mercancías por ruta: descripción, peso (kg), volumen (m³), tipo (general / frigorífica / peligrosa / especial).
- Mercancías peligrosas: clase ADR, número ONU, grupo de embalaje.
- Validación automática de peso vs. MMA del conjunto.
- Validación de peso por eje (RD 551/2020).
- Vinculación con la ruta correspondiente.
- CMR digital (campos del Convenio de Transporte Internacional de Mercancías por Carretera).

---

### 4.7 Combustible

- Registro de repostajes: fecha, vehículo, km en el momento, litros/kg, precio/litro, importe total, estación de servicio.
- Cálculo automático del consumo real (l/100km) entre repostajes.
- Cálculo de emisiones CO2 por repostaje.
- Comparativa consumo real vs. consumo homologado.
- Gráfico de evolución del consumo por vehículo y por flota.
- Alertas de consumo anómalo (desviación > X% sobre media del vehículo).

---

### 4.8 Alertas y Notificaciones

**Tipos de alerta:**
- Documentación del vehículo próxima a vencer o vencida.
- Documentación del conductor próxima a vencer o vencida.
- Conductor próximo al límite de horas de conducción.
- Vehículo próximo a revisión de mantenimiento.
- Consumo de combustible anómalo.
- Vehículo detenido más de X tiempo sin justificación (configurable).
- Velocidad superior al límite legal (90 km/h para vehículos > 3.500 kg).
- Descarga de tacógrafo pendiente.
- Infracciones de conducción detectadas.

**Canales:**
- Notificación en la aplicación (badge en el icono de alertas).
- Email (configurable por tipo de alerta y por usuario).
- SMS (opcional, fase 2).

**Configuración:**
- El administrador puede definir con cuántos días de antelación se activa cada tipo de alerta.
- Posibilidad de silenciar alertas individuales con justificación registrada.

---

### 4.9 Informes

Todos los informes son exportables en PDF y CSV.

- **Informe de flota:** estado general de todos los vehículos, documentación, km acumulados.
- **Informe de conductores:** horas conducidas, rutas completadas, estado del CAP y demás documentación.
- **Informe de rutas:** rutas completadas en un período, km totales, tiempos medios, retrasos.
- **Informe de mantenimiento:** costes, intervenciones por vehículo, tiempo de inmovilización.
- **Informe de combustible:** consumo por vehículo, gasto total (€), comparativa entre vehículos.
- **Informe de cumplimiento normativo:** resumen de documentación en regla / vencida por vehículo y conductor.
- **Informe de tacógrafos:** descargas realizadas, infracciones, horas de conducción por conductor.

---

### 4.10 Configuración

- Gestión de usuarios y roles (Administrador, Jefe de tráfico, Técnico, Solo lectura).
- Configuración de umbrales de alerta (días de antelación por tipo de documento).
- Integración con dispositivos GPS/telemática (API key, proveedor: Webfleet, Frotcom, Geotab u otros via API REST).
- Datos de la empresa (razón social, CIF, dirección, número de autorización de transporte).
- Personalización de la aplicación (logo de la empresa).
- Gestión de plantillas de documentos de transporte.

---

## 5. Requisitos No Funcionales

### 5.1 Rendimiento
- El dashboard principal carga en < 3 segundos con hasta 500 vehículos.
- Las páginas de listado paginan a 25/50/100 elementos por página.
- Las actualizaciones del mapa en tiempo real tienen latencia máxima de 60 segundos.

### 5.2 Disponibilidad
- Disponibilidad objetivo: 99,5% mensual (SLA).
- Mantenimiento programado: fuera de horario laboral (lunes a viernes 07:00-20:00).

### 5.3 Seguridad
- Autenticación con email + contraseña y 2FA opcional (TOTP).
- Roles y permisos granulares por sección.
- Todas las comunicaciones sobre HTTPS (TLS 1.3).
- Los documentos adjuntos se almacenan en almacenamiento seguro con acceso firmado (tiempo limitado).
- Cumplimiento del Reglamento General de Protección de Datos (RGPD / Reglamento UE 2016/679) y la LOPDGDD (Ley Orgánica 3/2018).
- Registro de auditoría de acciones sensibles (quién hizo qué y cuándo).

### 5.4 Compatibilidad
- Navegadores: Chrome 120+, Firefox 120+, Edge 120+, Safari 17+.
- Enfoque: Mobile-first responsive (Vuetify 4 breakpoints).
- Optimizado para: tablets (uso en campo), desktop (oficina), móviles (consulta rápida).
- No se requiere app móvil nativa en v1.0.

### 5.5 Legislación y Normativa aplicable
- Real Decreto 2822/1998 — Reglamento General de Vehículos.
- Orden PJC/780/2025 — Masas y dimensiones (44t eco).
- Real Decreto 2042/1994 — ITV.
- Ley 16/1987 (LOTT) y RD 1211/1990 — Ordenación de transportes terrestres.
- Ley 9/2013 — Liberalización, subcontratación.
- Ley 9/2025 — Movilidad Sostenible (Documento Control Digital obligatorio 05/10/2026).
- RD 242/2022 — Documentación digital y e-CMR.
- Ley 15/2009 (LCTTM) — Contrato de transporte terrestre de mercancías.
- Reglamento CE 561/2006 — Tiempos de conducción y descanso.
- RD 284/2021 — Transposición española CE 561/2006.
- RD 1561/1995 — Jornada de trabajo en transporte por carretera.
- Reglamento UE 165/2014 — Tacógrafos.
- Reg. Delegado UE 2021/1228 — Smart Tachograph v2 (G2V2).
- Directiva 2003/59/CE y RD 1032/2007 — CAP conductores.
- ADR 2025 — Transporte de mercancías peligrosas por carretera.
- RD 97/2014 — Transposición ADR en España.
- Reglamento UE 1230/2012 — Masas y dimensiones.
- Convenio CMR — Carta de Porte Internacional.
- ATP + RD 635/1984 — Transporte perecedero.
- RGPD (Reglamento UE 2016/679) + LOPDGDD (LO 3/2018).
- RDL 8/2004 + Ley 5/2025 — Seguro obligatorio vehículos.
- Ley 18/2022 (Crea y Crece) — Facturación electrónica.
- Ley 18/2021 (TRLGSV) — Tráfico, circulación y seguridad vial.
- RD 1052/2022 — Zonas de Bajas Emisiones.
- Reg. CE 1072/2009 + Reg. UE 2020/1055 — Cabotaje.

---

## 6. Diseño y Sistema Visual

### 6.1 Filosofía de diseño

La interfaz sigue los principios de **Material Design 3 (Google)** con enfoque **mobile-first**: se diseña primero para pantallas pequeñas y escala hacia arriba.

**Principios:**
- Mínimo número de colores necesarios. Cada color tiene significado funcional.
- Adaptación completa a cualquier tamaño de pantalla.
- Prioridad: claridad de información y mínima carga cognitiva.

### 6.2 Paleta de colores funcional

| Color | Rol | Uso |
|---|---|---|
| `#121212` / `#1E1E1E` | Surface / Background | Fondo principal (tema oscuro) |
| `#2C2C2C` / `#3A3A3A` | Surface variant | Tarjetas, sidebar, paneles |
| `#FFFFFF` / `#E0E0E0` | On-surface | Texto principal y secundario |
| `#F57C00` (Material Orange 700) | Primary / Brand | Identidad, acciones primarias, logo, botones CTA |
| `#4CAF50` (Material Green 500) | Success / Activo | En ruta, en regla, operativo |
| `#F44336` (Material Red 500) | Error / Crítico | Vencido, avería crítica, alerta urgente |
| `#FFC107` (Material Amber 500) | Warning / Atención | Próximo a vencer, retraso, consumo anómalo |
| `#2196F3` (Material Blue 500) | Info / Neutro | Métricas informativas, en pausa, planificado |

**Regla de uso:** el color solo aparece en datos de estado, KPIs y alertas. Los contenedores, fondos y textos son siempre neutros (grises y blancos sobre oscuro).

### 6.3 Tipografía

- **Familia:** Roboto (Google Fonts) — fuente base de Material Design.
- **Jerarquía:**
  - Títulos de sección: Roboto Medium 20px.
  - KPIs / números grandes: Roboto Bold 36-48px (desktop) / 32px (móvil).
  - Etiquetas de campo: Roboto Regular 12px, mayúsculas, letter-spacing 0.1em.
  - Texto de cuerpo: Roboto Regular 14px.
  - Texto secundario / metadatos: Roboto Regular 12px, opacidad 60%.

### 6.4 Componentes clave

**Sidebar (v-navigation-drawer):**
- Desktop (lg+): permanent, 220px.
- Tablet (md): temporary, overlay con scrim.
- Móvil (xs/sm): temporary, overlay con scrim.
- Accesible siempre desde menú hamburguesa en top bar.
- Agrupado en secciones: PRINCIPAL / FLOTA / RUTAS / GESTIÓN / DOCUMENTACIÓN / INFORMES.
- Ítem activo: fondo naranja (primary), texto blanco, icono blanco.
- Ítem inactivo: texto blanco al 60%, sin fondo.
- Badges numéricos para alertas y rutas activas.
- Perfil de usuario en la parte inferior.

**Tarjetas de KPI (Dashboard):**
- Desktop: 4 columnas. Tablet: 2 columnas. Móvil: apiladas verticalmente.
- Fondo `#2C2C2C`, borde inferior de 2px en el color funcional.
- Etiqueta en mayúsculas (12px), número grande (48px desktop / 32px móvil) en color funcional.
- Icono representativo en esquina superior derecha, opacidad 20%.

**Tablas de datos:**
- Desktop: tabla completa con todas las columnas.
- Tablet: tabla simplificada (columnas esenciales).
- Móvil: vista de cards (una card por fila, campos clave visibles).

**Formularios:**
- Móvil: una columna, inputs a ancho completo.
- Tablet: 2 columnas donde lógico (ej: ciudad + código postal).
- Desktop: multi-columna, campos agrupados.

**Páginas de detalle:**
- Móvil: una columna, secciones colapsables (expansion panels).
- Tablet/Desktop: multi-columna con sidebar de información.

**Ficha de vehículo:**
- Cabecera con matrícula, modelo, ruta actual, estado y acciones rápidas.
- Banda de alertas críticas al inicio (fondo rojo oscuro para vencimientos críticos).
- Secciones colapsables: Identificación, Masas y Dimensiones, Motor y Emisiones, Documentación, Últimas Rutas, Estado en Tiempo Real, Conductor Asignado, Mantenimiento, Estadísticas.
- Tabla de documentos con columna de estado visual (chip de color + texto).

**Estados de feedback:**
- Carga: skeletons (`v-skeleton-loader`) para listas y cards.
- Vacío: ilustración + mensaje + botón de acción.
- Error: mensaje claro + botón de reintentar.

**Acciones destructivas:**
- Modal de confirmación con botones explícitos "Eliminar / Cancelar".

**Notificaciones toast:**
- Éxito: verde, auto-dismiss 3s.
- Error: rojo, persistente hasta que el usuario la cierre.
- Posición: esquina inferior derecha.

**Targets táctiles:**
- Mínimo 44x44px para todos los elementos interactivos.

---

## 7. Criterios de Aceptación Globales

- [ ] Un gestor puede ver el estado completo de toda la flota en menos de 30 segundos desde que entra al dashboard.
- [ ] El sistema alerta automáticamente antes de que venza cualquier documento de vehículo o conductor.
- [ ] No es posible planificar una ruta con un conductor que supere los límites del Reglamento CE 561/2006.
- [ ] No es posible planificar una ruta con una carga que supere la MMA del vehículo asignado.
- [ ] Todos los documentos adjuntos son accesibles directamente desde la ficha del vehículo o del conductor.
- [ ] Los informes se generan y descargan en menos de 10 segundos para períodos de hasta 1 año.
- [ ] La aplicación funciona correctamente en Chrome, Firefox, Edge y Safari en sus versiones actuales.
- [ ] Los documentos de transporte generados cumplen al 100% con la normativa vigente (CMR, LCTTM, ADR, Ley 9/2025).
- [ ] El módulo de tacógrafos detecta automáticamente infracciones de conducción y descanso.
- [ ] La interfaz es usable en pantallas desde 320px de ancho.

---

## 8. Métricas de Éxito (KPIs del producto)

- **Reducción de vencimientos no detectados:** 0 documentos vencidos sin alerta previa en los primeros 3 meses.
- **Adopción:** el 100% de los gestores de flota usa la aplicación como herramienta principal en 60 días.
- **Tiempo de planificación:** reducción del 40% en el tiempo dedicado a la planificación semanal de rutas.
- **Satisfacción de usuario:** NPS > 40 a los 3 meses del lanzamiento.

---

## 9. Dependencias Externas

| Dependencia | Propósito | Proveedor sugerido |
|---|---|---|
| API de mapas | Visualización de rutas y posición GPS | Google Maps Platform / Mapbox |
| Proveedor GPS/telemática | Datos en tiempo real de vehículos | Webfleet (TomTom) / Frotcom / Geotab |
| Servicio de email transaccional | Alertas y notificaciones por email | Brevo / SendGrid / Resend |
| Almacenamiento de ficheros | Documentos PDF, fotos | Supabase Storage |
| Servicio de autenticación | 2FA, sesiones seguras | Supabase Auth |

---

## 10. Glosario

| Término | Definición |
|---|---|
| MMA | Masa Máxima Autorizada — el peso máximo legal con el que puede circular el vehículo. |
| ITV | Inspección Técnica de Vehículos — revisión periódica obligatoria. |
| CAP | Certificado de Aptitud Profesional — formación obligatoria para conductores profesionales. |
| ADR | Acuerdo Europeo sobre transporte internacional de mercancías peligrosas por carretera. |
| CMR | Convenio de Contrato de Transporte Internacional de Mercancías por Carretera. |
| LOTT | Ley de Ordenación de los Transportes Terrestres (Ley 16/1987). |
| Tacógrafo | Dispositivo de registro obligatorio en vehículos > 3.500 kg que registra tiempos de conducción y descanso. |
| Etiqueta Euro | Clasificación de emisiones contaminantes del motor (Euro I a Euro VI-D). |
| MDL | Tarjeta de Transporte de Mercancías en régimen de carga completa (Nacional). |
| Quinta rueda | Dispositivo de acoplamiento entre tractora y semirremolque. |
| eCMR | Carta de Porte Internacional en formato digital (Protocolo 2008). |
| DCD | Documento de Control Digital — obligatorio desde 05/10/2026 (Ley 9/2025). |
| G2V2 | Smart Tachograph v2 — tacógrafo inteligente de segunda generación (Reg. UE 2021/1228). |
| HOS | Hours of Service — tiempos de conducción y descanso (CE 561/2006). |
| DDD | Downloadable Digital Data — datos descargables del tacógrafo digital. |
| CPM | Cost Per Mile — coste por kilómetro (KPI financiero). |
| TCO | Total Cost of Ownership — coste total de propiedad de un vehículo. |
| ATP | Acuerdo sobre Transporte Internacional de Mercancías Perecederas. |

---

*FleetControl PRD v2.0 — Documento vivo. Actualizar ante cualquier cambio de alcance o requisito.*
