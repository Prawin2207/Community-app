<template>
  <div class="p-4 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Maintenance Notification</h1>
        <p class="text-xs text-slate-500 mt-0.5">Send monthly maintenance reminders to owners, tenants or both</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Send Form -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h2 class="font-extrabold text-slate-800 text-lg">Send Notification</h2>

        <div class="space-y-4">
          <!-- Target: All flats or specific flat -->
          <div>
            <label class="label">Target Flats</label>
            <div class="flex gap-3">
              <button @click="targetMode = 'all'" :class="['flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all', targetMode === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300']">
                All Flats
              </button>
              <button @click="targetMode = 'specific'" :class="['flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all', targetMode === 'specific' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300']">
                Specific Flat
              </button>
            </div>
          </div>

          <div v-if="targetMode === 'specific'">
            <label class="label">Select Flat</label>
            <select v-model="form.flatId" class="input">
              <option value="">— Select Flat —</option>
              <option v-for="f in flatsStore.items" :key="f.ROWID" :value="f.ROWID">
                {{ f.flatNumber }} ({{ f.bhk }}, {{ f.sqft }} sq.ft)
              </option>
            </select>
          </div>

          <!-- Send To -->
          <div>
            <label class="label">Send To</label>
            <div class="flex gap-3">
              <button v-for="opt in sendToOptions" :key="opt.value"
                @click="form.sentTo = opt.value"
                :class="['flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all', form.sentTo === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300']">
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Month</label>
              <input v-model="form.month" class="input" placeholder="e.g. March 2025" />
            </div>
            <div>
              <label class="label">Due Date</label>
              <input v-model="form.dueDate" type="date" class="input" />
            </div>
          </div>

          <!-- Amount display -->
          <div>
            <label class="label">Maintenance Amount (₹)</label>
            <div class="relative">
              <input v-model="form.amount" type="number" class="input pl-8 font-bold text-indigo-700" placeholder="Auto or custom" />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
            </div>
            <p v-if="targetMode === 'specific' && selectedFlat" class="text-[10px] text-slate-400 mt-1">
              Auto: ₹{{ computedAmount }} ({{ selectedFlat.sqft }} sq.ft × ₹{{ selectedFlat.maintenanceRate }}/sqft)
              <button @click="form.amount = computedAmount" class="text-indigo-500 underline ml-1">Use this</button>
            </p>
          </div>

          <div>
            <label class="label">Message / Notes</label>
            <textarea v-model="form.notes" class="input h-20 resize-none" placeholder="Optional message to include..."></textarea>
          </div>

          <div v-if="sendError" class="text-sm text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{{ sendError }}</div>
          <div v-if="sendSuccess" class="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">✓ Notification sent successfully!</div>

          <button @click="sendNotification" :disabled="isSending" class="btn-primary w-full flex items-center justify-center gap-2">
            <Bell class="w-4 h-4" />
            {{ isSending ? 'Sending...' : 'Send Notification' }}
          </button>
        </div>
      </div>

      <!-- History Panel -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col max-h-[600px]">
        <h2 class="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
          <ClipboardList class="w-4 h-4 text-slate-400" /> Sent History
        </h2>
        <div v-if="notifStore.isLoading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
        </div>
        <div v-else-if="!notifStore.items.length" class="flex-1 flex items-center justify-center text-sm text-slate-400">No notifications sent yet.</div>
        <div v-else class="space-y-3 overflow-y-auto flex-1 pr-1">
          <div v-for="n in notifStore.items" :key="n.ROWID" class="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
            <div class="flex items-center justify-between">
              <p class="text-xs font-bold text-slate-800">{{ n.month }}</p>
              <span class="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md font-bold capitalize">{{ n.sentTo }}</span>
            </div>
            <p class="text-xs font-semibold text-emerald-600 mt-1">₹{{ n.amount }}</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Due: {{ n.dueDate }}</p>
            <p v-if="n.notes" class="text-[10px] text-slate-400 italic">{{ n.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bell, ClipboardList } from 'lucide-vue-next'
import { useFlatsStore } from '../../stores/flatsStore'
import { useMaintenanceNotifStore } from '../../stores/maintenanceNotifStore'

const flatsStore = useFlatsStore()
const notifStore = useMaintenanceNotifStore()

const targetMode = ref('all')
const sendToOptions = [
  { label: 'Owner', value: 'owner' },
  { label: 'Tenant', value: 'tenant' },
  { label: 'Both', value: 'both' },
]

const form = ref({ flatId: '', sentTo: 'both', month: '', dueDate: '', amount: '', notes: '' })
const isSending = ref(false)
const sendError = ref('')
const sendSuccess = ref(false)

const selectedFlat = computed(() => targetMode.value === 'specific' && form.value.flatId
  ? flatsStore.items.find(f => f.ROWID === form.value.flatId)
  : null
)

const computedAmount = computed(() => {
  if (!selectedFlat.value) return ''
  return ((parseFloat(selectedFlat.value.sqft) || 0) * (parseFloat(selectedFlat.value.maintenanceRate) || 0)).toFixed(2)
})

onMounted(() => {
  flatsStore.fetchAll()
  notifStore.fetchAll()
})

async function sendNotification() {
  sendError.value = ''
  sendSuccess.value = false
  if (!form.value.sentTo || !form.value.amount || !form.value.dueDate || !form.value.month) {
    sendError.value = 'Please fill in: send to, month, due date, and amount.'
    return
  }
  isSending.value = true
  const payload = {
    sentTo: form.value.sentTo,
    amount: parseFloat(form.value.amount),
    dueDate: form.value.dueDate,
    month: form.value.month,
    notes: form.value.notes,
    sentByAdmin: 'Admin',
  }
  if (targetMode.value === 'specific' && form.value.flatId) {
    payload.flatId = form.value.flatId
  }
  const res = await notifStore.sendNotification(payload)
  isSending.value = false
  if (res.success) {
    sendSuccess.value = true
    form.value = { flatId: '', sentTo: 'both', month: '', dueDate: '', amount: '', notes: '' }
    setTimeout(() => (sendSuccess.value = false), 3000)
  } else {
    sendError.value = res.error || 'Failed to send notification.'
  }
}
</script>
