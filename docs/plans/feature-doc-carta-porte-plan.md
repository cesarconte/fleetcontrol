# Plan — feature/doc-carta-porte-cmr: Generación de Carta de Porte

## Resumen

Implementación del módulo de generación de Carta de Porte para transporte de mercancías por carretera en España. **Módulo crítico** — debe cumplir al 100% con la normativa vigente.

**Alcance inicial:** Carta de Porte Nacional (Ley 15/2009, arts. 10-12) — transporte nacional por carretera en España. La Carta de Porte CMR internacional se implementará cuando se añada transporte internacional al MVP.

**Base legal:**

- **Carta de Porte Nacional:** Ley 15/2009 (LCTTM), arts. 10-12; Orden FOM/2861/2012; RD-Ley 14/2022
- **Carta de Porte CMR (internacional, futuro):** Convenio CMR 1956 (arts. 5-6), Reg. UE 1072/2009

**Estado actual:** Existe un generador básico (`document-generator.js`) con renderizadores PDF simplificados que NO cumplen con todos los campos obligatorios de la normativa. Este plan reemplaza y amplía esa funcionalidad para cumplimiento legal total.

---

## Arquitectura del Módulo

```
┌─────────────────────────────────────────────────────────────────┐
│  GenerateDocumentDialog.vue (UI)                                │
│  ↓ selecciona tipo doc + ruta + carga                           │
├─────────────────────────────────────────────────────────────────┤
│  use-document-templates.js (composable)                         │
│  ↓ generateDocument()                                           │
├─────────────────────────────────────────────────────────────────┤
│  document-generator.js (servicio generación)                    │
│  ├── fetchData() → route, vehicle, driver, cargo, company       │
│  ├── mapFields() → aplica carta-porte-field-mapping.js          │
│  └── renderPdf() → layout específico por tipo doc               │
├─────────────────────────────────────────────────────────────────┤
│  carta-porte-field-mapping.js (plantilla datos normativa)       │
│  └── Mapeo DB → campos obligatorios carta de porte              │
├─────────────────────────────────────────────────────────────────┤
│  transport-document-types.js (catálogo tipos)                   │
│  └── Campos obligatorios por tipo, base legal                   │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Storage (transport-documents bucket)                  │
│  generated_documents (registro BD)                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estado Actual del Código Existente

### Lo que YA funciona (Sesión C)

| Componente                     | Estado     | Notas                                                               |
| ------------------------------ | ---------- | ------------------------------------------------------------------- |
| `transport-document-types.js`  | ✅ Existe  | 6 tipos definidos, pero campos incompletos                          |
| `document-generator.js`        | ✅ Existe  | Genera PDFs básicos, NO todos los campos obligatorios               |
| `GenerateDocumentDialog.vue`   | ✅ Existe  | Diálogo funcional con selector tipo + ruta + carga                  |
| `use-document-templates.js`    | ✅ Existe  | Composable reactivo para templates                                  |
| `transport-document-schema.js` | ✅ Existe  | Zod schemas básicos para validación                                 |
| `api-document-templates.js`    | ✅ Existe  | CRUD templates                                                      |
| Migración 027                  | ✅ Creada  | Tablas `document_templates` + `generated_documents`, bucket Storage |
| Tests generator                | ⚠️ 6 tests | Solo tests básicos, NO verifican campos obligatorios                |

### Lo que FALTA para cumplimiento normativo

| Requisito normativo                                                                                | Estado actual      | Acción necesaria                                       |
| -------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------ |
| **Carta Porte Nacional — 10 secciones obligatorias (art. 10 LCTTM)**                               | ❌ No implementado | Crear layout completo con TODOS los campos             |
| **CMR — campos arts. 5-6 (lugar/fecha emisión, transportista, bultos, condiciones pago, aduanas)** | ⚠️ Parcial         | Ampliar con campos faltantes                           |
| **3 ejemplares originales (art. 11 LCTTM)**                                                        | ❌ No implementado | Generar 3 copias (expedidor, mercancía, transportista) |
| **Numeración correlativa única**                                                                   | ❌ No implementado | Sistema de numeración automática                       |
| **Firmas (cargador + transportista + destinatario)**                                               | ⚠️ Básico          | Espacios de firma con indicaciones claras              |
| **Reserva de comprobación**                                                                        | ❌ No implementado | Sección para anotar daños/faltantes                    |
| **Tests de campos obligatorios**                                                                   | ❌ No implementado | Tests que verifiquen CADA campo obligatorio            |

---

## Plan de Implementación

### Tarea 1: Actualizar catálogo de tipos y campos obligatorios

**Objetivo:** `transport-document-types.js` con TODOS los campos obligatorios según normativa.

#### 1.1 — Carta de Porte Nacional (Ley 15/2009, art. 10)

**10 secciones obligatorias:**

| #   | Sección                          | Campos                                                                                                                                                                                                                                                                                                  | Fuente DB                                                |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | **Identificación de las partes** | `shipper_name`, `shipper_nif`, `shipper_address`, `shipper_city`, `shipper_province`, `shipper_phone`, `carrier_name`, `carrier_nif`, `carrier_address`, `carrier_transport_license`, `consignee_name`, `consignee_nif`, `consignee_address`, `consignee_city`, `consignee_province`, `consignee_phone` | `company_settings`, `drivers` (carrier), `cargo_records` |
| 2   | **Lugares y fechas**             | `issue_place`, `issue_date`, `loading_address`, `loading_date`, `loading_time`, `delivery_address`, `delivery_date`, `delivery_time_window`                                                                                                                                                             | `routes`, `company_settings`                             |
| 3   | **Descripción de mercancías**    | `goods_nature`, `goods_description`, `packages_count`, `gross_weight_kg`, `net_weight_kg`, `volume_m3`, `adr_class`, `adr_un_number`, `temperature_required`                                                                                                                                            | `cargo_records`                                          |
| 4   | **Embalaje y etiquetado**        | `packaging_type`, `pallet_count`, `seal_number`, `container_number`, `marking_codes`                                                                                                                                                                                                                    | `cargo_records`                                          |
| 5   | **Instrucciones de transporte**  | `special_handling`, `sealing_instructions`, `delivery_deadline`, `transit_notes`                                                                                                                                                                                                                        | `cargo_records`, `routes`                                |
| 6   | **Valor declarado y seguros**    | `declared_value`, `insurance_company`, `insurance_policy_number`, `coverage_limit`                                                                                                                                                                                                                      | `cargo_records`, `company_settings`                      |
| 7   | **Precio del flete**             | `freight_price`, `fuel_surcharge`, `toll_fees`, `waiting_fees`, `total_amount`, `payment_terms`, `payment_method`                                                                                                                                                                                       | `routes`                                                 |
| 8   | **Firmas**                       | `shipper_signature`, `carrier_signature`, `consignee_signature`, `signature_date`                                                                                                                                                                                                                       | Generado en PDF                                          |
| 9   | **Reserva de comprobación**      | `damage_notes`, `missing_packages`, `condition_notes`                                                                                                                                                                                                                                                   | Generado en PDF (espacio)                                |
| 10  | **Observaciones**                | `order_reference`, `tms_reference`, `additional_notes`                                                                                                                                                                                                                                                  | `routes`, `cargo_records`                                |

#### 1.2 — Carta de Porte CMR Internacional (Convenio CMR 1956, arts. 5-6)

**Campos obligatorios CMR:**

| #   | Campo                  | Referencia CMR | Fuente DB                          |
| --- | ---------------------- | -------------- | ---------------------------------- |
| 1   | `issue_place`          | Art. 5(a)      | `routes.origin_city`               |
| 2   | `issue_date`           | Art. 5(a)      | `routes.departure_date`            |
| 3   | `shipper_name`         | Art. 5(b)      | `company_settings.company_name`    |
| 4   | `shipper_address`      | Art. 5(b)      | `company_settings.address`         |
| 5   | `carrier_name`         | Art. 5(b)      | `company_settings.company_name`    |
| 6   | `carrier_address`      | Art. 5(b)      | `company_settings.address`         |
| 7   | `consignee_name`       | Art. 5(c)      | `cargo_records.cmr_recipient`      |
| 8   | `consignee_address`    | Art. 5(c)      | `cargo_records.cmr_delivery_place` |
| 9   | `pickup_place`         | Art. 5(d)      | `routes.origin_address`            |
| 10  | `pickup_date`          | Art. 5(d)      | `routes.departure_date`            |
| 11  | `delivery_place`       | Art. 5(e)      | `routes.destination_address`       |
| 12  | `goods_nature`         | Art. 5(f)      | `cargo_records.description`        |
| 13  | `packaging_type`       | Art. 5(f)      | `cargo_records.packaging_type`     |
| 14  | `packages_count`       | Art. 5(g)      | `cargo_records.packages`           |
| 15  | `package_marks`        | Art. 5(g)      | `cargo_records.marks_numbers`      |
| 16  | `gross_weight_kg`      | Art. 5(h)      | `cargo_records.weight_kg`          |
| 17  | `freight_charges`      | Art. 5(i)      | `routes.price`                     |
| 18  | `payment_terms`        | Art. 5(i)      | `routes.payment_terms`             |
| 19  | `cod_amount`           | Art. 5(j)      | `cargo_records.cod_amount`         |
| 20  | `goods_value`          | Art. 5(k)      | `cargo_records.declared_value`     |
| 21  | `customs_instructions` | Art. 5(l)      | `cargo_records.customs_notes`      |
| 22  | `transit_notes`        | Art. 5(m)      | `routes.notes`                     |
| 23  | `vehicle_plate`        | Práctica       | `vehicles.plate`                   |
| 24  | `driver_name`          | Práctica       | `drivers.full_name`                |
| 25  | `driver_license`       | Práctica       | `drivers.license_number`           |

#### Archivos a modificar

| Archivo                                          | Acción    | Descripción                                           |
| ------------------------------------------------ | --------- | ----------------------------------------------------- |
| `src/constants/transport-document-types.js`      | Modificar | Añadir campos obligatorios nacionales + CMR completos |
| `src/constants/transport-document-types.spec.js` | Modificar | Tests nuevos campos                                   |

---

### Tarea 2: Crear servicio de mapeo de campos (plantilla de datos)

**Objetivo:** `src/services/carta-porte-field-mapping.js` — mapea datos de BD → campos obligatorios del documento.

#### 2.1 — Función `mapCartaPorteFields()`

```js
/**
 * Mapea datos de la BD a los campos obligatorios de la Carta de Porte.
 *
 * @param {object} rawData - { route, vehicle, driver, cargo, company }
 * @param {string} docType - 'carta_porte_nacional' | 'cmr'
 * @returns {object} Campos mapeados listos para generación PDF
 */
export function mapCartaPorteFields(rawData, docType)
```

#### 2.2 — Constante `CARTA_PORTE_FIELD_MAPPING`

Mapeo explícito de cada campo obligatorio → columna BD:

```js
export const CARTA_PORTE_FIELD_MAPPING = {
  nacional: {
    shipper: { source: 'company', fields: { ... } },
    carrier: { source: 'company', fields: { ... } },
    consignee: { source: 'cargo', fields: { ... } },
    // ... todas las 10 secciones
  },
  cmr: {
    // ... campos CMR arts. 5-6
  },
}
```

#### 2.3 — Función `validateRequiredFields()`

Verifica que TODOS los campos obligatorios estén presentes antes de generar:

```js
/**
 * Valida que todos los campos obligatorios estén presentes.
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateRequiredFields(mappedData, docType)
```

#### 2.4 — Función `generateDocumentNumber()`

Numeración única correlativa:

```js
/**
 * Genera número único de carta de porte.
 * Formato: CPN-YYYY-NNNNN (nacional) / CMR-YYYY-NNNNN (internacional)
 */
export function generateDocumentNumber(docType, date = new Date())
```

#### Archivos a crear

| Archivo                                          | Tipo     | Líneas est. |
| ------------------------------------------------ | -------- | ----------- |
| `src/services/carta-porte-field-mapping.js`      | Servicio | ~150        |
| `src/services/carta-porte-field-mapping.spec.js` | Test     | ~120        |

---

### Tarea 3: Generación PDF con layout normativo completo

**Objetivo:** Reemplazar `renderCmrPdf()` en `document-generator.js` con layout que incluya TODOS los campos obligatorios.

#### 3.1 — Layout Carta de Porte Nacional

Estructura del PDF (formato A4):

```
┌──────────────────────────────────────────────────────────┐
│  CARTA DE PORTE NACIONAL                                  │
│  Ley 15/2009 — Contrato de Transporte Terrestre           │
│  Nº: CPN-2026-00001                                       │
├──────────────────────────────────────────────────────────┤
│  1. REMITENTE/CARGADOR              2. TRANSPORTISTA      │
│  [Datos empresa]                    [Datos transportista] │
│                                     [Nº autorización]     │
├──────────────────────────────────────────────────────────┤
│  3. DESTINATARIO                                          │
│  [Nombre, NIF, dirección, teléfono]                       │
├──────────────────────────────────────────────────────────┤
│  4. LUGAR Y FECHA DE CARGA         5. LUGAR Y ENTREGA    │
│  [Dirección, fecha, hora]          [Dirección, fecha]     │
├──────────────────────────────────────────────────────────┤
│  6. MERCANCÍAS                                            │
│  ┌─────────────┬────────┬────────┬────────┬────────────┐ │
│  │ Naturaleza  │ Bultos │ P. Bruto│ P. Neto│ Volumen   │ │
│  ├─────────────┼────────┼────────┼────────┼────────────┤ │
│  │ [desc]      │ [nº]   │ [kg]   │ [kg]   │ [m³]      │ │
│  └─────────────┴────────┴────────┴────────┴────────────┘ │
│  Embalaje: [tipo]  Precinto: [nº]  ADR: [clase/UN]       │
├──────────────────────────────────────────────────────────┤
│  7. INSTRUCCIONES DE TRANSPORTE                           │
│  [Manipulación especial, plazos, observaciones]           │
├──────────────────────────────────────────────────────────┤
│  8. VALOR DECLARADO Y SEGUROS                             │
│  Valor: [€]  Aseguradora: [nombre]  Póliza: [nº]         │
├──────────────────────────────────────────────────────────┤
│  9. PRECIO DEL FLETE                                      │
│  Porte: [€]  Supl. combustible: [€]  Peajes: [€]         │
│  Total: [€]  Forma de pago: [condiciones]                 │
├──────────────────────────────────────────────────────────┤
│  10. RESERVA DE COMPROBACIÓN                              │
│  [Espacio para anotar daños/faltantes]                    │
├──────────────────────────────────────────────────────────┤
│  11. OBSERVACIONES                                        │
│  [Nº pedido, referencia TMS, notas adicionales]           │
├──────────────────────────────────────────────────────────┤
│  FIRMAS                                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────┐ │
│  │ Cargador        │  │ Transportista   │  │ Destinat. │ │
│  │ Firma: _______  │  │ Firma: _______  │  │ Firma: __ │ │
│  │ Fecha: _______  │  │ Fecha: _______  │  │ Fecha: __ │ │
│  └─────────────────┘  └─────────────────┘  └───────────┘ │
└──────────────────────────────────────────────────────────┘
```

#### 3.2 — Layout CMR Internacional (futuro)

Similar al nacional pero con:

- Campos aduaneros (instrucciones, documentos anexos)
- Referencia al Convenio CMR 1956
- Campos de tránsito internacional (países de paso)
- Indicador de porte pagado/debido

#### Archivos a modificar

| Archivo                                   | Acción    | Descripción                                     |
| ----------------------------------------- | --------- | ----------------------------------------------- |
| `src/services/document-generator.js`      | Modificar | Reemplazar `renderCmrPdf()` con layout completo |
| `src/services/document-generator.spec.js` | Modificar | Tests de campos obligatorios                    |

---

### Tarea 4: Tests de cumplimiento normativo

**Objetivo:** Tests que verifiquen que TODOS los campos obligatorios están presentes en el PDF generado.

#### 4.1 — Tests de campos Carta de Porte Nacional

```js
describe('carta-porte-nacional — campos obligatorios (Ley 15/2009, art. 10)', () => {
  it('debería incluir las 10 secciones obligatorias', () => { ... })
  it('debería incluir identificación completa del cargador (nombre, NIF, dirección)', () => { ... })
  it('debería incluir identificación completa del transportista', () => { ... })
  it('debería incluir identificación completa del destinatario', () => { ... })
  it('debería incluir lugar y fecha de emisión', () => { ... })
  it('debería incluir dirección de carga y fecha', () => { ... })
  it('debería incluir dirección de entrega y fecha', () => { ... })
  it('debería incluir descripción detallada de mercancías', () => { ... })
  it('debería incluir número de bultos y peso', () => { ... })
  it('debería incluir tipo de embalaje', () => { ... })
  it('debería incluir precio del flete y forma de pago', () => { ... })
  it('debería incluir espacios para firmas (cargador, transportista, destinatario)', () => { ... })
  it('debería incluir sección de reserva de comprobación', () => { ... })
  it('debería incluir numeración única correlativa', () => { ... })
})
```

#### 4.2 — Tests de validación de campos

```js
describe('validateRequiredFields', () => {
  it('debería retornar valid=true cuando todos los campos están presentes', () => { ... })
  it('debería retornar valid=false con lista de campos faltantes', () => { ... })
  it('debería validar campos específicos de carta de porte nacional', () => { ... })
  it('debería validar campos específicos de CMR', () => { ... })
})
```

#### 4.3 — Tests de mapeo de campos

```js
describe('mapCartaPorteFields', () => {
  it('debería mapear datos de company_settings a campos de cargador', () => { ... })
  it('debería mapear datos de cargo_records a campos de mercancías', () => { ... })
  it('debería mapear datos de routes a lugares y fechas', () => { ... })
  it('debería manejar datos opcionales nulos sin romper', () => { ... })
  it('debería incluir campos ADR si la carga es peligrosa', () => { ... })
})
```

#### Archivos a crear

| Archivo                                          | Tipo | Líneas est. |
| ------------------------------------------------ | ---- | ----------- |
| `src/services/carta-porte-field-mapping.spec.js` | Test | ~120        |

#### Archivos a modificar

| Archivo                                   | Acción  | Descripción                                      |
| ----------------------------------------- | ------- | ------------------------------------------------ |
| `src/services/document-generator.spec.js` | Ampliar | Tests de campos obligatorios (~80 líneas nuevas) |

---

### Tarea 5: Actualizar validaciones Zod

**Objetivo:** Schema Zod que valide los datos de entrada contra los campos obligatorios.

#### 5.1 — `cartaPorteNacionalSchema`

```js
export const cartaPorteNacionalSchema = z.object({
  // Sección 1: Partes
  shipper_name: z.string().min(1, 'Nombre del cargador obligatorio'),
  shipper_nif: z.string().min(1, 'NIF del cargador obligatorio'),
  carrier_name: z.string().min(1, 'Nombre del transportista obligatorio'),
  consignee_name: z.string().min(1, 'Nombre del destinatario obligatorio'),
  // Sección 2: Lugares y fechas
  issue_place: z.string().min(1, 'Lugar de emisión obligatorio'),
  issue_date: z.string().min(1, 'Fecha de emisión obligatoria'),
  loading_address: z.string().min(1, 'Dirección de carga obligatoria'),
  delivery_address: z.string().min(1, 'Dirección de entrega obligatoria'),
  // Sección 3: Mercancías
  goods_nature: z.string().min(1, 'Naturaleza de la mercancía obligatoria'),
  gross_weight_kg: z.number().positive('Peso bruto debe ser positivo'),
  // Sección 7: Flete
  freight_price: z.number().min(0, 'Precio del flete obligatorio'),
  payment_terms: z.string().min(1, 'Condiciones de pago obligatorias'),
  // ... resto de secciones
})
```

#### Archivos a modificar

| Archivo                                             | Acción  | Descripción                                     |
| --------------------------------------------------- | ------- | ----------------------------------------------- |
| `src/validations/transport-document-schema.js`      | Ampliar | Añadir schemas de carta de porte nacional y CMR |
| `src/validations/transport-document-schema.spec.js` | Ampliar | Tests de nuevos schemas                         |

---

### Tarea 6: Actualizar constantes legales

**Objetivo:** Añadir constantes de carta de porte a `legal-limits.js`.

| Constante                             | Valor | Referencia                            |
| ------------------------------------- | ----- | ------------------------------------- |
| `CARTA_PORTE_MANDATORY_THRESHOLD_EUR` | 150   | LCTTM art. 10 — umbral obligatoriedad |
| `CARTA_PORTE_COPIES_REQUIRED`         | 3     | LCTTM art. 11 — ejemplares originales |
| `CARTA_PORTE_RETENTION_YEARS`         | 5     | LCTTM — plazo de conservación         |
| `CARTA_PORTE_NATIONAL_FIELDS_COUNT`   | 40+   | Nº campos obligatorios nacional       |
| `CARTA_PORTE_CMR_FIELDS_COUNT`        | 25+   | Nº campos obligatorios CMR            |

#### Archivos a modificar

| Archivo                              | Acción  | Descripción             |
| ------------------------------------ | ------- | ----------------------- |
| `src/constants/legal-limits.js`      | Ampliar | Sección CARTA_PORTE     |
| `src/constants/legal-limits.spec.js` | Ampliar | Tests nuevas constantes |

---

## Estado de Implementación (al inicio)

| Fase                           | Tareas  | Archivos                              | Tests | Estado       |
| ------------------------------ | ------- | ------------------------------------- | ----- | ------------ |
| **1. Catálogo tipos + campos** | 1.1-1.2 | `transport-document-types.js` + spec  | ~15   | 🔴 Pendiente |
| **2. Mapeo de campos**         | 2.1-2.4 | `carta-porte-field-mapping.js` + spec | ~15   | 🔴 Pendiente |
| **3. Generación PDF**          | 3.1-3.2 | `document-generator.js`               | ~20   | 🔴 Pendiente |
| **4. Tests cumplimiento**      | 4.1-4.3 | `document-generator.spec.js`          | ~25   | 🔴 Pendiente |
| **5. Validaciones Zod**        | 5.1     | `transport-document-schema.js` + spec | ~10   | 🔴 Pendiente |
| **6. Constantes legales**      | 6       | `legal-limits.js` + spec              | ~5    | 🔴 Pendiente |

---

## Métricas Objetivo

| Métrica                         | Valor Actual | Valor Objetivo |
| ------------------------------- | ------------ | -------------- |
| Tests totales proyecto          | 1202         | 1300+          |
| Tests módulo documentos         | 6            | 90+            |
| Campos CMR implementados        | ~12/25       | 25/25          |
| Campos Nacional implementados   | ~10/40       | 40/40          |
| Cobertura document-generator.js | ~30%         | 90%+           |
| Lint errors                     | 0            | 0              |
| Typecheck                       | ✅ limpio    | ✅ limpio      |

---

## Criterios de Aceptación

| Criterio                                                            | Verificación                       |
| ------------------------------------------------------------------- | ---------------------------------- |
| Carta de Porte Nacional incluye las 10 secciones del art. 10 LCTTM  | Test que verifica cada sección     |
| CMR incluye todos los campos de los arts. 5-6 del Convenio CMR 1956 | Test que verifica cada campo       |
| Todos los campos obligatorios están presentes en el PDF generado    | Tests de contenido PDF             |
| Numeración única correlativa por documento                          | Test de `generateDocumentNumber()` |
| Validación Zod rechaza datos incompletos                            | Tests de schema                    |
| `validateRequiredFields()` retorna campos faltantes                 | Tests de validación                |
| `npm test` pasa sin fallos                                          | CI gate                            |
| `npm run check` limpio (lint + typecheck)                           | CI gate                            |
| Sin colores hardcodeados, sin `console.log`                         | Review manual                      |
| Archivos < 200 líneas (soft), < 300 (hard)                          | Review manual                      |
| TDD seguido: tests escritos ANTES de implementación                 | Historial commits                  |

---

## Riesgos y Mitigaciones

| Riesgo                                              | Impacto | Mitigación                                                                  |
| --------------------------------------------------- | ------- | --------------------------------------------------------------------------- |
| Campos DB insuficientes para todos los obligatorios | Alto    | Identificar campos faltantes en Tarea 1, proponer migración BD si necesario |
| PDF layout excede 200 líneas                        | Medio   | Extraer sub-renderizadores por sección                                      |
| jsPDF no soporta layout complejo                    | Medio   | Usar jsPDF-AutoTable para tablas, coordenadas manuales para secciones       |
| Normativa cambia antes de MVP                       | Bajo    | Constantes en `legal-limits.js`, fácil de actualizar                        |
| Transporte internacional se adelanta                | Bajo    | Arquitectura preparada para CMR desde Tarea 1                               |

---

## Dependencias

| Dependencia                                  | Estado               | Notas                                  |
| -------------------------------------------- | -------------------- | -------------------------------------- |
| `transport-document-types.js` existente      | ✅                   | Requiere ampliación de campos          |
| `document-generator.js` existente            | ✅                   | Requiere reescritura de renderizadores |
| `GenerateDocumentDialog.vue` existente       | ✅                   | Sin cambios necesarios                 |
| `use-document-templates.js` existente        | ✅                   | Sin cambios necesarios                 |
| Bucket `transport-documents` (migración 027) | ⚠️ Pendiente aplicar | Ya creado en repo                      |
| Tabla `generated_documents` (migración 027)  | ⚠️ Pendiente aplicar | Ya creada en repo                      |

---

## Archivos del Feature

### A crear (2)

| Archivo                                          | Tipo     | Líneas est. |
| ------------------------------------------------ | -------- | ----------- |
| `src/services/carta-porte-field-mapping.js`      | Servicio | ~150        |
| `src/services/carta-porte-field-mapping.spec.js` | Test     | ~120        |

### A modificar (8)

| Archivo                                             | Cambio                                         | Líneas est. |
| --------------------------------------------------- | ---------------------------------------------- | ----------- |
| `src/constants/transport-document-types.js`         | Campos obligatorios nacionales + CMR completos | +80         |
| `src/constants/transport-document-types.spec.js`    | Tests nuevos campos                            | +20         |
| `src/services/document-generator.js`                | Layout PDF completo + numeración + validación  | +100, -50   |
| `src/services/document-generator.spec.js`           | Tests campos obligatorios                      | +80         |
| `src/validations/transport-document-schema.js`      | Schemas carta de porte nacional + CMR          | +60         |
| `src/validations/transport-document-schema.spec.js` | Tests nuevos schemas                           | +30         |
| `src/constants/legal-limits.js`                     | Sección CARTA_PORTE                            | +10         |
| `src/constants/legal-limits.spec.js`                | Tests nuevas constantes                        | +5          |

---

## Orden de Ejecución (TDD)

1. **Tarea 1** — Actualizar `transport-document-types.js` con campos obligatorios
   - RED: Tests que fallan por campos faltantes
   - GREEN: Añadir campos
   - REFACTOR: Organizar por secciones

2. **Tarea 2** — Crear `carta-porte-field-mapping.js`
   - RED: Tests de mapeo que fallan
   - GREEN: Implementar `mapCartaPorteFields()` + `validateRequiredFields()` + `generateDocumentNumber()`
   - REFACTOR: Extraer mappings por tipo doc

3. **Tarea 6** — Añadir constantes legales (prerrequisito para validaciones)
   - RED: Tests de constantes
   - GREEN: Añadir a `legal-limits.js`
   - REFACTOR: N/A

4. **Tarea 5** — Actualizar schemas Zod
   - RED: Tests de validación que fallan
   - GREEN: Añadir schemas
   - REFACTOR: N/A

5. **Tarea 3** — Reescribir generadores PDF
   - RED: Tests de layout que fallan
   - GREEN: Implementar `renderCartaPorteNacionalPdf()` + `renderCmrPdf()`
   - REFACTOR: Extraer sub-renderizadores

6. **Tarea 4** — Tests de cumplimiento normativo
   - RED: Tests de campos obligatorios
   - GREEN: Ajustar generadores para pasar
   - REFACTOR: Consolidar helpers de test

---

## Notas Técnicas

### Cómo probar en desarrollo

1. Asegurar migración 027 aplicada en Supabase
2. `npm run dev` → navegar a Configuración → Documentos
3. Crear ruta de prueba con vehículo, conductor y carga
4. Click "Generar documento" → seleccionar "Carta de Porte Nacional"
5. Verificar PDF generado contiene TODOS los campos obligatorios

### Producción — Cumplimiento legal

- **Conservación:** 5 años (LCTTM)
- **Formato:** PDF con numeración correlativa única
- **Firmas:** Espacio para firma manuscrita en las 3 copias
- **eCMR:** Futuro — firma electrónica cualificada + sello de tiempo

### Diferencias Nacional vs CMR

| Aspecto               | Carta de Porte Nacional | CMR Internacional                        |
| --------------------- | ----------------------- | ---------------------------------------- |
| Base legal            | Ley 15/2009 (LCTTM)     | Convenio CMR 1956                        |
| Ámbito                | España                  | Países firmantes CMR                     |
| Campos aduaneros      | No                      | Sí                                       |
| Nº ejemplares         | 3                       | 3                                        |
| Umbral obligatoriedad | >€150                   | Siempre (internacional)                  |
| Campos específicos    | NIF español, LOTT       | Instrucciones aduaneras, países tránsito |
