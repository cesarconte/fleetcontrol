# Plan — feature/mapa: Integración Google Maps + GPS Profesional

## Resumen

Integración de Google Maps Platform en FleetControl con infraestructura GPS profesional de dos capas (cache + histórico), adapter pattern para proveedores, mock provider realista para desarrollo, y componente FleetMap con marcadores por estado, filtros, y panel de detalle.

**Duración estimada:** 1-2 sesiones (~18 archivos nuevos, ~118 tests nuevos)

---

## Contexto Actual

### Lo que ya existe

- `use-vehicles.js`: composable con CRUD, paginación, filtros, realtime
- `use-routes.js`: composable con CRUD, realtime, campos GPS
- `use-realtime.js`: composable genérico con reconexión automática
- Vehicle statuses: `active`, `on_route`, `in_maintenance`, `inactive`, `decommissioned`
- `VITE_GOOGLE_MAPS_KEY` en `.env.example` (placeholder)
- GPS provider config en settings: `webfleet`, `frotcom`, `geotab`
- Columnas GPS en `vehicles`: `latitude`, `longitude`, `current_speed_kmh`
- Columnas GPS en `routes`: `current_latitude`, `current_longitude`, `current_speed_kmh`, `eta_minutes`

### Lo que hay que crear

- **Capa GPS profesional**: tabla `vehicle_positions` (histórico) + trigger para cache en `vehicles`
- **Adapter pattern**: interfaz GPS + adapter mock (desarrollo) + stubs para proveedores reales
- **Google Maps**: `@googlemaps/js-api-loader` + componentes de mapa
- **FleetMap**: página completa con marcadores, filtros, panel detalle
- **Tests**: unitarios + integración realtime con mock de canal

---

## Arquitectura GPS Profesional

### Patrón de la industria (Webfleet, Geotab, Samsara)

```
┌──────────────────────────────────────────────────────────────┐
│  FleetMap UI (Vue)                                           │
│  ↓ consume use-fleet-map.js                                  │
├──────────────────────────────────────────────────────────────┤
│  api-fleet-map.js (unified query)                            │
│  SELECT vehicles + ultima posición + alertas                 │
├──────────────────────────────────────────────────────────────┤
│  GPS Adapter Interface (GpsProvider)                         │
│  ├── MockGpsProvider (desarrollo)                            │
│  │   └── Genera posiciones realistas entre origen/destino    │
│  ├── WebfleetAdapter (producción futuro)                     │
│  ├── FrotcomAdapter (producción futuro)                      │
│  └── GeotabAdapter (producción futuro)                       │
├──────────────────────────────────────────────────────────────┤
│  vehicle_positions (histórico, append-only, partitioned)     │
│  vehicles.latitude/longitude/current_speed_kmh (cache)       │
│  Trigger AFTER INSERT en vehicle_positions → actualiza cache │
└──────────────────────────────────────────────────────────────┘
```

### Por qué dos capas

| Capa          | Tabla                               | Propósito                                          | Lectura     |
| ------------- | ----------------------------------- | -------------------------------------------------- | ----------- |
| **Cache**     | `vehicles` (columnas lat/lng/speed) | Mapa en vivo, dashboard, dispatch                  | <50ms       |
| **Histórico** | `vehicle_positions` (append-only)   | Replay de rutas, auditoría, compliance CE 561/2006 | Time-series |

**Trigger**: cada INSERT en `vehicle_positions` actualiza automáticamente `vehicles.latitude`, `vehicles.longitude`, `vehicles.current_speed_kmh`.

### Mock GPS Provider (desarrollo)

Genera posiciones simuladas realistas:

- Vehículos `on_route` se mueven gradualmente entre origen y destino
- Velocidad variable: 80-90 km/h en carretera, 0 en paradas
- Actualización cada 30s (simulando intervalo real de telemática)
- Controlado por `VITE_MOCK_GPS=true` en `.env`
- Se desactiva en producción sin tocar código del mapa

---

## Tareas (orden TDD estricto)

### Fase 1: Infraestructura GPS (DB + Adapters)

#### Tarea 1.1: Migración — tabla vehicle_positions + trigger

- **Archivo**: `supabase/migrations/20260403_032_vehicle_positions.sql`
- **Contenido**:

  ```sql
  -- Tabla de posiciones (histórico, append-only)
  CREATE TABLE vehicle_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    recorded_at TIMESTAMPTZ NOT NULL,
    latitude NUMERIC(9,6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude NUMERIC(9,6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    speed_kph NUMERIC(6,2) CHECK (speed_kph >= 0 AND speed_kph <= 300),
    heading_degrees NUMERIC(5,2) CHECK (heading_degrees >= 0 AND heading_degrees < 360),
    ignition_on BOOLEAN NOT NULL DEFAULT false,
    gps_fix_type VARCHAR(20) NOT NULL DEFAULT 'GPS_3D'
      CHECK (gps_fix_type IN ('GPS_2D', 'GPS_3D', 'DEAD_RECKONING', 'CELL_TOWER', 'UNKNOWN')),
    provider VARCHAR(30) NOT NULL DEFAULT 'mock',
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- Índice BRIN para time-series
  CREATE INDEX idx_positions_vehicle_time ON vehicle_positions
    USING brin (vehicle_id, recorded_at DESC);
  CREATE INDEX idx_positions_recorded_at ON vehicle_positions
    USING brin (recorded_at DESC);

  -- RLS
  ALTER TABLE vehicle_positions ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "vehicle_positions_select" ON vehicle_positions
    FOR SELECT USING (true);
  CREATE POLICY "vehicle_positions_insert" ON vehicle_positions
    FOR INSERT WITH CHECK (true);

  -- Trigger: actualizar cache en vehicles
  CREATE OR REPLACE FUNCTION update_vehicle_last_position()
  RETURNS TRIGGER AS $$
  BEGIN
    UPDATE vehicles
    SET latitude = NEW.latitude,
        longitude = NEW.longitude,
        current_speed_kmh = NEW.speed_kph
    WHERE id = NEW.vehicle_id;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER trg_update_vehicle_position
    AFTER INSERT ON vehicle_positions
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_last_position();
  ```

- **Verificación**: `supabase_apply_migration`

#### Tarea 1.2: Constantes GPS

- **Archivo nuevo**: `src/constants/gps-config.js`
- **Contenido**:
  ```js
  export const GPS_PROVIDERS = Object.freeze(['webfleet', 'frotcom', 'geotab', 'mock'])
  export const GPS_FIX_TYPES = Object.freeze([
    'GPS_2D',
    'GPS_3D',
    'DEAD_RECKONING',
    'CELL_TOWER',
    'UNKNOWN',
  ])
  export const GPS_UPDATE_INTERVAL_MS = 30000 // 30s (intervalo real de telemática)
  export const GPS_OFFLINE_THRESHOLD_MS = 900000 // 15 min sin ping = offline
  ```
- **Test**: `gps-config.spec.js` — valores, inmutabilidad

#### Tarea 1.3: Interfaz GPS Adapter

- **Archivo nuevo**: `src/services/gps-provider.js`
- **Contenido**:
  ```js
  /**
   * Interfaz abstracta para proveedores GPS.
   * Todos los adapters deben implementar estos métodos.
   */
  export class GpsProvider {
    async getPositions(vehicleId, { from, to }) {
      throw new Error('Not implemented')
    }
    async getLatestPosition(vehicleId) {
      throw new Error('Not implemented')
    }
    async getFleetPositions() {
      throw new Error('Not implemented')
    }
    async ingestPosition(data) {
      throw new Error('Not implemented')
    }
    async ingestBatch(positions) {
      throw new Error('Not implemented')
    }
  }
  ```
- **Test**: `gps-provider.spec.js` — verificar que los métodos lanzan Error

#### Tarea 1.4: Mock GPS Provider

- **Archivo nuevo**: `src/services/mock-gps-provider.js`
- **Contenido**:
  - Extiende `GpsProvider`
  - Genera posiciones realistas interpolando entre origen y destino de rutas activas
  - Velocidad variable con ruido gaussiano (media 85 km/h, σ=5)
  - Simula paradas (velocidad 0 durante 15-30 min)
  - Respeta límites de velocidad por tipo de vía
  - Método `startSimulation()` / `stopSimulation()` para controlar el ciclo
  - Guarda posiciones en `vehicle_positions` cada 30s
- **Test**: `mock-gps-provider.spec.js` — ~15 tests:
  - Interpolación correcta entre dos puntos
  - Velocidad dentro de rangos realistas
  - Simulación start/stop
  - Posiciones se guardan en BD
  - Vehículos sin ruta no generan posiciones
  - Heading calculado correctamente

#### Tarea 1.5: Servicio `api-vehicle-positions.js`

- **Archivo nuevo**: `src/services/api-vehicle-positions.js`
- **Funciones**:
  - `getPositions(vehicleId, { from, to })` — histórico de un vehículo
  - `getLatestPosition(vehicleId)` — última posición conocida
  - `getFleetPositions()` — última posición de TODOS los vehículos (para mapa)
  - `ingestPosition(data)` — inserta una posición (usa el adapter)
  - `ingestBatch(positions)` — inserta lote (batch de 20-50)
- **Test**: `api-vehicle-positions.spec.js` — ~12 tests

---

### Fase 2: Mapa — Constantes + Utilidades

#### Tarea 2.1: Constantes de mapa

- **Archivo nuevo**: `src/constants/map-config.js`
- **Contenido**:
  ```js
  export const MAP_CONFIG = Object.freeze({
    DEFAULT_CENTER: { lat: 40.4168, lng: -3.7038 }, // Madrid
    DEFAULT_ZOOM: 6,
    ZOOM_MOBILE: 5,
    ZOOM_DETAIL: 12,
    MARKER_COLORS: Object.freeze({
      on_route: '#4CAF50',
      in_maintenance: '#FFC107',
      active: '#2196F3',
      inactive: '#9E9E9E',
      decommissioned: '#616161',
    }),
    FILTERS: Object.freeze([
      { key: 'all', label: 'Todos', icon: 'mdi-map-marker' },
      { key: 'on_route', label: 'En Ruta', icon: 'mdi-truck-fast' },
      { key: 'in_maintenance', label: 'Mantenimiento', icon: 'mdi-wrench' },
      { key: 'has_alerts', label: 'Con Alertas', icon: 'mdi-alert-circle' },
    ]),
  })
  ```
- **Test**: `map-config.spec.js` — valores, inmutabilidad

#### Tarea 2.2: Utilidad de carga de Google Maps

- **Archivo nuevo**: `src/utils/load-google-maps.js`
- **Contenido**: Función lazy con `@googlemaps/js-api-loader`, caching singleton
- **Test**: `load-google-maps.spec.js` — mock de Loader, verificar caching

---

### Fase 3: Composable + Página

#### Tarea 3.1: Composable `use-fleet-map.js`

- **Archivo nuevo**: `src/composables/use-fleet-map.js`
- **Estado reactivo**:
  - `vehicles` (array con posiciones), `isLoading`, `error`
  - `activeFilter` (default: 'all'), `selectedVehicle`, `isDetailOpen`
  - `isGpsConnected` (boolean — indica si hay proveedor GPS activo)
- **Computed**:
  - `filteredVehicles`, `vehiclesWithPosition`, `vehiclesOnRoute`, etc.
- **Métodos**:
  - `fetch()`, `setFilter()`, `selectVehicle()`, `closeDetail()`
  - `toggleMockGps()` — activa/desactiva simulación (solo dev)
- **Realtime**: Suscripción a `vehicle_positions` (INSERT → actualizar posición en mapa)
- **Test**: `use-fleet-map.spec.js` — ~25 tests

#### Tarea 3.2: Página `FleetMapPage.vue`

- **Archivo nuevo**: `src/pages/FleetMapPage.vue`
- **Contenido**: Wrapper full-height, monta `FleetMap.vue`, muestra indicador de conexión GPS

---

### Fase 4: Componentes UI

#### Tarea 4.1: `FleetMap.vue`

- **Archivo nuevo**: `src/components/map/FleetMap.vue`
- **Responsabilidad**: Mapa Google Maps + marcadores + overlays
- **Lógica**:
  - `onMounted`: carga Google Maps, inicializa mapa
  - Watch `filteredVehicles`: actualiza marcadores (diff, no recrear todos)
  - Click marcador: abre panel detalle
  - Cleanup en `onUnmounted`
- **Responsive**:
  - Mobile: fullscreen (100vh), panel como bottom sheet
  - Desktop: sidebar derecho 320px
- **Test**: `FleetMap.spec.js` — ~12 tests

#### Tarea 4.2: `MapControls.vue`

- **Archivo nuevo**: `src/components/map/MapControls.vue`
- **Responsabilidad**: Filtros overlay sobre el mapa
- **Test**: `MapControls.spec.js` — ~8 tests

#### Tarea 4.3: `VehicleDetailPanel.vue`

- **Archivo nuevo**: `src/components/map/VehicleDetailPanel.vue`
- **Contenido**: Matrícula, estado, posición, ruta activa, conductor, alertas, botón "Ver ficha"
- **Test**: `VehicleDetailPanel.spec.js` — ~10 tests

---

### Fase 5: Integración + Navegación

#### Tarea 5.1: Ruta + Sidebar

- **Modificar**: `src/plugins/routes.js` — añadir `/mapa`
- **Modificar**: `src/components/layout/AppSidebar.vue` — item "Mapa" en grupo FLOTA

#### Tarea 5.2: Instalar dependencia

- **Acción**: `npm install @googlemaps/js-api-loader`

---

### Fase 6: Tests de Integración Realtime

#### Tarea 6.1: Test integración realtime

- **Archivo nuevo**: `src/composables/use-fleet-map.integration.spec.js`
- **Scope**: Mock de canal Supabase Realtime
  - INSERT en `vehicle_positions` → marcador se mueve
  - UPDATE en `vehicles` (status change) → marcador cambia color
  - CHANNEL_ERROR → estado de error
  - Reconexión → refetch

---

## Archivos a crear (18 nuevos)

| Archivo                                                  | Tipo             | Líneas est. | Tests   |
| -------------------------------------------------------- | ---------------- | ----------- | ------- |
| `supabase/migrations/20260403_032_vehicle_positions.sql` | Migración        | 50          | —       |
| `src/constants/gps-config.js`                            | Constantes       | 10          | ✅ (5)  |
| `src/services/gps-provider.js`                           | Interfaz         | 20          | ✅ (3)  |
| `src/services/mock-gps-provider.js`                      | Adapter mock     | 120         | ✅ (15) |
| `src/services/api-vehicle-positions.js`                  | Servicio         | 60          | ✅ (12) |
| `src/constants/map-config.js`                            | Constantes       | 25          | ✅ (5)  |
| `src/utils/load-google-maps.js`                          | Utilidad         | 30          | ✅ (8)  |
| `src/composables/use-fleet-map.js`                       | Composable       | 140         | ✅ (25) |
| `src/pages/FleetMapPage.vue`                             | Página           | 25          | —       |
| `src/components/map/FleetMap.vue`                        | Componente       | 180         | ✅ (12) |
| `src/components/map/MapControls.vue`                     | Componente       | 60          | ✅ (8)  |
| `src/components/map/VehicleDetailPanel.vue`              | Componente       | 100         | ✅ (10) |
| `src/composables/use-fleet-map.integration.spec.js`      | Test integración | 80          | ✅ (15) |

**Total**: ~900 líneas de código + ~118 tests nuevos

## Archivos a modificar (4)

| Archivo                                | Cambio                             |
| -------------------------------------- | ---------------------------------- |
| `src/plugins/routes.js`                | Añadir ruta `/mapa`                |
| `src/components/layout/AppSidebar.vue` | Añadir item "Mapa"                 |
| `src/validations/settings-schema.js`   | Añadir 'mock' a GPS_PROVIDERS      |
| `package.json`                         | Añadir `@googlemaps/js-api-loader` |

---

## Orden de ejecución (TDD estricto)

1. **Migración 032**: `vehicle_positions` + trigger + índices + RLS
2. **Tarea 1.2**: RED → `gps-config.spec.js` → GREEN → `gps-config.js`
3. **Tarea 1.3**: RED → `gps-provider.spec.js` → GREEN → `gps-provider.js`
4. **Tarea 1.4**: RED → `mock-gps-provider.spec.js` → GREEN → `mock-gps-provider.js`
5. **Tarea 1.5**: RED → `api-vehicle-positions.spec.js` → GREEN → `api-vehicle-positions.js`
6. **Tarea 2.1**: RED → `map-config.spec.js` → GREEN → `map-config.js`
7. **Tarea 2.2**: RED → `load-google-maps.spec.js` → GREEN → `load-google-maps.js`
8. **Tarea 3.1**: RED → `use-fleet-map.spec.js` → GREEN → `use-fleet-map.js`
9. **Tarea 4.2**: RED → `MapControls.spec.js` → GREEN → `MapControls.vue`
10. **Tarea 4.3**: RED → `VehicleDetailPanel.spec.js` → GREEN → `VehicleDetailPanel.vue`
11. **Tarea 4.1**: RED → `FleetMap.spec.js` → GREEN → `FleetMap.vue`
12. **Tarea 3.2**: `FleetMapPage.vue`
13. **Tarea 5.1**: Ruta + Sidebar
14. **Tarea 5.2**: `npm install`
15. **Tarea 6.1**: `use-fleet-map.integration.spec.js`

---

## Criterios de Aceptación

- [ ] Tabla `vehicle_positions` creada con RLS, índices BRIN, trigger de cache
- [ ] Mock GPS Provider genera posiciones realistas entre origen/destino de rutas activas
- [ ] Adapter pattern: interfaz `GpsProvider` con métodos documentados
- [ ] Mapa carga con centro España (zoom 6) en < 3s
- [ ] Marcadores con color según estado (verde=on_route, amarillo=maintenance, azul=active)
- [ ] 4 filtros funcionales: Todos / En Ruta / Mantenimiento / Alertas
- [ ] Click marcador → panel detalle con datos completos
- [ ] Mobile: fullscreen + bottom sheet | Desktop: sidebar 320px
- [ ] Realtime: INSERT en vehicle_positions actualiza marcador en mapa
- [ ] Mock GPS se activa con `VITE_MOCK_GPS=true` y se desactiva sin tocar código
- [ ] Todos tests pasan (~118 nuevos + existentes)
- [ ] `npm run check` limpio (lint + typecheck)
- [ ] Sin colores hardcodeados, sin `console.log`, archivos < 200 líneas
- [ ] `AI_CONTEXT.md` actualizado

---

## Notas Técnicas

### Mock GPS — Algoritmo de interpolación

El mock provider simula comportamiento real de telemática:

```js
// Pseudocode del algoritmo de interpolación
function simulateMovement(route) {
  const totalDistance = haversine(route.origin, route.destination)
  const estimatedDuration = totalDistance / averageSpeed // ~85 km/h
  const steps = estimatedDuration / (GPS_UPDATE_INTERVAL_MS / 1000)

  for (let i = 0; i < steps; i++) {
    const progress = i / steps
    const lat = lerp(route.origin_lat, route.dest_lat, progress) + noise()
    const lng = lerp(route.origin_lng, route.dest_lng, progress) + noise()
    const speed = 85 + gaussianRandom(0, 5) // km/h con ruido

    // Simular paradas aleatorias (15-30 min cada 2-3 horas)
    if (shouldStop(progress)) {
      yield { lat, lng, speed: 0, ignition_on: false }
      wait(STOP_DURATION)
    } else {
      yield { lat, lng, speed, ignition_on: true }
      wait(GPS_UPDATE_INTERVAL_MS)
    }
  }
}
```

### Producción — Cómo se conecta un proveedor real

Cuando la empresa contrate Webfleet/Frotcom/Geotab:

1. Implementar el adapter correspondiente (extiende `GpsProvider`)
2. Configurar webhook/ingestor que reciba posiciones del proveedor
3. El ingestor llama a `api-vehicle-positions.ingestBatch()`
4. El trigger actualiza automáticamente la cache en `vehicles`
5. Supabase Realtime.broadcast → mapa se actualiza
6. **Cero cambios en el UI** — el adapter pattern lo abstrae todo

### Compliance y Retención de Datos

- **GDPR Art. 13**: Posición de conductores requiere información explícita
- **CE 561/2006**: Histórico de posiciones correlacionable con tacógrafo
- **Ley 9/2025**: Desde 05/10/2026, cadena de ubicación/timestamp verificable
- **Retención recomendada**: Raw 12 meses → Downsampled 5 años (implementar con particiones mensuales + job de archivado)

### Performance

- BRIN indexes para consultas por rango de tiempo (mucho más pequeños que B-tree)
- Trigger es síncrono pero mínimo (3 columnas UPDATE por PK)
- Mock GPS corre en Web Worker para no bloquear el main thread
- Marcadores se actualizan por diff (no se recrean todos en cada cambio)

---

## Riesgos y Mitigaciones

| Riesgo                             | Impacto              | Mitigación                                                                              |
| ---------------------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| Google Maps API key no configurada | Mapa no carga        | Fallback con mensaje "Configura API key en Configuración"                               |
| Mock GPS consume recursos          | Lentitud en dev      | Control start/stop, intervalo configurable, Web Worker                                  |
| Muchos vehículos (>500)            | Performance del mapa | MarkerClusterer si >100 marcadores visibles                                             |
| Trigger causa lock en vehicles     | Contención en writes | El trigger es mínimo (3 cols, PK lookup). Si hay problemas, pasar a logical replication |
| Posiciones desactualizadas         | Datos incorrectos    | Timestamp de última actualización + indicador "offline" si >15 min                      |

---

## Archivos docs/plans a eliminar

- `docs/plans/SESSION_C_PLAN.md` — ya completado
- `docs/plans/realtime-subscriptions.md` — ya completado
