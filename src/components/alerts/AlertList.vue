<template>
  <div>
    <!-- Filters bar -->
    <VCard class="mb-4">
      <VCardText>
        <VRow density="comfortable">
          <VCol cols="12" sm="3">
            <VSelect
              v-model="filterType"
              :items="typeOptions"
              label="Tipo"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="alerts-filter-type"
              @update:model-value="applyFilters"
            />
          </VCol>
          <VCol cols="6" sm="2">
            <VSelect
              v-model="filterSeverity"
              :items="severityOptions"
              label="Severidad"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="alerts-filter-severity"
              @update:model-value="applyFilters"
            />
          </VCol>
          <VCol cols="6" sm="2">
            <VSelect
              v-model="filterRead"
              :items="readOptions"
              label="Estado"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="alerts-filter-read"
              @update:model-value="applyFilters"
            />
          </VCol>
          <VCol cols="6" sm="3">
            <VTextField
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Buscar por título"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="alerts-search"
              @update:model-value="debouncedSearch"
            />
          </VCol>
          <VCol cols="6" sm="2" class="d-flex align-center">
            <VBtn
              variant="outlined"
              block
              data-testid="alerts-reset-filters"
              @click="handleResetFilters"
            >
              Limpiar
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Table (desktop) -->
    <VCard class="d-none d-md-block">
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="tablePage"
        :headers="headers"
        :items="items"
        :items-length="total"
        :loading="isLoading"
        hover
        data-testid="alerts-table"
      >
        <template #item.alert_type="{ item }">
          <VChip :color="getAlertTypeColor(item.alert_type)" size="small" variant="tonal">
            <VIcon start size="small">{{ getAlertTypeIcon(item.alert_type) }}</VIcon>
            {{ getAlertTypeLabel(item.alert_type) }}
          </VChip>
        </template>

        <template #item.severity="{ item }">
          <VChip :color="getAlertSeverityColor(item.severity)" size="small" variant="flat">
            {{ getAlertSeverityLabel(item.severity) }}
          </VChip>
        </template>

        <template #item.title="{ item }">
          <span :class="{ 'text-medium-emphasis': item.is_read }">
            {{ item.title }}
          </span>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #item.status="{ item }">
          <VChip v-if="item.is_dismissed" color="grey" size="small" variant="tonal">
            Silenciada
          </VChip>
          <VChip v-else-if="item.is_read" color="success" size="small" variant="tonal">Leída</VChip>
          <VChip v-else color="primary" size="small" variant="flat">Nueva</VChip>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            v-if="!item.is_read"
            icon="mdi-check"
            size="small"
            variant="text"
            data-testid="alerts-mark-read"
            aria-label="Marcar como leída"
            @click.stop="$emit('markAsRead', item.id)"
          />
          <VBtn
            v-if="!item.is_dismissed"
            icon="mdi-bell-off-outline"
            size="small"
            variant="text"
            data-testid="alerts-dismiss"
            aria-label="Silenciar alerta"
            @click.stop="$emit('openDismiss', item)"
          />
          <VBtn
            icon="mdi-delete-outline"
            size="small"
            variant="text"
            color="error"
            data-testid="alerts-delete"
            aria-label="Eliminar alerta"
            @click.stop="$emit('remove', item.id)"
          />
        </template>

        <template #loading>
          <VSkeletonLoader type="table-row@5" />
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <VIcon size="64" color="grey" class="mb-4">mdi-bell-check-outline</VIcon>
            <p class="text-body-1 text-medium-emphasis">No hay alertas que mostrar</p>
          </div>
        </template>
      </VDataTableServer>
    </VCard>

    <!-- Cards (mobile) -->
    <div class="d-md-none">
      <VSkeletonLoader v-if="isLoading" type="card@3" />
      <template v-else>
        <VCard
          v-for="item in items"
          :key="item.id"
          class="mb-3"
          :class="{ 'border-s-warning': !item.is_read }"
          data-testid="alerts-card"
        >
          <VCardText>
            <div class="d-flex justify-space-between align-start mb-2">
              <VChip :color="getAlertSeverityColor(item.severity)" size="small" variant="flat">
                {{ getAlertSeverityLabel(item.severity) }}
              </VChip>
              <span class="text-caption text-medium-emphasis">
                {{ formatDate(item.created_at) }}
              </span>
            </div>
            <p class="text-body-2 font-weight-medium mb-1">
              {{ item.title }}
            </p>
            <p class="text-caption text-medium-emphasis mb-2">
              {{ getAlertTypeLabel(item.alert_type) }}
            </p>
            <div class="d-flex ga-1">
              <VBtn
                v-if="!item.is_read"
                size="small"
                variant="tonal"
                color="success"
                data-testid="alerts-card-mark-read"
                @click="$emit('markAsRead', item.id)"
              >
                <VIcon start size="small">mdi-check</VIcon>
                Leer
              </VBtn>
              <VBtn
                v-if="!item.is_dismissed"
                size="small"
                variant="tonal"
                color="warning"
                data-testid="alerts-card-dismiss"
                @click="$emit('openDismiss', item)"
              >
                <VIcon start size="small">mdi-bell-off-outline</VIcon>
                Silenciar
              </VBtn>
            </div>
          </VCardText>
        </VCard>

        <div v-if="items.length === 0" class="text-center pa-8">
          <VIcon size="64" color="grey" class="mb-4">mdi-bell-check-outline</VIcon>
          <p class="text-body-1 text-medium-emphasis">No hay alertas que mostrar</p>
        </div>

        <VPagination
          v-if="totalPages > 1"
          v-model="tablePage"
          :length="totalPages"
          :total-visible="5"
          class="mt-4"
          data-testid="alerts-pagination"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  getAlertTypeLabel,
  getAlertTypeIcon,
  getAlertTypeColor,
  getAlertSeverityLabel,
  getAlertSeverityColor,
  ALERT_TYPE_VALUES,
  ALERT_SEVERITY_VALUES,
} from '@/constants/alert-types.js'

const props = defineProps({
  items: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  isLoading: { type: Boolean, default: false },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 25 },
  totalPages: { type: Number, default: 1 },
})

const emit = defineEmits([
  'setPage',
  'setFilters',
  'resetFilters',
  'markAsRead',
  'openDismiss',
  'remove',
])

const filterType = ref(null)
const filterSeverity = ref(null)
const filterRead = ref(null)
const searchQuery = ref('')
const itemsPerPage = ref(25)

const tablePage = computed({
  get: () => props.page,
  set: val => emit('setPage', val),
})

const headers = [
  { title: 'Tipo', key: 'alert_type', sortable: false },
  { title: 'Severidad', key: 'severity', sortable: true },
  { title: 'Título', key: 'title', sortable: false },
  { title: 'Fecha', key: 'created_at', sortable: true },
  { title: 'Estado', key: 'status', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

const typeOptions = ALERT_TYPE_VALUES.map(v => ({
  title: getAlertTypeLabel(v),
  value: v,
}))

const severityOptions = ALERT_SEVERITY_VALUES.map(v => ({
  title: getAlertSeverityLabel(v),
  value: v,
}))

const readOptions = [
  { title: 'No leídas', value: 'unread' },
  { title: 'Leídas', value: 'read' },
  { title: 'Silenciadas', value: 'dismissed' },
]

let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(applyFilters, 300)
}

function applyFilters() {
  const f = {}
  if (filterType.value) f.alert_type = filterType.value
  if (filterSeverity.value) f.severity = filterSeverity.value
  if (filterRead.value === 'unread') {
    f.is_read = false
    f.is_dismissed = false
  } else if (filterRead.value === 'read') {
    f.is_read = true
  } else if (filterRead.value === 'dismissed') {
    f.is_dismissed = true
  }
  emit('setFilters', f)
}

function handleResetFilters() {
  filterType.value = null
  filterSeverity.value = null
  filterRead.value = null
  searchQuery.value = ''
  emit('resetFilters')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

watch(
  () => props.page,
  val => {
    tablePage.value = val
  },
)
</script>
