<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="page-title">Reports & Analytics</h1>
      <p class="text-sm text-slate-500 mt-1">Community performance overview</p>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Collected" :value="'₹' + totalCollected.toLocaleString()" :icon="TrendingUp" color="emerald" />
      <StatCard label="Resolved Complaints" :value="resolvedCount.toString()" :icon="CheckCircle" color="indigo" />
      <StatCard label="Visitors Today" :value="visitorsToday.toString()" :icon="Users" color="violet" />
      <StatCard label="Pending Dues" :value="'₹' + pendingAmount.toLocaleString()" :icon="AlertCircle" color="amber" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Monthly Collection Trend" type="line" :data="chartData.monthlyCollection" height="h-64" />
      <ChartCard title="Visitor Analytics (Weekly)" type="bar" :data="chartData.visitorsChart" height="h-64" />
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Complaints by Category" type="doughnut" :data="complaintsByCategory" height="h-56"
        :options="{ plugins: { legend: { position: 'right' } }, scales: {} }" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { chartData } from '../../data/mockData'
import StatCard from '../../components/StatCard.vue'
import ChartCard from '../../components/ChartCard.vue'
import { TrendingUp, Clock, Users, AlertCircle, CheckCircle } from 'lucide-vue-next'

import { useComplaintsStore } from '../../stores/complaintsStore'
import { useInvoicesStore } from '../../stores/invoicesStore'
import { useVisitorsStore } from '../../stores/visitorsStore'

const complaintsStore = useComplaintsStore()
const invoicesStore = useInvoicesStore()
const visitorsStore = useVisitorsStore()

onMounted(() => {
  complaintsStore.fetchAll()
  invoicesStore.fetchAll()
  visitorsStore.fetchAll()
})

const totalCollected = computed(() => 
  invoicesStore.items.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0)
)

const pendingAmount = computed(() => 
  invoicesStore.items.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.amount || 0), 0)
)

const resolvedCount = computed(() => 
  complaintsStore.items.filter(c => c.status === 'resolved').length
)

const visitorsToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return visitorsStore.items.filter(v => (v.visitDate || v.date || '').includes(today)).length
})

const complaintsByCategory = computed(() => {
  const counts = {}
  complaintsStore.items.forEach(c => {
    counts[c.category] = (counts[c.category] || 0) + 1
  })
  return {
    labels: Object.keys(counts),
    datasets: [{
      data: Object.values(counts),
      backgroundColor: ['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6']
    }]
  }
})

</script>
