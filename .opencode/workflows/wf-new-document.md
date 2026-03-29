---
description: Workflow — Nuevo Documento de Transporte
---

Genera un documento de transporte siguiendo la normativa española/UE.
Cada documento debe cumplir al 100% con la legislación vigente: todos los campos
obligatorios, en el formato correcto, sin omitir ninguno.

---

## Paso 1 — Identificar el documento

| Documento | Base Legal | Referencia |
|---|---|---|
| Carta de Porte CMR | Convenio CMR 1956 | Arts. 5-6 |
| Carta de Porte Nacional | LCTTM (Ley 15/2009) | Arts. 10-12 |
| Documento de Control Digital | Ley 9/2025 + FOM/2861/2012 | Obligatorio 05/10/2026 |
| Albarán de Entrega | Práctica comercial + UNE 56100 | Estándar industria |
| Hoja de Ruta | LOTT / RD 70/2019 | Funcional |
| Nota de Gastos | IRPF + Convenio colectivo | Reembolso |
| Factura de Transporte | RD 1619/2012 + Ley 18/2022 | Fiscal |
| Certificado de Entrega (POD) | LCTTM / práctica | Prueba entrega |
| Documento ADR | ADR 2025 (5.4) + RD 97/2014 | Mercancías peligrosas |
| Declaración de Valor CMR | CMR arts. 24/26 | Si valor > límite |
| Certificado ATP | ATP + RD 635/1984 | Perecederos |
| Packing List | Práctica comercial | Recomendado |
| Ficha de Estiba | RD 551/2020 | Carga pesada |

---

## Paso 2 — Definir el esquema de datos

Cada documento tiene un esquema fijo de campos obligatorios.
Definir como constante en `src/constants/document-[tipo].js`:

```javascript
// src/constants/document-cmr.js
import { Object.freeze } from '@/utils/helpers'

/**
 * Campos obligatorios de la Carta de Porte CMR
 * Conforme Convenio CMR 1956, art. 5
 */
export const CMR_REQUIRED_FIELDS = Object.freeze({
  // Art. 5(1) — Obligaciones del remitente
  lugar: { label: 'Lugar de entrega', type: 'string', required: true },
  fecha: { label: 'Fecha de expedición', type: 'date', required: true },
  nombre_direccion_remitente: { label: 'Nombre y dirección del remitente', type: 'string', required: true },
  nombre_direccion_consignatario: { label: 'Nombre y dirección del consignatario', type: 'string', required: true },
  lugar_entrega: { label: 'Lugar de entrega de la mercancía', type: 'string', required: true },
  fecha_recogida: { label: 'Fecha de recogida', type: 'date', required: true },

  // Art. 5(2) — Información de la mercancía
  marcas_numeros: { label: 'Marcas y números', type: 'string', required: true },
  numero_bultos: { label: 'Número de bultos', type: 'number', required: true },
  modo_embalaje: { label: 'Modo de embalaje', type: 'string', required: true },
  naturaleza_mercancia: { label: 'Naturaleza de la mercancía', type: 'string', required: true },
  peso_bruto_kg: { label: 'Peso bruto (kg)', type: 'number', required: true },
  volumen_m3: { label: 'Volumen (m³)', type: 'number', required: false },

  // Art. 5(3) — Documentos anexos
  documentos_anexos: { label: 'Documentos anexos', type: 'string', required: false },

  // Art. 6 — Obligaciones del porteador
  porteador: { label: 'Nombre y dirección del porteador', type: 'string', required: true },
  reservas_observaciones: { label: 'Reservas y observaciones del porteador', type: 'string', required: false },
  precio_transporte: { label: 'Precio del transporte', type: 'number', required: false },
  reembolso: { label: 'Reembolso', type: 'number', required: false },
  lugar_fecha_firma: { label: 'Lugar y fecha de firma', type: 'string', required: true },
  firma_remitente: { label: 'Firma del remitente', type: 'string', required: true },
  firma_porteador: { label: 'Firma del porteador', type: 'string', required: true },

  // Información adicional
  matricula_vehiculo: { label: 'Matrícula del vehículo', type: 'string', required: true },
  nombre_conductor: { label: 'Nombre del conductor', type: 'string', required: true },
})
```

---

## Paso 3 — Crear el servicio de generación

```javascript
// src/services/document-cmr.js
import { supabase } from '@/plugins/supabase'
import { mapSupabaseError } from '@/utils/error-map'
import { CMR_REQUIRED_FIELDS } from '@/constants/document-cmr'

export const documentCMR = {
  /**
   * Genera una Carta de Porte CMR.
   * Valida que TODOS los campos obligatorios estén presentes.
   *
   * @param {Object} data - Datos del documento
   * @returns {Object} Documento generado con ID
   */
  async generate(data) {
    // Validar campos obligatorios
    const missing = Object.entries(CMR_REQUIRED_FIELDS)
      .filter(([, config]) => config.required && !data[field])
      .map(([field]) => field)

    if (missing.length > 0) {
      throw new Error(`Campos obligatorios faltantes: ${missing.join(', ')}`)
    }

    // Guardar en BD
    const { data: doc, error } = await supabase
      .from('transport_documents')
      .insert({
        type: 'cmr',
        data: data,
        status: 'generated'
      })
      .select()
      .single()

    if (error) throw mapSupabaseError(error)
    return doc
  },

  /**
   * Genera el PDF del documento.
   *
   * @param {string} documentId - ID del documento
   * @returns {Blob} PDF del documento
   */
  async generatePDF(documentId) {
    // Implementar según librería elegida (jsPDF, pdfmake, etc.)
  }
}
```

---

## Paso 4 — Crear el componente de generación

```vue
<!-- src/components/documents/CMRForm.vue -->
<template>
  <VForm ref="formRef" @submit.prevent="handleSubmit">
    <VRow>
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.lugar"
          label="Lugar de entrega"
          :rules="[v => !!v || 'Campo obligatorio']"
          required
        />
      </VCol>
      <!-- ... resto de campos agrupados por sección -->
    </VRow>
  </VForm>
</template>
```

---

## Paso 5 — Tests de compliance normativo

```javascript
describe('Document CMR', () => {
  describe('Campos obligatorios', () => {
    it('debería tener TODOS los campos del art. 5 CMR', () => {
      const art5Fields = ['lugar', 'fecha', 'nombre_direccion_remitente',
        'nombre_direccion_consignatario', 'lugar_entrega', 'fecha_recogida']
      art5Fields.forEach(field => {
        expect(CMR_REQUIRED_FIELDS).toHaveProperty(field)
        expect(CMR_REQUIRED_FIELDS[field].required).toBe(true)
      })
    })

    it('debería tener TODOS los campos de información de mercancía', () => {
      const mercanciaFields = ['marcas_numeros', 'numero_bultos', 'modo_embalaje',
        'naturaleza_mercancia', 'peso_bruto_kg']
      mercanciaFields.forEach(field => {
        expect(CMR_REQUIRED_FIELDS).toHaveProperty(field)
        expect(CMR_REQUIRED_FIELDS[field].required).toBe(true)
      })
    })

    it('debería tener TODOS los campos del art. 6 CMR', () => {
      const art6Fields = ['porteador', 'lugar_fecha_firma', 'firma_remitente', 'firma_porteador']
      art6Fields.forEach(field => {
        expect(CMR_REQUIRED_FIELDS).toHaveProperty(field)
        expect(CMR_REQUIRED_FIELDS[field].required).toBe(true)
      })
    })
  })

  describe('Generación', () => {
    it('debería rechazar campos obligatorios faltantes', async () => {
      await expect(documentCMR.generate({})).rejects.toThrow('Campos obligatorios faltantes')
    })

    it('debería generar el documento con todos los campos', async () => { })
  })
})
```

---

## Entrega

1. `src/constants/document-[tipo].js` — esquema de campos obligatorios
2. `src/services/document-[tipo].js` — servicio de generación
3. `src/components/documents/[Tipo]Form.vue` — formulario de generación
4. `src/services/document-[tipo].spec.js` — tests de compliance normativo
