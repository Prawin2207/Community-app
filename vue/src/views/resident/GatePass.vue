<template>
  <div class="p-4 space-y-6">
    <!-- Header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
      <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      <div class="relative flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Fast-Track Entry</p>
          <h1 class="text-2xl font-black leading-tight">Pre-Approved Gate Passes</h1>
          <p class="text-sm opacity-80 mt-1">Generate 6-digit codes to share with expected guests.</p>
        </div>
        <Key class="w-16 h-16 opacity-30 drop-shadow-lg hidden sm:block" />
      </div>
    </div>

    <!-- Stats & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex gap-4">
        <div class="bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100 flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Key class="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Active Passes</p>
            <p class="text-xl font-black text-indigo-900">{{ activeCount }}</p>
          </div>
        </div>
      </div>
      <button @click="showPassForm = true" class="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow flex items-center gap-2">
        <Plus class="w-5 h-5" /> Generate Pass
      </button>
    </div>

    <!-- Active List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="pass in sortedPasses" :key="pass.ROWID || pass.id" 
        class="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col relative"
        :class="pass.status === 'Active' ? 'border-emerald-200' : 'border-slate-100 opacity-70'">
        
        <div class="p-5 flex-1 relative z-10">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="font-black text-slate-800 text-lg">{{ pass.visitorName }}</p>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{{ pass.purpose }}</p>
            </div>
            <span :class="['px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest', pass.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500']">
              {{ pass.status }}
            </span>
          </div>

          <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center mt-3">
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Entry Code</p>
            <p class="text-3xl font-black tracking-widest" :class="pass.status === 'Active' ? 'text-indigo-600' : 'text-slate-400 line-through'">{{ pass.passCode }}</p>
          </div>
        </div>

        <div class="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold relative z-10">
          <span>Valid Date: {{ pass.validityDate || 'Today' }}</span>
          <button v-if="pass.status === 'Active'" @click="expirePass(pass.ROWID)" class="text-rose-500 hover:underline">Revoke</button>
        </div>
      </div>
    </div>
    
    <div v-if="!loading && passes.length === 0" class="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
      <Key class="w-12 h-12 text-slate-200 mx-auto mb-3" />
      <h3 class="font-bold text-slate-500">No active gate passes</h3>
      <p class="text-xs text-slate-400 mt-1">Generate a code to expedite entry for your expected guests.</p>
    </div>

    <!-- Registration Modal -->
    <div v-if="showPassForm" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 class="font-extrabold text-slate-800 flex items-center gap-2"><Key class="w-5 h-5 text-indigo-500"/> New Gate Pass</h2>
          <button @click="showPassForm = false" class="text-slate-400 hover:text-slate-600"><X class="w-5 h-5"/></button>
        </div>
        <form @submit.prevent="submitPass" class="p-5 space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Guest Name</label>
            <input v-model="form.visitorName" type="text" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="e.g. Swiggy Delivery">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Purpose</label>
              <select v-model="form.purpose" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>Delivery</option>
                <option>Guest</option>
                <option>Service</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Date</label>
              <input v-model="form.validityDate" type="date" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            </div>
          </div>
          <div class="pt-4 flex gap-3">
            <button type="button" @click="showPassForm = false" class="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">Cancel</button>
            <button type="submit" class="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition" :disabled="submitting">
              {{ submitting ? 'Generating...' : 'Generate Code' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Key, Plus, X } from 'lucide-vue-next'
import { useGatePassesStore } from '../../stores/gatePassesStore'
import { useAuthStore } from '../../stores/authStore'

const passStore = useGatePassesStore()
const authStore = useAuthStore()

const loading = computed(() => passStore.isLoading)
const passes = computed(() => passStore.items)

const sortedPasses = computed(() => {
  return [...passes.value].sort((a, b) => {
    if (a.status === 'Active' && b.status !== 'Active') return -1;
    if (a.status !== 'Active' && b.status === 'Active') return 1;
    return 0;
  });
})

const activeCount = computed(() => passes.value.filter(p => p.status === 'Active').length)

const showPassForm = ref(false)
const submitting = ref(false)

// Set default date to today
const today = new Date().toISOString().split('T')[0]
const form = ref({ visitorName: '', purpose: 'Delivery', validityDate: today })

onMounted(() => {
  const residentId = authStore.currentUser?.ROWID || authStore.currentUser?.id
  passStore.fetchAll({ residentId })
})

async function submitPass() {
  submitting.value = true
  const residentId = authStore.currentUser?.ROWID || authStore.currentUser?.id
  
  await passStore.create({
    visitorName: form.value.visitorName,
    purpose: form.value.purpose,
    validityDate: form.value.validityDate,
    residentId: residentId
  })
  
  submitting.value = false
  showPassForm.value = false
  form.value = { visitorName: '', purpose: 'Delivery', validityDate: today }
}

async function expirePass(id) {
  if (confirm("Revoke this gate pass immediately?")) {
    await passStore.update(id, { status: 'Expired' })
  }
}
</script>
