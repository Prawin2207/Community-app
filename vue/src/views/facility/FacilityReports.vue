<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="page-title">Facility Reports</h1>
      <p class="text-sm text-slate-500 mt-1">Analytics and performance tracking</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Bookings" :value="bookingsStore.items.length" :icon="BookOpen" color="indigo" />
      <StatCard label="Approval Rate" value="72%" :icon="TrendingUp" color="emerald" :trend="5" />
      <StatCard label="Avg Utilization" value="64%" :icon="BarChart2" color="violet" />
      <StatCard label="Issues Resolved" value="12" :icon="CheckCircle" color="amber" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Facility Usage (%)" type="doughnut" :data="chartData.facilityUsage" height="h-64"
        :options="{ plugins: { legend: { position: 'right' } }, scales: {} }" />
      <ChartCard title="Weekly Booking Trend" type="bar" :data="chartData.visitorsChart" height="h-64" />
    </div>

    <!-- Top Used Facilities -->
    <div class="card">
      <h3 class="section-title">Facility Performance</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Facility</th>
              <th class="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Usage</th>
              <th class="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Bookings</th>
              <th class="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="f in facilitiesStore.items" :key="f.ROWID || f.id" class="hover:bg-slate-50">
              <td class="py-3 px-3 font-medium text-slate-800">{{ f.name }}</td>
              <td class="py-3 px-3">
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-slate-100 rounded-full h-1.5">
                    <div class="bg-primary-500 h-1.5 rounded-full" :style="`width: ${Math.floor(Math.random() * 50 + 40)}%`" />
                  </div>
                </div>
              </td>
              <td class="py-3 px-3 text-slate-600">{{ (f.bookedSlots || []).length }}</td>
              <td class="py-3 px-3"><StatusBadge :status="f.status" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useFacilitiesStore } from '../../stores/facilitiesStore'
import { useBookingsStore } from '../../stores/bookingsStore'
import { chartData } from '../../data/mockData'
import StatCard from '../../components/StatCard.vue'
import ChartCard from '../../components/ChartCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { BookOpen, TrendingUp, BarChart2, CheckCircle } from 'lucide-vue-next'

const facilitiesStore = useFacilitiesStore()
const bookingsStore = useBookingsStore()

onMounted(() => {
  facilitiesStore.fetchAll()
  bookingsStore.fetchAll()
})
</script>
