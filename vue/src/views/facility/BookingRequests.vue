<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="page-title">Booking Requests</h1>
      <p class="text-sm text-slate-500 mt-1">{{ pendingCount }} pending requests</p>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        :class="['px-4 py-2 text-sm font-medium rounded-xl transition-colors', activeTab === tab.value ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50']"
      >
        {{ tab.label }}
        <span v-if="tab.count !== undefined" :class="['ml-1 text-xs px-1.5 py-0.5 rounded-full', activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500']">
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Booking Cards -->
    <div class="space-y-4">
      <div
        v-for="booking in filteredBookings"
        :key="booking.ROWID || booking.id"
        class="card hover:shadow-card-hover transition-shadow"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap mb-2">
              <span class="badge bg-primary-50 text-primary-700 ring-1 ring-primary-200">{{ booking.facility }}</span>
              <StatusBadge :status="booking.status" />
            </div>
            <p class="font-bold text-slate-800">{{ booking.resident }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ booking.apartment }}</p>
            <div class="grid grid-cols-2 gap-x-4 mt-3 text-xs text-slate-600">
              <div>📅 <span class="font-medium">{{ booking.date }}</span></div>
              <div>⏰ <span class="font-medium">{{ booking.timeSlot }}</span></div>
              <div class="mt-1">🎯 <span class="font-medium">{{ booking.purpose }}</span></div>
              <div class="mt-1">👥 <span class="font-medium">{{ booking.guests }} guests</span></div>
            </div>
            <p class="text-xs text-slate-400 mt-2">Requested: {{ booking.requestDate }}</p>
          </div>

          <!-- Actions for Pending -->
          <div v-if="booking.status === 'pending'" class="flex gap-2 flex-shrink-0">
            <button @click="data.approveBooking(booking.ROWID || booking.id)" class="btn-success text-xs py-2">
              ✓ Approve
            </button>
            <button @click="data.rejectBooking(booking.ROWID || booking.id)" class="btn-danger text-xs py-2">
              ✗ Reject
            </button>
          </div>
        </div>
      </div>
      <div v-if="!filteredBookings.length" class="text-center py-10 text-sm text-slate-400">
        No {{ activeTab }} requests
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBookingsStore } from '../../stores/bookingsStore'
import StatusBadge from '../../components/StatusBadge.vue'

const data = useBookingsStore()
const activeTab = ref('pending')

onMounted(() => {
  data.fetchAll()
})

const pendingCount = computed(() => data.items.filter(b => b.status === 'pending').length)

const tabs = computed(() => [
  { label: 'Pending', value: 'pending', count: pendingCount.value },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
])

const filteredBookings = computed(() => data.items.filter(b => b.status === activeTab.value))
</script>
