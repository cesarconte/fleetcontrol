# Plan — feature/mapa: Integración Google Maps + GPS Profesional

## Resumen

Integración de Google Maps Platform en FleetControl con infraestructura GPS profesional de dos capas (cache + histórico), adapter pattern para proveedores, mock provider para desarrollo, y componente FleetMap con marcadores por estado, filtros, y panel de detalle.

**Estado:** ✅ Fases 1-7 completadas. Todas las tareas pendientes (2-6) implementadas. Pendiente solo API Key Google Maps y tareas de producción (7-10).

---

## Arquitectura GPS Profesional

### Patrón implementado

```
┌──────────────────────────────────────────────────────────────┐
│  FleetMap UI (Vue)                                           │
│  ↓ consume use-fleet-map.js                                  │
├──────────────────────────────────────────────────────────────┤
│  api-vehicle-positions.js (unified query)                    │
│  rpc('get_latest_fleet_positions') → DISTINCT ON en SQL      │
├──────────────────────────────────────────────────────────────┤
│  GPS Adapter Interface (GpsProvider)                         │
│  ├── MockGpsProvider (desarrollo)                            │
│  │   └── Interpolación + ruido gaussiano                     │
│  ├── WebfleetAdapter (producción futuro)                     │
│  ├── FrotcomAdapter (producción futuro)                      │
│  └── GeotabAdapter (producción futuro)                       │
├──────────────────────────────────────────────────────────────┤
│  vehicle_positions (histórico, append-only)                  │
│  vehicles.latitude/longitude/current_speed_kmh (cache)       │
│  Trigger AFTER INSERT → actualiza cache                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Estado de Implementación (actualizado 2026-04-03)

### Fases completadas ✅

| Fase                                  | Tareas  | Archivos                                                                          | Tests |
| ------------------------------------- | ------- | --------------------------------------------------------------------------------- | ----- |
| **1. Infraestructura GPS**            | 1.1-1.5 | gps-config, gps-provider, mock-gps-provider, api-vehicle-positions, migración 032 | 38    |
| **2. Mapa — Constantes + Utilidades** | 2.1-2.2 | map-config, load-google-maps                                                      | 12    |
| **3. Composable + Página**            | 3.1-3.2 | use-fleet-map, FleetMapPage                                                       | 4     |
| **4. Componentes UI**                 | 4.1-4.3 | FleetMap, MapControls, VehicleDetailPanel                                         | 8     |
| **5. Integración + Navegación**       | 5.1-5.2 | routes.js, AppSidebar.vue, package.json                                           | —     |
| **6. Tests Integración Realtime**     | 6.1     | use-fleet-map.integration.spec                                                    | 7     |
| **7. Mejoras Mapa + GPS**             | 2-6     | city-coords, mock-gps-provider, use-fleet-map, FleetMap, migraciones 033-035      | 17    |

### Migraciones aplicadas en BD

| Migración | Nombre                                                      | Estado      | Archivo en repo                                        |
| --------- | ----------------------------------------------------------- | ----------- | ------------------------------------------------------ |
| 032       | `vehicle_positions` + trigger + índices BRIN + RLS          | ✅ Aplicada | ✅ `20260403_032_vehicle_positions.sql`                |
| 033       | RLS restrictivo (SELECT authenticated, INSERT service_role) | ✅ Aplicada | ✅ `20260403_033_restrict_vehicle_positions_rls.sql`   |
| 034       | Función `get_latest_fleet_positions` (DISTINCT ON)          | ✅ Aplicada | ✅ `20260403_034_get_latest_fleet_positions.sql`       |
| 035       | Renombrar índices BRIN a convención `idx_vehicle_positions` | ✅ Aplicada | ✅ `20260403_035_rename_vehicle_positions_indexes.sql` |

### Métricas actuales

| Métrica                     | Valor                |
| --------------------------- | -------------------- |
| Tests nuevos (feature mapa) | 86                   |
| Tests totales proyecto      | 1190                 |
| Archivos creados            | 19                   |
| Archivos modificados        | 10                   |
| Migraciones aplicadas       | 4 (032-035)          |
| PR                          | #11 → merged a `dev` |
| Lint errors                 | 0                    |
| Typecheck                   | ✅ limpio            |

---

## Tareas pendientes para próxima sesión

### 🔴 Blocking (impiden funcionamiento en producción)

| #   | Tarea                   | Descripción                                                                                                                                                                              | Archivos | Est.  |
| --- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----- |
| 1   | **API Key Google Maps** | Crear API key en [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/) con **Maps JavaScript API** habilitada. Configurar en `.env`: `VITE_GOOGLE_MAPS_KEY=AIza...` | `.env`   | 5 min |

### 🟠 Alta (funcionalidad incompleta)

| #   | Tarea                                   | Descripción                                                                                                                                                                                                                             | Archivos                                | Estado |
| --- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------ |
| 2   | **Crear migraciones 033 y 034 en repo** | Las migraciones se aplicaron en BD pero los archivos SQL no existen en `supabase/migrations/`. Crear `20260403_033_restrict_vehicle_positions_rls.sql` y `20260403_034_get_latest_fleet_positions.sql` desde el estado actual de la BD. | `supabase/migrations/`                  | ✅     |
| 3   | **Mock GPS conectado a rutas reales**   | `MockGpsProvider._getActiveRoutes()` retorna `[]`. Debe leer rutas activas de la BD (`routes` con status `active`/`on_route`) para generar posiciones realistas entre origen y destino.                                                 | `mock-gps-provider.js`, `api-routes.js` | ✅     |

### 🟡 Media (mejoras importantes)

| #   | Tarea                                 | Descripción                                                                                                      | Archivos                           | Estado |
| --- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------ |
| 4   | **Indicador "offline" en marcadores** | Vehículos sin posición >15 min (`GPS_OFFLINE_THRESHOLD_MS`) deben mostrar marcador gris con tooltip "Sin señal". | `FleetMap.vue`, `use-fleet-map.js` | ✅     |
| 5   | **Tests marcadores FleetMap**         | 3 tests skipped por dependencia Google Maps DOM. Resolver con mock más robusto o E2E con Cypress.                | `FleetMap.spec.js`                 | ✅     |
| 6   | **Renombrar índices BRIN**            | `idx_positions_*` → `idx_vehicle_positions_*` según convención AGENTS.md §15. Requiere nueva migración 035.      | `supabase/migrations/`             | ✅     |

### 🟢 Baja (versiones futuras)

| #   | Tarea                                        | Descripción                                                                                                                          | Archivos                           | Est. |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ---- |
| 7   | **Webhook/ingestor para proveedores reales** | Endpoint (Edge Function o API route) que reciba posiciones de Webfleet/Frotcom/Geotab y llame a `apiVehiclePositions.ingestBatch()`. | `supabase/functions/ingest-gps/`   | 4h   |
| 8   | **Marker clustering**                        | Integrar `@googlemaps/markerclusterer` para >100 vehículos visibles.                                                                 | `FleetMap.vue`, `package.json`     | 2h   |
| 9   | **Trazado de ruta activa**                   | Dibujar polyline de la ruta activa al seleccionar vehículo.                                                                          | `FleetMap.vue`, `api-routes.js`    | 2h   |
| 10  | **Historial de posiciones (replay)**         | Slider temporal para reproducir movimiento de vehículo en el mapa.                                                                   | `FleetMap.vue`, `use-fleet-map.js` | 3h   |

---

## Criterios de Aceptación (estado)

| Criterio                                                           | Estado                                |
| ------------------------------------------------------------------ | ------------------------------------- |
| Tabla `vehicle_positions` con RLS, índices BRIN, trigger de cache  | ✅                                    |
| Mock GPS Provider genera posiciones realistas                      | ✅ Conectado a rutas reales de la BD  |
| Adapter pattern: interfaz `GpsProvider` documentada                | ✅                                    |
| Mapa carga con centro España (zoom 6)                              | ⚠️ Requiere API key                   |
| Marcadores con color según estado                                  | ✅                                    |
| 4 filtros funcionales: Todos / En Ruta / Mantenimiento / Alertas   | ✅                                    |
| Click marcador → panel detalle                                     | ✅                                    |
| Mobile: fullscreen + bottom sheet / Desktop: sidebar 320px         | ✅                                    |
| Realtime: INSERT en vehicle_positions actualiza marcador           | ✅                                    |
| Indicador offline para vehículos sin ping >15 min                  | ✅ (marcador gris, opacidad reducida) |
| Índices BRIN con naming convention `idx_vehicle_positions_*`       | ✅ (migración 035)                    |
| Todos tests pasan                                                  | ✅ (1190 passing, 0 skipped)          |
| `npm run check` limpio                                             | ✅                                    |
| Sin colores hardcodeados, sin `console.log`, archivos < 200 líneas | ✅                                    |

---

## Notas Técnicas

### Cómo activar el mapa en desarrollo

1. Crear API key en Google Cloud Console → APIs & Services → Credentials
2. Habilitar **Maps JavaScript API**
3. Añadir al `.env`:
   ```env
   VITE_GOOGLE_MAPS_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX
   ```
4. `npm run dev` → navegar a `/mapa`

### Producción — Conexión de proveedor real

Cuando la empresa contrate Webfleet/Frotcom/Geotab:

1. Implementar adapter correspondiente (extiende `GpsProvider`)
2. Configurar webhook/ingestor → `apiVehiclePositions.ingestBatch()`
3. Trigger actualiza cache en `vehicles` automáticamente
4. Supabase Realtime → mapa se actualiza
5. **Cero cambios en el UI** — adapter pattern lo abstrae

### Compliance y Retención

- **GDPR Art. 13**: Posición de conductores requiere información explícita
- **CE 561/2006**: Histórico correlacionable con tacógrafo
- **Ley 9/2025**: Desde 05/10/2026, cadena de ubicación/timestamp verificable
- **Retención**: Raw 12 meses → Downsampled 5 años (particiones mensuales + job archivado)

---

## Riesgos y Mitigaciones

| Riesgo                             | Impacto              | Mitigación                                 | Estado          |
| ---------------------------------- | -------------------- | ------------------------------------------ | --------------- |
| Google Maps API key no configurada | Mapa no carga        | Fallback con mensaje informativo           | ⚠️ Pendiente    |
| Mock GPS consume recursos          | Lentitud en dev      | Control start/stop, intervalo configurable | ✅ Implementado |
| Muchos vehículos (>500)            | Performance del mapa | MarkerClusterer si >100 visibles           | 🟢 Pendente     |
| Trigger causa lock en vehicles     | Contención en writes | Trigger mínimo (3 cols, PK lookup)         | ✅ Mitigado     |
| Posiciones desactualizadas         | Datos incorrectos    | Indicador "offline" si >15 min             | 🟡 Pendiente    |

---

## Archivos del feature

### Creados (16)

| Archivo                                                  | Tipo             | Líneas |
| -------------------------------------------------------- | ---------------- | ------ |
| `supabase/migrations/20260403_032_vehicle_positions.sql` | Migración        | 50     |
| `src/constants/gps-config.js`                            | Constantes       | 10     |
| `src/constants/gps-config.spec.js`                       | Test             | 42     |
| `src/services/gps-provider.js`                           | Interfaz         | 20     |
| `src/services/gps-provider.spec.js`                      | Test             | 31     |
| `src/services/mock-gps-provider.js`                      | Adapter mock     | 232    |
| `src/services/mock-gps-provider.spec.js`                 | Test             | 165    |
| `src/services/api-vehicle-positions.js`                  | Servicio         | 117    |
| `src/services/api-vehicle-positions.spec.js`             | Test             | 159    |
| `src/constants/map-config.js`                            | Constantes       | 27     |
| `src/constants/map-config.spec.js`                       | Test             | 47     |
| `src/services/load-google-maps.js`                       | Utilidad         | 40     |
| `src/services/load-google-maps.spec.js`                  | Test             | 97     |
| `src/composables/use-fleet-map.js`                       | Composable       | 96     |
| `src/composables/use-fleet-map.spec.js`                  | Test             | 101    |
| `src/composables/use-fleet-map.integration.spec.js`      | Test integración | 282    |
| `src/pages/FleetMapPage.vue`                             | Página           | 17     |
| `src/components/map/FleetMap.vue`                        | Componente       | 240    |
| `src/components/map/FleetMap.spec.js`                    | Test componente  | 246    |
| `src/components/map/MapControls.vue`                     | Componente       | 40     |
| `src/components/map/MapControls.spec.js`                 | Test             | 67     |
| `src/components/map/VehicleDetailPanel.vue`              | Componente       | 107    |
| `src/components/map/VehicleDetailPanel.spec.js`          | Test             | 90     |

### Modificados (7)

| Archivo                                | Cambio                      |
| -------------------------------------- | --------------------------- |
| `src/plugins/routes.js`                | Ruta `/mapa`                |
| `src/components/layout/AppSidebar.vue` | Item "Mapa" en FLOTA        |
| `src/validations/settings-schema.js`   | `'mock'` en GPS_PROVIDERS   |
| `package.json`                         | `@googlemaps/js-api-loader` |
| `AI_CONTEXT.md`                        | Estado del feature          |
| `AGENTS.md`                            | Protocolo §29-30            |
| `docs/plans/feature-mapa-plan.md`      | Este archivo                |
