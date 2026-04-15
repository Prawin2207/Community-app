<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="page-title">Security Dashboard</h1>
      <p class="text-sm text-slate-500 mt-1">Real-time gate monitoring</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Visitors Today" :value="data.items.length" :icon="Users" color="indigo" />
      <StatCard label="Currently Inside" :value="insideCount" :icon="ShieldCheck" color="emerald" />
      <StatCard label="Waiting Approval" :value="waitingCount" :icon="Clock" color="amber" />
      <StatCard label="Exited Today" :value="exitedCount" :icon="LogOut" color="rose" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Visitors This Week" type="bar" :data="chartData.visitorsChart" height="h-52" />

      <!-- Live Visitor Status -->
      <div class="card">
        <h3 class="section-title">Current Visitors</h3>
        <div class="space-y-3">
          <div
            v-for="v in data.items.filter(v => (v.status || '').toLowerCase() === 'inside')"
            :key="v.ROWID || v.id"
            class="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100"
          >
            <div class="w-9 h-9 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-sm font-bold">
              {{ v.name ? v.name.split(' ').map(n=>n[0]).join('').slice(0,2) : '?' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-slate-800">{{ v.name }}</p>
              <p class="text-xs text-slate-500">{{ v.hostApartment || v.apartment }} &bull; In: {{ v.entryTime }}</p>
            </div>
            <StatusBadge status="inside" />
          </div>
          <div v-if="!data.items.filter(v=>v.status==='inside').length" class="text-center py-6 text-sm text-slate-400">
            No visitors currently inside
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useVisitorsStore } from '../../stores/visitorsStore'
import { chartData } from '../../data/mockData'
import StatCard from '../../components/StatCard.vue'
import ChartCard from '../../components/ChartCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { Users, ShieldCheck, Clock, LogOut } from 'lucide-vue-next'

const data = useVisitorsStore()

onMounted(() => {
  data.fetchAll()
})

const insideCount = computed(() => data.items.filter(v => (v.status || '').toLowerCase() === 'inside').length)
const waitingCount = computed(() => data.items.filter(v => (v.status || 'pending').toLowerCase() === 'pending').length)
const exitedCount = computed(() => data.items.filter(v => (v.status || '').toLowerCase() === 'exited').length)
</script>
