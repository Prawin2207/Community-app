<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="page-title">Facility Dashboard</h1>
      <p class="text-sm text-slate-500 mt-1">Overview of all facilities</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Facilities" :value="facilitiesStore.items.length" :icon="Building2" color="indigo" />
      <StatCard label="Available" :value="facilitiesStore.items.filter(f=>f.status==='available').length" :icon="CheckCircle" color="emerald" />
      <StatCard label="Pending Bookings" :value="bookingsStore.items.filter(b=>b.status==='pending').length" :icon="BookOpen" color="amber" />
      <StatCard label="Maintenance" :value="maintenanceStore.items.filter(t=>t.status==='pending' || t.status==='in_progress').length" :icon="Wrench" color="rose" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Facility Usage (%)" type="doughnut" :data="chartData.facilityUsage" height="h-56"
        :options="{ plugins: { legend: { position: 'right' } }, scales: {} }" />

      <!-- Facility Status Quick View -->
      <div class="card">
        <h3 class="section-title">Facilities Status</h3>
        <div class="space-y-2">
          <div
            v-for="f in facilitiesStore.items"
            :key="f.ROWID || f.id"
            class="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
          >
            <div class="flex items-center gap-2">
              <span class="text-base">{{ facilityEmoji(f.type) }}</span>
              <p class="text-sm font-medium text-slate-700">{{ f.name }}</p>
            </div>
            <StatusBadge :status="f.status" />
          </div>
          <div v-if="facilitiesStore.items.length === 0" class="text-center py-4 text-xs text-slate-400">No facilities found</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useFacilitiesStore } from '../../stores/facilitiesStore'
import { useBookingsStore } from '../../stores/bookingsStore'
import { useMaintenanceStore } from '../../stores/maintenanceStore'
import { chartData } from '../../data/mockData'
import StatCard from '../../components/StatCard.vue'
import ChartCard from '../../components/ChartCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { Building2, CheckCircle, BookOpen, Wrench } from 'lucide-vue-next'

const facilitiesStore = useFacilitiesStore()
const bookingsStore = useBookingsStore()
const maintenanceStore = useMaintenanceStore()

onMounted(() => {
  facilitiesStore.fetchAll()
  bookingsStore.fetchAll()
  maintenanceStore.fetchAll()
})

function facilityEmoji(type) {
  const map = { Recreation: '🏊', Events: '🏛️', Fitness: '💪', Sports: '🏸', Kids: '🧒' }
  return Object.entries(map).find(([k]) => (type || '').toLowerCase().includes(k.toLowerCase()))?.[1] || '🏢'
}
</script>
