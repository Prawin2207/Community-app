<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="page-title">Facility & Assets</h1>
        <p class="text-sm text-slate-500 mt-1">Manage community amenities and track asset preventive maintenance.</p>
      </div>
      
      <!-- Tab Navigation -->
      <div class="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        <button 
          @click="activeTab = 'amenities'" 
          :class="['px-4 py-2 text-sm font-bold rounded-lg transition-all', activeTab === 'amenities' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
        >
          Amenities
        </button>
        <button 
          @click="activeTab = 'assets'" 
          :class="['px-4 py-2 text-sm font-bold rounded-lg transition-all', activeTab === 'assets' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
        >
          Assets & PM
        </button>
      </div>
    </div>

    <!-- Amenities Grid -->
    <div v-if="activeTab === 'amenities'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="facility in data.items"
        :key="facility.ROWID || facility.id"
        class="card hover:shadow-card-hover transition-all duration-200 flex flex-col h-full border-slate-100"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-xl shadow-inner">
            {{ facilityEmoji(facility.type) }}
          </div>
          <span :class="['px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-widest', facility.status === 'available' ? 'bg-emerald-100 text-emerald-700' : (facility.status === 'booked' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700')]">
            {{ facility.status }}
          </span>
        </div>
        <h3 class="font-bold text-slate-800">{{ facility.name }}</h3>
        <p class="text-xs text-slate-400 mt-0.5 mb-3 uppercase font-bold tracking-widest">{{ facility.type }} &bull; Capacity: {{ facility.capacity }}</p>
        <div class="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
          <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" />
          </svg>
          {{ facility.timings }}
        </div>
        <!-- Booked Slots -->
        <div v-if="facility.bookedSlots && facility.bookedSlots.length" class="mb-6">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Booked Slots Today</p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="slot in facility.bookedSlots"
              :key="slot"
              class="text-[10px] px-2 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200"
            >{{ slot }}</span>
          </div>
        </div>
        <div v-else class="mb-6">
          <p class="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            No active bookings today
          </p>
        </div>
        <div class="flex gap-2 mt-auto">
          <select
            :value="facility.status"
            @change="e => updateFacilityStatus(facility, e.target.value)"
            class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="available">Make Available</option>
            <option value="booked">Mark Booked</option>
            <option value="maintenance">Send to Maintenance</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Assets & PM View -->
    <div v-if="activeTab === 'assets'">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-sm font-bold uppercase tracking-widest text-slate-500">Preventive Maintenance Engine</h2>
        <button @click="showAssetForm = true" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Register Asset
        </button>
      </div>

      <div class="card p-0 overflow-hidden border-slate-200">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                <th class="p-4">Asset UID</th>
                <th class="p-4">Name / Location</th>
                <th class="p-4">Category</th>
                <th class="p-4">Next PM Date</th>
                <th class="p-4">Maintenance Status</th>
                <th class="p-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-if="assetsStore.isLoading" class="animate-pulse">
                <td colspan="6" class="p-8 text-center text-slate-400">Loading PM schedule...</td>
              </tr>
              <tr v-else-if="assetsStore.items.length === 0">
                <td colspan="6" class="p-12 text-center text-slate-400">
                  <Wrench class="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  No assets registered for PM tracking.
                </td>
              </tr>
              <tr v-for="asset in sortedAssets" :key="asset.ROWID" class="hover:bg-slate-50 transition">
                <td class="p-4 text-xs font-black text-indigo-600">{{ String(asset.ROWID).slice(0, 8) || 'MOCK-1A' }}</td>
                <td class="p-4">
                  <p class="font-bold text-slate-800 text-sm">{{ asset.name }}</p>
                  <p class="text-[10px] text-slate-500 font-semibold mt-0.5">{{ asset.location }}</p>
                </td>
                <td class="p-4">
                  <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{{ asset.category }}</span>
                </td>
                <td class="p-4">
                  <span :class="['text-xs font-bold inline-flex items-center gap-1.5', isOverdue(asset.nextPMDate) ? 'text-rose-600' : 'text-slate-700']">
                    {{ asset.nextPMDate }}
                    <AlertTriangle v-if="isOverdue(asset.nextPMDate)" class="w-3.5 h-3.5 text-rose-500" />
                  </span>
                </td>
                <td class="p-4">
                  <button 
                    @click="togglePMStatus(asset)" 
                    :class="['px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition', asset.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200']"
                  >
                    {{ asset.status || 'Healthy' }}
                  </button>
                </td>
                <td class="p-4 flex items-center justify-end gap-2">
                  <button @click="markPMComplete(asset)" title="Log PM Complete" class="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg transition">
                    <CheckCircle class="w-4 h-4" />
                  </button>
                  <button @click="deleteAsset(asset.ROWID)" title="Remove Asset" class="text-rose-400 hover:bg-rose-50 p-2 rounded-lg transition">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Asset Registration Modal -->
    <div v-if="showAssetForm" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 class="font-extrabold text-slate-800">Register New Asset</h2>
          <button @click="showAssetForm = false" class="text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <form @submit.prevent="submitAsset" class="p-5 space-y-4">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Asset Name</label>
            <input v-model="form.name" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Tower A - Elevator 1">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Category</label>
              <select v-model="form.category" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none">
                <option>Elevators</option>
                <option>Pumps & Motors</option>
                <option>Generators</option>
                <option>Fire Safety</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Location</label>
              <input v-model="form.location" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" placeholder="e.g. Block B Basement">
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Initial Next PM Date</label>
            <input v-model="form.nextPMDate" type="date" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none">
          </div>
          <div class="pt-2 flex gap-3">
            <button type="submit" class="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Register Asset' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { AlertTriangle, CheckCircle, Trash2, Wrench } from 'lucide-vue-next'
import { useFacilitiesStore } from '../../stores/facilitiesStore'
import { useAssetsStore } from '../../stores/assetsStore'

const data = useFacilitiesStore()
const assetsStore = useAssetsStore()
const activeTab = ref('amenities')
const showAssetForm = ref(false)
const submitting = ref(false)

const today = new Date().toISOString().split('T')[0]
const form = ref({ name: '', category: 'Elevators', location: '', nextPMDate: today, status: 'Healthy' })

onMounted(() => {
  data.fetchAll()
  assetsStore.fetchAll()
})

async function updateFacilityStatus(facility, newStatus) {
  // Simple update logic
  Object.assign(facility, { status: newStatus })
  // Backend store logic stub: await data.updateStatus({ ROWID: facility.ROWID || facility.id, status: newStatus })
}

const sortedAssets = computed(() => {
  return [...assetsStore.items].sort((a, b) => new Date(a.nextPMDate) - new Date(b.nextPMDate))
})

function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date(today)
}

async function submitAsset() {
  submitting.value = true
  await assetsStore.create({ ...form.value })
  submitting.value = false
  showAssetForm.value = false
  form.value = { name: '', category: 'Elevators', location: '', nextPMDate: today, status: 'Healthy' }
}

async function togglePMStatus(asset) {
  const newStatus = asset.status === 'Healthy' ? 'Needs Service' : 'Healthy'
  await assetsStore.update(asset.ROWID, { status: newStatus })
}

async function markPMComplete(asset) {
  if (confirm("Reset PM schedule interval (add 30 days)?")) {
    const nextDate = new Date(asset.nextPMDate)
    nextDate.setDate(nextDate.getDate() + 30) // standard 30 day bump
    await assetsStore.update(asset.ROWID, { 
      status: 'Healthy', 
      nextPMDate: nextDate.toISOString().split('T')[0] 
    })
  }
}

async function deleteAsset(id) {
  if(confirm("Remove this asset from tracking entirely?")) {
    await assetsStore.remove(id)
  }
}

function facilityEmoji(type) {
  const map = { Recreation: '🏊', Events: '🏛️', Fitness: '💪', Sports: '🏸', Kids: '🧒' }
  return Object.entries(map).find(([k]) => (type || '').toLowerCase().includes(k.toLowerCase()))?.[1] || '🏢'
}
</script>
