<template>
  <div class="d-flex ga-2">
    <VBtn
      variant="outlined"
      :loading="isExportingPdf"
      data-testid="report-export-pdf"
      @click="handleExportPdf"
    >
      <VIcon start>mdi-file-pdf-box</VIcon>
      PDF
    </VBtn>
    <VBtn
      variant="outlined"
      :loading="isExportingXlsx"
      data-testid="report-export-xlsx"
      @click="handleExportXlsx"
    >
      <VIcon start>mdi-file-excel-outline</VIcon>
      Excel
    </VBtn>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  onExportPdf: { type: Function, required: true },
  onExportXlsx: { type: Function, required: true },
})

const isExportingPdf = ref(false)
const isExportingXlsx = ref(false)

async function handleExportPdf() {
  isExportingPdf.value = true
  try {
    await props.onExportPdf()
  } finally {
    isExportingPdf.value = false
  }
}

async function handleExportXlsx() {
  isExportingXlsx.value = true
  try {
    await props.onExportXlsx()
  } finally {
    isExportingXlsx.value = false
  }
}
</script>
