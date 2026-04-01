<template>
  <VCard>
    <VCardTitle v-if="title" class="text-body-1 font-weight-medium">{{ title }}</VCardTitle>
    <VCardText>
      <VChart :option="option" :style="{ height: height }" autoresize />
    </VCardText>
  </VCard>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
])

const props = defineProps({
  title: { type: String, default: '' },
  option: { type: Object, required: true },
  height: { type: String, default: '300px' },
})

const option = computed(() => ({
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'Roboto, sans-serif', color: '#fff' },
  tooltip: {
    backgroundColor: '#2c2c2c',
    borderColor: '#3a3a3a',
    textStyle: { color: '#fff' },
  },
  legend: {
    textStyle: { color: 'rgba(255,255,255,0.7)' },
  },
  ...props.option,
}))
</script>
