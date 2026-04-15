<template>
  <div class="p-6 space-y-6">
    <h1 class="page-title">Facility Schedule</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="facility in facilitiesStore.items"
        :key="facility.ROWID || facility.id"
        class="card"
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl">
            {{ facilityEmoji(facility.type) }}
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-sm">{{ facility.name }}</h3>
            <p class="text-xs text-slate-400">{{ facility.timings }}</p>
          </div>
        </div>

        <div class="space-y-1.5">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Today's Schedule</p>
          <div v-if="facility.bookedSlots && facility.bookedSlots.length">
            <div
              v-for="slot in facility.bookedSlots"
              :key="slot"
              class="flex items-center gap-2 p-2 bg-rose-50 rounded-lg text-xs text-rose-700 border border-rose-100"
            >
              <span class="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0" />
              {{ slot }} — Booked
            </div>
          </div>
          <div v-else class="p-2 bg-emerald-50 rounded-lg text-xs text-emerald-700 border border-emerald-100">
            ✓ No bookings today
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between">
          <StatusBadge :status="facility.status" />
          <span class="text-xs text-slate-400">Cap: {{ facility.capacity }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useFacilitiesStore } from '../../stores/facilitiesStore'
import StatusBadge from '../../components/StatusBadge.vue'

const facilitiesStore = useFacilitiesStore()
onMounted(() => facilitiesStore.fetchAll())

function facilityEmoji(type) {
  const map = { Recreation: '🏊', Events: '🏛️', Fitness: '💪', Sports: '🏸', Kids: '🧒' }
  return Object.entries(map).find(([k]) => type.toLowerCase().includes(k.toLowerCase()))?.[1] || '🏢'
}
</script>
