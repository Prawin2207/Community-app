<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Active Deliveries</h1>
        <p class="text-sm text-slate-500 mt-1">{{ deliveryStore.items.length }} deliveries in progress</p>
      </div>
      <button @click="showLogModal = true" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
        <Plus class="w-4 h-4" /> Log Delivery
      </button>
    </div>

    <div class="space-y-3">
      <div v-if="deliveryStore.loading" class="p-10 text-center animate-pulse text-slate-400">Syncing deliveries...</div>
      <div v-else-if="activeDeliveries.length === 0" class="p-10 text-center text-slate-400">No active deliveries at the gate</div>
      <div v-for="d in activeDeliveries" :key="d.ROWID" class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Package class="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 class="font-semibold text-slate-800">{{ d.Deliveriessupplier }}</h3>
              <p class="text-xs text-slate-400 mt-0.5">For: {{ d.resident }} · {{ d.apartment }}</p>
            </div>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusClass(d.status)">{{ d.status }}</span>
        </div>
        <div class="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <span>🕐 Arrived: {{ new Date(d.CREATEDTIME).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
          <span>📦 {{ d.type }}</span>
        </div>
        <div class="mt-3 flex gap-2">
          <button @click="deliveryStore.updateStatus(d.ROWID, 'delivered')" class="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">Mark Delivered</button>
          <button @click="deliveryStore.updateStatus(d.ROWID, 'notified')" class="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition-colors">Notify Resident</button>
        </div>
      </div>
    </div>

    <!-- Log Delivery Modal -->
    <div v-if="showLogModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showLogModal = false"></div>
      <div class="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <h2 class="text-xl font-bold text-slate-800 mb-6 font-display">Log Incoming Delivery</h2>
        <div class="space-y-4">
          <div>
            <label class="label text-[10px]">Supplier / Courier</label>
            <input v-model="newDelivery.Deliveriessupplier" type="text" class="input" placeholder="Amazon, Swiggy, etc." />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label text-[10px]">Resident Name</label>
              <input v-model="newDelivery.resident" type="text" class="input" placeholder="Priya Sharma" />
            </div>
            <div>
              <label class="label text-[10px]">Apartment</label>
              <input v-model="newDelivery.apartment" type="text" class="input" placeholder="B-204" />
            </div>
          </div>
          <div>
            <label class="label text-[10px]">Delivery Type</label>
            <select v-model="newDelivery.type" class="input">
              <option>Package (Small)</option>
              <option>Package (Medium)</option>
              <option>Package (Large)</option>
              <option>Groceries</option>
              <option>Food Delivery</option>
              <option>Other</option>
            </select>
          </div>
          <button @click="logDelivery" :disabled="isSubmitting" class="w-full mt-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all">
            {{ isSubmitting ? 'Logging...' : 'Confirm Arrival' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Package, Plus } from 'lucide-vue-next'
import { useDeliveryStore } from '../../stores/deliveryStore'

const deliveryStore = useDeliveryStore()
const showLogModal = ref(false)
const isSubmitting = ref(false)
const newDelivery = ref({ Deliveriessupplier: '', resident: '', apartment: '', type: 'Package (Medium)', status: 'awaiting_pickup' })

onMounted(() => deliveryStore.fetchAll())

const activeDeliveries = computed(() => deliveryStore.items.filter(d => d.status !== 'delivered'))

function statusClass(s) {
  const status = (s || '').toLowerCase().replace(' ', '_')
  return {
    'awaiting_pickup': 'bg-amber-100 text-amber-700',
    'in_lobby': 'bg-indigo-100 text-indigo-700',
    'notified': 'bg-cyan-100 text-cyan-700',
    'delivered': 'bg-emerald-100 text-emerald-700',
  }[status] || 'bg-slate-100 text-slate-600'
}

async function logDelivery() {
  if (!newDelivery.value.Deliveriessupplier || !newDelivery.value.resident) return
  isSubmitting.value = true
  try {
    await deliveryStore.logDelivery(newDelivery.value)
    showLogModal.value = false
    newDelivery.value = { Deliveriessupplier: '', resident: '', apartment: '', type: 'Package (Medium)', status: 'awaiting_pickup' }
  } catch (err) {
    alert('Failed to log delivery')
  } finally {
    isSubmitting.value = false
  }
}
</script>
