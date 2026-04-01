<template>
  <ReportChartCard :title="title" :option="chartOption" :height="height" />
</template>

<script setup>
import { computed } from 'vue'
import ReportChartCard from './ReportChartCard.vue'

const props = defineProps({
  title: { type: String, default: '' },
  data: { type: Array, default: () => [] },
  doughnut: { type: Boolean, default: false },
  height: { type: String, default: '300px' },
})

const chartOption = computed(() => ({
  series: [
    {
      type: 'pie',
      radius: props.doughnut ? ['40%', '70%'] : '65%',
      data: props.data.map(d => ({ name: d.name, value: d.value })),
      label: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } },
    },
  ],
}))
</script>
