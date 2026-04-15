<template>
  <div class="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold text-slate-700">{{ title }}</h3>
      <slot name="actions" />
    </div>
    <div :class="['w-full', height]">
      <component :is="chartComponent" :data="data" :options="mergedOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'vue-chartjs'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
)

const props = defineProps({
  title: { type: String, required: true },
  type: { type: String, default: 'line' }, // line, bar, doughnut
  data: { type: Object, required: true },
  options: { type: Object, default: () => ({}) },
  height: { type: String, default: 'h-48' },
})

const chartComponent = computed(() => {
  const map = { line: Line, bar: Bar, doughnut: Doughnut }
  return map[props.type] || Line
})

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 10,
        padding: 16,
        font: { size: 11, family: 'Inter' },
        color: '#64748b',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      padding: 10,
      cornerRadius: 8,
      titleFont: { size: 12, family: 'Inter', weight: 'bold' },
      bodyFont: { size: 12, family: 'Inter' },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { font: { size: 11, family: 'Inter' }, color: '#94a3b8', padding: 8 },
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
      border: { display: false, dash: [4, 4] },
      ticks: { font: { size: 11, family: 'Inter' }, color: '#94a3b8', padding: 8 },
    },
  },
}

const mergedOptions = computed(() => ({
  ...defaultOptions,
  ...props.options,
  plugins: { ...defaultOptions.plugins, ...(props.options.plugins || {}) },
}))
</script>
