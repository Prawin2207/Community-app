<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="page-title">Visitor Entry</h1>
        <p class="text-sm text-slate-500 mt-1">Manage gate entries in real time</p>
      </div>
      <button @click="showAddModal = true" class="btn-primary">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Quick Add Visitor
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- QR Scan Placeholder -->
      <div class="card border-2 border-dashed border-emerald-200 bg-emerald-50/40 flex flex-col items-center py-8 gap-3 transition-all duration-300" :class="{'ring-4 ring-emerald-500/20': isScanning}">
        <div class="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center relative overflow-hidden">
          <!-- Scan Line Animation -->
          <div v-if="isScanning" class="absolute inset-0 bg-emerald-400/30 w-full animate-[scan_1.5s_ease-in-out_infinite]" style="height: 2px;"></div>
          <svg class="w-8 h-8 text-emerald-600" :class="{'animate-pulse': isScanning}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 4h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-emerald-800">{{ isScanning ? 'Scanning QR Code...' : 'Scan Visitor QR Code' }}</p>
        <p class="text-xs text-emerald-600 text-center max-w-xs transition-opacity" :class="{'opacity-50': isScanning}">
          Ask pre-registered visitors to show their QR code for quick entry
        </p>
        <button 
          @click="simulateScan" 
          :disabled="isScanning"
          class="border border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider mt-2"
        >
          <svg v-if="!isScanning" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <div v-else class="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          {{ isScanning ? 'Initializing Camera...' : 'Open Camera' }}
        </button>
      </div>
      
      <!-- Manual Code Entry -->
      <div class="card border-2 border-slate-100 flex flex-col items-center py-8 gap-3 justify-center text-center">
        <h3 class="font-extrabold text-slate-800">Enter Gate Pass Code</h3>
        <p class="text-xs text-slate-500 max-w-xs">Enter the 6-digit code provided by the resident</p>
        <div class="flex gap-2 mt-2 w-full max-w-[200px]">
          <input v-model="passCodeInput" type="text" maxlength="6" class="w-full text-center text-2xl tracking-widest font-black bg-slate-50 border border-slate-200 rounded-xl py-3 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="------" />
        </div>
        <button @click="verifyPass" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl text-sm transition mt-2 w-full max-w-[200px]">
          Verify & Allow Entry
        </button>
      </div>
    </div>

    <!-- Recent Logs -->
    <div>
      <h3 class="section-title">🕒 Recent Logs</h3>
      <div class="space-y-3">
        <div
          v-for="v in data.items"
          :key="v.ROWID || v.id"
          class="card border-l-4 border-slate-400"
        >
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-sm font-bold flex-shrink-0">
              {{ v.name.split(' ').map(n=>n[0]).join('').slice(0,2) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-slate-800">{{ v.name }}</p>
              <p class="text-xs text-slate-500">{{ v.phone }} &bull; {{ v.purpose }}</p>
              <p v-if="v.residentId" class="text-xs text-slate-400">Host ID: {{ v.residentId }}</p>
              <p class="text-xs text-slate-400">Date: {{ v.CREATEDTIME ? v.CREATEDTIME.split(' ')[0] : '' }}</p>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button v-if="v.status !== 'inside'" @click="data.updateStatus(v.ROWID || v.id, 'inside')" class="btn-primary text-xs py-1.5 px-3">Check In</button>
              <button v-if="v.status === 'inside'" @click="data.updateStatus(v.ROWID || v.id, 'exited')" class="btn-secondary text-xs py-1.5 px-3">Check Out</button>
            </div>
          </div>
        </div>
        <div v-if="!data.items.length" class="text-center py-6 text-sm text-slate-400">No recent visitor logs</div>
      </div>
    </div>

    <!-- Add Visitor Modal -->
    <ModalComponent v-model="showAddModal" title="Add Visitor" size="md">
      <div class="space-y-4">
        <div>
          <label class="label">Visitor Name *</label>
          <input v-model="form.name" class="input" placeholder="Full name" required />
        </div>
        <div>
          <label class="label">Phone *</label>
          <input v-model="form.phone" class="input" placeholder="+91 99999 00000" />
        </div>
        <div>
          <label class="label">Host Resident ID</label>
          <input v-model="form.residentId" class="input" placeholder="Optional" />
        </div>
        <div>
          <label class="label">Purpose</label>
          <select v-model="form.purpose" class="input">
            <option>Personal</option>
            <option>Delivery</option>
            <option>Work</option>
            <option>Service</option>
          </select>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button @click="showAddModal = false" class="btn-secondary">Cancel</button>
          <button @click="addVisitor" class="btn-primary">Add Visitor</button>
        </div>
      </template>
    </ModalComponent>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useVisitorsStore } from '../../stores/visitorsStore'
import { useGatePassesStore } from '../../stores/gatePassesStore'
import ModalComponent from '../../components/ModalComponent.vue'

const data = useVisitorsStore()
const passStore = useGatePassesStore()
const showAddModal = ref(false)
const isScanning = ref(false)
const passCodeInput = ref('')
const form = ref({ name: '', phone: '', residentId: '', purpose: 'Personal' })

onMounted(() => {
  data.fetchAll()
  passStore.fetchAll()
})

function simulateScan() {
  if (isScanning.value) return
  isScanning.value = true
  
  // Simulate 1.5s camera scan delay
  setTimeout(() => {
    isScanning.value = false
    
    // Pre-fill form simulating data read from QR code
    form.value = { 
      name: 'Priya (QR Pre-Registered)', 
      phone: '9876543210', 
      residentId: '101', 
      purpose: 'Personal' 
    }
    
    // Automatically open the form modal
    showAddModal.value = true
  }, 1500)
}

async function addVisitor() {
  await data.logVisitor({ ...form.value })
  showAddModal.value = false
  form.value = { name: '', phone: '', residentId: '', purpose: 'Personal' }
}

async function verifyPass() {
  if (passCodeInput.value.length !== 6) {
    alert("Please enter a valid 6-digit code.")
    return
  }
  
  const pass = passStore.items.find(p => p.passCode === passCodeInput.value)
  if (!pass) {
    alert("Invalid Gate Pass code.")
    return
  }
  if (pass.status !== 'Active') {
    alert("This pass has already been used or expired.")
    return
  }
  
  // Convert pass to visitor entry
  await data.logVisitor({
    name: pass.visitorName + ' (Pre-Approved)',
    phone: '',
    residentId: pass.residentId,
    purpose: pass.purpose
  })
  
  // Expire the pass
  await passStore.update(pass.ROWID || pass.id, { status: 'Used' })
  
  alert("Visitor Logged Successfully!")
  passCodeInput.value = ''
}
</script>
