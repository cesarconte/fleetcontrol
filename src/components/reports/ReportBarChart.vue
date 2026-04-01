<template>
  <ReportChartCard :title="title" :option="chartOption" :height="height" />
</template>

<script setup>
import { computed } from 'vue'
import ReportChartCard from './ReportChartCard.vue'

const props = defineProps({
  title: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
  series: { type: Array, default: () => [] },
  horizontal: { type: Boolean, default: false },
  height: { type: String, default: '300px' },
})

const chartOption = computed(() => ({
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: props.horizontal ? 'value' : 'category',
    data: props.horizontal ? undefined : props.categories,
    axisLabel: { color: 'rgba(255,255,255,0.6)' },
  },
  yAxis: {
    type: props.horizontal ? 'category' : 'value',
    data: props.horizontal ? props.categories : undefined,
    axisLabel: { color: 'rgba(255,255,255,0.6)' },
  },
  series: props.series.map(s => ({
    type: 'bar',
    ...s,
    itemStyle: { borderRadius: [4, 4, 0, 0], ...s.itemStyle },
  })),
}))
</script>
