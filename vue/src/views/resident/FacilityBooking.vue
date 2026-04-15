<template>
  <div class="p-6 space-y-6">
    <h1 class="page-title">Facility Booking</h1>

    <!-- Facilities Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="facility in facilitiesStore.items"
        :key="facility.ROWID || facility.id"
        class="card hover:shadow-card-hover transition-all duration-200"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl">
            {{ facilityEmoji(facility.type) }}
          </div>
          <StatusBadge :status="facility.status" />
        </div>
        <h3 class="font-bold text-slate-800">{{ facility.name }}</h3>
        <p class="text-xs text-slate-400 mt-0.5">{{ facility.type }} &bull; Capacity: {{ facility.capacity }}</p>
        <p class="text-xs text-slate-500 mt-1 mb-4">⏰ {{ facility.timings }}</p>
        <button
          @click="openBooking(facility)"
          :disabled="facility.status === 'maintenance'"
          :class="['w-full btn-primary text-xs justify-center', facility.status === 'maintenance' ? 'opacity-40 cursor-not-allowed' : '']"
        >
          {{ facility.status === 'maintenance' ? 'Under Maintenance' : 'Book Now' }}
        </button>
      </div>
    </div>

    <!-- Booking Modal -->
    <ModalComponent v-model="showModal" :title="`Book ${selectedFacility?.name}`" size="md">
      <div class="space-y-4">
        <div>
          <label class="label">Date *</label>
          <input v-model="form.date" type="date" class="input" :min="today" />
        </div>
        <div>
          <label class="label">Time Slot</label>
          <select v-model="form.timeSlot" class="input">
            <option>7:00 AM - 9:00 AM</option>
            <option>9:00 AM - 11:00 AM</option>
            <option>11:00 AM - 1:00 PM</option>
            <option>2:00 PM - 4:00 PM</option>
            <option>4:00 PM - 6:00 PM</option>
            <option>6:00 PM - 8:00 PM</option>
          </select>
        </div>
        <div>
          <label class="label">Purpose</label>
          <input v-model="form.purpose" class="input" placeholder="Birthday party, meeting, etc." />
        </div>
        <div>
          <label class="label">Expected Guests</label>
          <input v-model="form.guests" type="number" class="input" min="1" placeholder="0" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button @click="showModal = false" class="btn-secondary">Cancel</button>
          <button @click="confirmBooking" class="btn-primary">Submit Request</button>
        </div>
      </template>
    </ModalComponent>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/authStore'
import { useFacilitiesStore } from '../../stores/facilitiesStore'
import { useBookingsStore } from '../../stores/bookingsStore'
import StatusBadge from '../../components/StatusBadge.vue'
import ModalComponent from '../../components/ModalComponent.vue'

const auth = useAuthStore()
const facilitiesStore = useFacilitiesStore()
const bookingsStore = useBookingsStore()
const showModal = ref(false)
const selectedFacility = ref(null)
const today = new Date().toISOString().split('T')[0]
const form = ref({ date: '', timeSlot: '7:00 AM - 9:00 AM', purpose: '', guests: 1 })

onMounted(() => {
  facilitiesStore.fetchAll()
  bookingsStore.fetchAll()
})

function facilityEmoji(type) {
  const map = { Recreation: '🏊', Events: '🏛️', Fitness: '💪', Sports: '🏸', Kids: '🧒' }
  return Object.entries(map).find(([k]) => type.toLowerCase().includes(k.toLowerCase()))?.[1] || '🏢'
}

function openBooking(facility) {
  selectedFacility.value = facility
  showModal.value = true
}

async function confirmBooking() {
  await bookingsStore.create({
    resident: auth.currentUser?.name,
    apartment: auth.currentUser?.apartment,
    facility: selectedFacility.value?.name,
    ...form.value,
  })
  showModal.value = false
  form.value = { date: '', timeSlot: '7:00 AM - 9:00 AM', purpose: '', guests: 1 }
}
</script>
