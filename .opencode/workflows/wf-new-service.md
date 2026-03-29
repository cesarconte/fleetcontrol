---
description: Workflow — Nuevo Servicio API (Supabase)
---

Genera un servicio API siguiendo el patrón estándar de FleetControl.
Ninguna operación de Supabase se escribe directamente en componentes o stores.

---

## Paso 1 — Definir el servicio

- ¿Qué tabla de Supabase gestiona?
- ¿Necesita CRUD básico o operaciones custom?
- ¿Hay relaciones con otras tablas (JOINs, foreign keys)?
- ¿Necesita paginación server-side?
- ¿Necesita filtros específicos?
- ¿Necesita suscripción Realtime?

---

## Paso 2 — Crear el servicio base

Usar `createCrudService` como base:

```javascript
// src/services/api-[entity].js
import { createCrudService } from './create-crud-service'
import { supabase } from '@/plugins/supabase'
import { mapSupabaseError } from '@/utils/error-map'

const base = createCrudService('[tabla]', { orderBy: 'created_at' })

export const apiEntity = {
  ...base,
  // Custom queries only — base CRUD is inherited
}
```

---

## Paso 3 — Implementar paginación obligatoria

Toda lista debe soportar paginación server-side:

```javascript
async getPaginated({ page = 1, pageSize = 25, filters = {}, sort = {} } = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  let query = supabase
    .from('[tabla]')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order(sort.col || 'created_at', { ascending: sort.asc ?? false })

  // Aplicar filtros
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.search) query = query.ilike('name', `%${filters.search}%`)
  if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
  if (filters.dateTo) query = query.lte('created_at', filters.dateTo)

  const { data, error, count } = await query
  if (error) throw mapSupabaseError(error)
  return { data, total: count, page, pageSize }
}
```

---

## Paso 4 — Implementar operaciones custom si aplica

```javascript
async getById(id) {
  const { data, error } = await supabase
    .from('[tabla]')
    .select('*, related_table(*)') // JOIN si aplica
    .eq('id', id)
    .single()
  if (error) throw mapSupabaseError(error)
  return data
},

async create(payload) {
  const { data, error } = await supabase
    .from('[tabla]')
    .insert(payload)
    .select()
    .single()
  if (error) throw mapSupabaseError(error)
  return data
},

async update(id, payload) {
  const { data, error } = await supabase
    .from('[tabla]')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw mapSupabaseError(error)
  return data
},

async remove(id) {
  const { error } = await supabase
    .from('[tabla]')
    .delete()
    .eq('id', id)
  if (error) throw mapSupabaseError(error)
}
```

---

## Paso 5 — Realtime (si aplica)

Solo para tablas Tier 1: `alerts`, `routes`, `vehicles`, `drivers`

```javascript
subscribe(onData, onError) {
  return supabase
    .channel('[tabla]_changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: '[tabla]' },
      (payload) => onData(payload)
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') onError(new Error('Conexión perdida'))
    })
}
```

---

## Paso 6 — Error mapping

Nunca errores crudos al UI:

```javascript
// utils/error-map.js
// 23505 → "Este registro ya existe"
// PGRST116 → "No encontrado"
// 42501 → "Sin permisos para esta acción"
// Network → "Error de conexión. Inténtelo de nuevo."
```

---

## Paso 7 — Tests del servicio (TDD)

```javascript
import { apiEntity } from '../api-[entity]'
import { supabase } from '@/plugins/supabase'

vi.mock('@/plugins/supabase')

describe('api[Entity]', () => {
  describe('getPaginated', () => {
    it('debería devolver datos paginados con total', async () => { })
    it('debería aplicar filtros correctamente', async () => { })
    it('debería aplicar ordenación', async () => { })
    it('debería lanzar error mapeado cuando Supabase falla', async () => { })
  })

  describe('create', () => {
    it('debería crear un registro y devolverlo', async () => { })
    it('debería lanzar error de duplicado (23505)', async () => { })
  })

  describe('update', () => {
    it('debería actualizar y devolver el registro', async () => { })
    it('debería actualizar updated_at automáticamente', async () => { })
  })

  describe('remove', () => {
    it('debería eliminar el registro', async () => { })
    it('debería lanzar error si no tiene permisos (42501)', async () => { })
  })
})
```

---

## Entrega

1. `src/services/api-[entity].js` — servicio completo
2. `src/services/api-[entity].spec.js` — tests
3. Si la tabla es nueva: crear migración SQL (usar workflow wf-new-migration.md)
