---
description: Workflow — Operación Supabase
---

Diseña e implementa una operación sobre Supabase siguiendo la arquitectura
de servicios de FleetControl. Ninguna operación de Supabase se escribe
directamente en un componente o store.

---

## Paso 1 — Entender la operación

Antes de escribir código, responder:

- ¿Qué tabla/s están involucradas?
- ¿Es una lectura única, una lista paginada, o una suscripción realtime?
- ¿La operación involucra más de una tabla? (¿necesita transacción?)
- ¿Qué filtros, ordenaciones y paginación aplican?
- ¿Qué campos son necesarios realmente? (no overfetch)
- ¿Qué campos deben validarse antes de escribir?

---

## Paso 2 — Modelado del documento

Documentar el esquema antes de implementar:

```javascript
/**
 * Tabla: [nombre_tabla]
 *
 * Esquema:
 * {
 *   id:          uuid        — gen_random_uuid()
 *   owner_id:    uuid        — referencia a auth.users
 *   name:        text        — requerido, max 100 chars
 *   status:      text        — 'active' | 'inactive' | 'archived'
 *   metadata:    jsonb       — datos adicionales flexibles
 *   created_at:  timestamptz — DEFAULT now()
 *   updated_at:  timestamptz — DEFAULT now()
 * }
 *
 * RLS: habilitado, policies para owner_id = auth.uid()
 * Índices: idx_[tabla]_[columnas]
 */
```

---

## Paso 3 — Implementar la operación en el servicio

Usar `createCrudService` como base y extender solo lo custom:

```javascript
import { createCrudService } from './create-crud-service'
import { supabase } from '@/plugins/supabase'

const base = createCrudService('[tabla]', { orderBy: 'created_at' })

export const apiEntity = {
  ...base,

  async getPaginated({ page = 1, pageSize = 25, filters = {}, sort = {} } = {}) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    let query = supabase
      .from('[tabla]')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order(sort.col || 'created_at', { ascending: sort.asc ?? false })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.search) query = query.ilike('name', `%${filters.search}%`)

    const { data, error, count } = await query
    if (error) throw mapSupabaseError(error)
    return { data, total: count, page, pageSize }
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('[tabla]')
      .select('*')
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
}
```

---

## Paso 4 — Realtime (si aplica)

```javascript
subscribe(onData, onError) {
  return supabase
    .channel('[tabla]_changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: '[tabla]' },
      (payload) => {
        // Procesar payload.eventType: INSERT, UPDATE, DELETE
        onData(payload)
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') onError(new Error('Conexión perdida'))
    })
}
```

---

## Paso 5 — RLS Policies

Para cada operación, verificar las RLS policies:

```sql
-- Policy de lectura
CREATE POLICY "[tabla]_select" ON [tabla]
  FOR SELECT USING (owner_id = auth.uid());

-- Policy de inserción
CREATE POLICY "[tabla]_insert" ON [tabla]
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Policy de actualización
CREATE POLICY "[tabla]_update" ON [tabla]
  FOR UPDATE USING (owner_id = auth.uid());

-- Policy de borrado
CREATE POLICY "[tabla]_delete" ON [tabla]
  FOR DELETE USING (owner_id = auth.uid());
```

---

## Paso 6 — Error mapping

Nunca errores crudos de Supabase al UI:

```javascript
import { mapSupabaseError } from '@/utils/error-map'
// 23505 → "Este registro ya existe"
// PGRST116 → "No encontrado"
// 42501 → "Sin permisos"
// Network → "Error de conexión"
```

---

## Paso 7 — Tests del servicio (TDD)

```javascript
describe('[Entity] API Service', () => {
  describe('getPaginated', () => {
    it('debería devolver datos paginados', async () => { })
    it('debería aplicar filtros correctamente', async () => { })
    it('debería lanzar error mapeado cuando Supabase falla', async () => { })
  })

  describe('create', () => {
    it('debería crear un registro y devolverlo', async () => { })
    it('debería lanzar error de duplicado (23505)', async () => { })
  })
})
```

---

## Entrega

1. Función(es) implementadas en `src/services/api-[entity].js`
2. RLS policies si es una tabla nueva
3. Tests en `src/services/api-[entity].spec.js`
4. Si se necesita un índice nuevo, documentarlo
