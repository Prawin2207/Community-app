<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Accountant Dashboard</h1>
      <p class="text-sm text-slate-500 mt-1">Financial overview for {{ currentMonth }}</p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="stat.iconBg">
            <component :is="stat.icon" class="w-5 h-5" :class="stat.iconColor" />
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="stat.trendClass">{{ stat.trend }}</span>
        </div>
        <p class="text-2xl font-bold text-slate-800">{{ stat.value }}</p>
        <p class="text-sm text-slate-500 mt-0.5">{{ stat.label }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Invoices -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 class="text-base font-semibold text-slate-700 mb-4">Recent Invoices</h2>
        <div v-if="recentInvoices.length === 0" class="py-12 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl text-center flex items-center justify-center">
          <p class="text-sm font-medium text-slate-400">No data available</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="inv in recentInvoices" :key="inv.id" class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <div>
              <p class="text-sm font-medium text-slate-700">{{ inv.resident }}</p>
              <p class="text-xs text-slate-400">{{ inv.type }} · {{ inv.month }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-slate-800">₹{{ inv.amount.toLocaleString() }}</p>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusClass(inv.status)">{{ inv.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Collection Summary -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 class="text-base font-semibold text-slate-700 mb-4">Collection Summary</h2>
        <div class="space-y-4">
          <div v-for="item in collectionSummary" :key="item.label">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-slate-600">{{ item.label }}</span>
              <span class="font-semibold text-slate-800">₹{{ item.amount.toLocaleString() }}</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700" :class="item.barClass" :style="{ width: item.percent + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { Receipt, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { useInvoicesStore } from '../../stores/invoicesStore'

const invoicesStore = useInvoicesStore()

onMounted(() => {
  invoicesStore.fetchAll()
})

const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

const stats = computed(() => {
  const paid = invoicesStore.items.filter(i => (i.status || '').toLowerCase() === 'paid')
  const totalCollected = paid.reduce((sum, i) => sum + (i.amount || 0), 0)
  const pending = invoicesStore.items.filter(i => (i.status || '').toLowerCase() === 'pending')
  const overdue = invoicesStore.items.filter(i => (i.status || '').toLowerCase() === 'overdue')

  return [
    { label: 'Total Collected', value: `₹${(totalCollected / 1000).toFixed(1)}K`, trend: 'Life-time', trendClass: 'bg-emerald-100 text-emerald-700', icon: TrendingUp, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { label: 'Pending Invoices', value: pending.length, trend: 'To collect', trendClass: 'bg-amber-100 text-amber-700', icon: Receipt, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    { label: 'Overdue Dues', value: overdue.length, trend: 'Urgent', trendClass: 'bg-rose-100 text-rose-700', icon: AlertCircle, iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
    { label: 'Total Invoices', value: invoicesStore.items.length, trend: 'Records', trendClass: 'bg-teal-100 text-teal-700', icon: CheckCircle2, iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
  ]
})

const recentInvoices = computed(() => invoicesStore.items.slice(0, 5).map(i => ({
  ...i,
  resident: i.residentName || i.apartment || 'Unknown'
})))

const collectionSummary = computed(() => {
  const types = {}
  invoicesStore.items.forEach(i => {
    const t = i.type || 'General'
    types[t] = (types[t] || 0) + (i.amount || 0)
  })
  const total = Object.values(types).reduce((a,b)=>a+b, 0) || 1
  return Object.entries(types).map(([label, amount]) => ({
    label,
    amount,
    percent: Math.min(100, (amount / total) * 100),
    barClass: 'bg-indigo-500'
  }))
})

function statusClass(status) {
  const s = (status || 'pending').toLowerCase()
  return {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    overdue: 'bg-rose-100 text-rose-700',
  }[s] || 'bg-slate-100 text-slate-600'
}
</script>
