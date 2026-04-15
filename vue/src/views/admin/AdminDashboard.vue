<template>
  <div class="p-5 space-y-5">
    <!-- Welcome Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-[var(--text-primary)]">
          Good {{ timeOfDay }}, <span class="gradient-text">{{ firstName }}</span> 👋
        </h1>
        <p class="text-sm mt-1 text-[var(--text-muted)]">{{ currentDate }} · Real-time overview</p>
      </div>
      <div class="hidden sm:flex items-center gap-2 px-3 py-2 text-xs"
        style="background: rgba(197,160,117,0.1); border: 1px solid rgba(197,160,117,0.2); color: var(--accent-1);">
        <span class="w-1.5 h-1.5 bg-[var(--accent-1)] animate-pulse"></span>
        Live · 8 roles active
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="Total Residents" :value="residentsStore.items.length" :icon="Users" color="indigo" :trend="5" />
      <StatCard label="Pending Dues" :value="`₹${(pendingDuesTotal/1000).toFixed(1)}K`" :icon="CreditCard" color="amber" :trend="-3" trend-label="collected" />
      <StatCard label="Open Complaints" :value="openComplaintsCount" :icon="MessageSquare" color="rose" :trend="2" />
      
      <div class="glass p-3 flex flex-col justify-center">
        <p class="text-center text-[var(--text-muted)] italic text-[10px]">Real-time monitoring active</p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 glass p-4">
        <p class="text-xs font-bold uppercase tracking-widest mb-4 text-[var(--text-muted)]">Monthly Collection (₹ 000s)</p>
        <ChartCard title="" type="line" :data="dynamicChartData" height="h-48" />
      </div>
      <div class="glass p-4">
        <p class="text-xs font-bold uppercase tracking-widest mb-4 text-[var(--text-muted)]">System Health</p>
        <div class="h-52 flex flex-col items-center justify-center text-center p-6">
          <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
             <div class="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
          </div>
          <p class="text-sm font-bold text-slate-700">All Modules Operational</p>
          <p class="text-[10px] text-slate-400 mt-1">Data synchronization with master registry is current.</p>
        </div>
      </div>
    </div>

    <!-- Bottom row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Recent Complaints -->
      <div class="glass p-4">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-bold text-[var(--text-primary)]">Recent Complaints</p>
          <RouterLink to="/admin/complaints" class="text-xs font-semibold" style="color: var(--accent-1);">View all →</RouterLink>
        </div>
        <div class="space-y-2 mt-4">
          <div v-for="c in recentComplaints" :key="c.ROWID || c.id"
            class="flex items-center gap-4 p-3 transition-all cursor-pointer group hover:bg-[var(--bg-glass-hover)] bg-[var(--bg-glass)] border border-[var(--border-glass)]"
          >
            <StatusBadge :status="c.priority" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate text-[var(--text-primary)]">{{ c.title }}</p>
              <p class="text-xs text-[var(--text-muted)]">{{ c.apartment }} · {{ c.CREATEDTIME || '' }}</p>
            </div>
            <StatusBadge :status="c.status" />
          </div>
          <div v-if="!complaintsStore.items.length" class="text-center py-6 text-sm text-slate-400">
            No complaints found
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="glass p-4">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-bold text-[var(--text-primary)]">Recent Activity</p>
          <span class="text-xs font-semibold" style="color: var(--accent-1);">Live feed</span>
        </div>
        <div class="space-y-3 mt-4 relative before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-[var(--border-glass)]">
          <div
            v-for="v in recentVisitors"
            :key="v.ROWID || v.id"
            class="flex items-start gap-4 p-3 bg-[var(--bg-glass)] border border-[var(--border-glass)]"
          >
            <div>
              <p class="text-sm font-bold text-[var(--text-primary)]">{{ v.name }}</p>
              <p class="text-xs text-[var(--text-muted)]">Visitor for {{ v.hostApartment }} &bull; {{ v.purpose }}</p>
            </div>
          </div>
          <div v-if="!visitorsStore.items.length" class="text-center py-6 text-sm text-slate-400">
            No activity today
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useResidentsStore } from '../../stores/residentsStore'
import { useInvoicesStore } from '../../stores/invoicesStore'
import { useComplaintsStore } from '../../stores/complaintsStore'
import { useVisitorsStore } from '../../stores/visitorsStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { chartData } from '../../data/mockData'
import StatCard from '../../components/StatCard.vue'
import ChartCard from '../../components/ChartCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { Users, CreditCard, MessageSquare } from 'lucide-vue-next'

const residentsStore = useResidentsStore()
const invoicesStore = useInvoicesStore()
const complaintsStore = useComplaintsStore()
const visitorsStore = useVisitorsStore()
const settingsStore = useSettingsStore()

onMounted(() => {
  residentsStore.fetchAll()
  invoicesStore.fetchAll()
  complaintsStore.fetchAll()
  visitorsStore.fetchAll()
  settingsStore.fetchSettings()
})

const firstName = computed(() => 'Admin')
const currentDate = computed(() => new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
const timeOfDay = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
})

const pendingDuesTotal = computed(() => {
  return invoicesStore.items.filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + (i.amount || 0), 0)
})

const dynamicChartData = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const totals = [0, 0, 0, 0, 0, 0]
  invoicesStore.items.forEach(i => {
    if (i.status === 'paid') {
      const mIdx = months.indexOf((i.month || 'Jan').slice(0, 3))
      if (mIdx !== -1) totals[mIdx] += (i.amount || 0) / 1000 // In thousands
    }
  })
  return {
    labels: months,
    datasets: [{
      label: 'Monthly Collection (₹ 000s)',
      data: totals,
      borderColor: '#c5a075',
      backgroundColor: 'rgba(197, 160, 117, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }
})

const openComplaintsCount = computed(() => {
  return complaintsStore.items.filter(c => c.status === 'open' || c.status === 'in_progress').length
})

const recentComplaints = computed(() => complaintsStore.items.slice(0, 3))
const recentVisitors = computed(() => visitorsStore.items.slice(0, 3))
</script>
