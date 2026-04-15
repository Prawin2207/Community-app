<template>
  <div class="p-4 space-y-6">
    <!-- Welcome Header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
      <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      <div class="relative flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Property Owner</p>
          <h1 class="text-2xl font-black leading-tight">Welcome, {{ ownerName }}</h1>
          <p class="text-sm opacity-80 mt-1">Managing your property at CommunityHub Pro</p>
        </div>
        <div v-if="ownerFlats.length > 0" class="bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/30 hidden sm:block">
          <p class="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Select Property</p>
          <select v-model="selectedFlatId" class="bg-transparent border-none text-white font-bold text-lg focus:ring-0 cursor-pointer outline-none w-32 appearance-none">
            <option v-for="f in ownerFlats" :key="f.ROWID" :value="f.ROWID" class="text-slate-800">
              Flat {{ f.flatNumber }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Flat Detail Card -->
    <div v-if="myFlat" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h2 class="font-extrabold text-slate-800 mb-3 flex items-center gap-2">
        <Home class="w-4 h-4 text-indigo-500" /> My Flat
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div v-for="d in flatDetails" :key="d.label" class="bg-slate-50 rounded-xl p-3 text-center">
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ d.label }}</p>
          <p class="text-lg font-black text-slate-800 mt-1">{{ d.value }}</p>
        </div>
      </div>
    </div>
    <div v-else-if="!flatsLoading" class="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-700 text-sm font-medium">
      No flat assigned to your account yet. Contact the admin.
    </div>

    <!-- Current Residents -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-extrabold text-slate-800 flex items-center gap-2"><User class="w-4 h-4 text-indigo-500" /> Current Residents</h2>
        <router-link to="/owner/tenants" class="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">Manage →</router-link>
      </div>
      <div v-if="activeResidents.length > 0" class="space-y-3">
        <div v-for="res in activeResidents" :key="res.id" class="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
          <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <User class="w-5 h-5 text-indigo-600" />
          </div>
          <div class="flex-1">
            <p class="font-bold text-slate-800">{{ res.name }} <span class="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded ml-1">{{ res.type }}</span></p>
            <p class="text-xs text-slate-500">{{ res.email }} · {{ res.phone }}</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] text-slate-400 font-bold uppercase">Move-in</p>
            <p class="text-xs font-semibold text-slate-600">{{ res.joinDate }}</p>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-slate-400 py-4 text-center">No active residents. <router-link to="/owner/tenants" class="text-indigo-500 font-bold">Add one →</router-link></div>
    </div>

    <!-- Maintenance & History Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <router-link v-if="settingsStore.rulesEnabled" to="/owner/rules" class="group bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
          <Bell class="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <p class="font-bold text-slate-800">Rules & Regulations</p>
          <p class="text-xs text-slate-500 mt-0.5">View community guidelines</p>
        </div>
      </router-link>
      <router-link to="/owner/history" :class="['group bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all flex items-center gap-4', !settingsStore.rulesEnabled ? 'md:col-span-2' : '']">
        <div class="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition-colors">
          <ClipboardList class="w-6 h-6 text-violet-600" />
        </div>
        <div>
          <p class="font-bold text-slate-800">View Flat History</p>
          <p class="text-xs text-slate-500 mt-0.5">Owner & resident timeline</p>
        </div>
      </router-link>
    </div>

    <!-- Owner Dues Card -->
    <div v-if="myFlat && settingsStore.invoicingEnabled" class="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white flex items-center justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-widest opacity-80">Pending Owner Dues</p>
        <p class="text-3xl font-black mt-1">₹{{ pendingOwnerDues.toLocaleString() }}</p>
        <p class="text-xs opacity-70 mt-1">{{ ownerInvoices.length }} pending invoice(s)</p>
      </div>
      
      <div class="text-right">
        <button @click="payOwnerMaintenance" :disabled="isPaying || pendingOwnerDues === 0" class="block bg-white text-indigo-600 text-sm font-bold px-4 py-2 rounded-xl shadow cursor-pointer hover:bg-slate-50 transition-colors disabled:opacity-50">
          {{ isPaying ? 'Processing...' : (pendingOwnerDues > 0 ? 'Pay Now' : 'All Clear') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Home, User, Bell, ClipboardList, IndianRupee } from 'lucide-vue-next'
import { useFlatsStore } from '../../stores/flatsStore'
import { useResidentsStore } from '../../stores/residentsStore'
import { useAuthStore } from '../../stores/authStore'
import { useInvoicesStore } from '../../stores/invoicesStore'
import { useSettingsStore } from '../../stores/settingsStore'

const flatsStore = useFlatsStore()
const residentsStore = useResidentsStore()
const authStore = useAuthStore()
const invoicesStore = useInvoicesStore()
const settingsStore = useSettingsStore()
const flatsLoading = ref(true)

const ownerName = computed(() => authStore.user?.name || 'Owner')

const ownerFlats = computed(() => flatsStore.items)
const selectedFlatId = ref(null)

const myFlat = computed(() => {
  if (selectedFlatId.value) return ownerFlats.value.find(f => f.ROWID === selectedFlatId.value)
  return ownerFlats.value[0] || null
})

const flatDetails = computed(() => myFlat.value ? [
  { label: 'Flat', value: myFlat.value.flatNumber },
  { label: 'BHK', value: myFlat.value.bhk },
  { label: 'Sq.ft', value: myFlat.value.sqft },
  { label: 'Status', value: (myFlat.value.status || '').replace('_', ' ') },
] : [])

const ownerInvoices = computed(() => {
  return invoicesStore.items.filter(i => 
    i.apartment === myFlat.value?.flatNumber && 
    i.payerResponsibility === 'Owner' &&
    (i.status === 'pending' || i.status === 'overdue')
  )
})

const pendingOwnerDues = computed(() => {
  return ownerInvoices.value.reduce((sum, inv) => sum + inv.amount, 0)
})

const activeResidents = computed(() =>
  residentsStore.items.filter(r => r.apartment === myFlat.value?.flatNumber && r.status === 'active')
)

const isPaying = ref(false)
async function payOwnerMaintenance() {
  if (isPaying.value || pendingOwnerDues.value === 0) return
  isPaying.value = true
  
  // Pay all pending invoices for the owner
  for (const inv of ownerInvoices.value) {
    await invoicesStore.payInvoice(inv.ROWID || inv.id)
  }

  isPaying.value = false
  alert(`Successfully processed owner dues payment for Flat ${myFlat.value.flatNumber}`)
}

onMounted(async () => {
  await flatsStore.fetchAll()
  await invoicesStore.fetchAll()
  flatsLoading.value = false
  if (myFlat.value) {
    selectedFlatId.value = myFlat.value.ROWID
    await residentsStore.fetchAll()
  }
})

import { watch } from 'vue'
watch(selectedFlatId, async (newVal) => {
  if (newVal) {
    await residentsStore.fetchAll()
  }
})
</script>
