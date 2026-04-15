<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Invoice Management</h1>
        <p class="text-sm text-slate-500 mt-1">Create, manage and send invoices to residents</p>
      </div>
      <button @click="showAddModal = true" class="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
        <Plus class="w-4 h-4" /> New Invoice
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2 flex-wrap">
      <button v-for="tab in tabs" :key="tab" @click="activeTab = tab"
        :class="['px-4 py-1.5 rounded-full text-sm font-medium transition-colors', activeTab === tab ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50']">
        {{ tab }}
      </button>
    </div>

    <!-- Invoice Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div v-if="invoicesStore.loading" class="p-10 text-center animate-pulse text-slate-400">Syncing invoices...</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50">
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice ID</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resident</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid By</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-if="filteredInvoices.length === 0">
            <td colspan="7">
              <div class="py-16 text-center flex flex-col items-center justify-center bg-slate-50/30">
                <p class="text-sm font-medium text-slate-400">No invoices match your selection</p>
              </div>
            </td>
          </tr>
          <tr v-else v-for="inv in filteredInvoices" :key="inv.ROWID" class="hover:bg-slate-50 transition-colors">
            <td class="px-5 py-3 font-mono text-xs text-slate-500">#INV-{{ String(inv.ROWID).slice(-5) }}</td>
            <td class="px-5 py-3">
              <p class="font-medium text-slate-700">{{ inv.resident }}</p>
              <p class="text-xs text-slate-400">{{ inv.apartment }}</p>
            </td>
            <td class="px-5 py-3 text-slate-600">{{ inv.type }}</td>
            <td class="px-5 py-3 font-semibold text-slate-800">₹{{ Number(inv.amount || 0).toLocaleString() }}</td>
            <td class="px-5 py-3 text-slate-500">{{ inv.dueDate }}</td>
            <td class="px-5 py-3">
              <span class="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{{ inv.payerResponsibility || 'Resident' }}</span>
            </td>
            <td class="px-5 py-3">
              <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="statusClass(inv.status)">{{ inv.status }}</span>
            </td>
            <td class="px-5 py-3">
              <div class="flex gap-2">
                <button v-if="inv.status === 'pending'" @click="invoicesStore.update(inv.ROWID, { status: 'paid' })" class="text-xs text-teal-600 hover:underline font-medium">Mark Paid</button>
                <button class="text-xs text-slate-400 hover:underline">View</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- New Invoice Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="showAddModal = false"></div>
      <div class="relative bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <h2 class="text-xl font-bold text-slate-800 mb-6 font-display">Create New Invoice</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="label text-[10px]">Select Resident</label>
            <select v-model="selectedResidentId" @change="onResidentSelect" class="input">
              <option value="" disabled>Select a resident...</option>
              <option v-for="r in residentsStore.items" :key="r.ROWID" :value="r.ROWID">
                {{ r.name }} ({{ r.apartment }})
              </option>
            </select>
          </div>
          <div>
            <label class="label text-[10px]">Resident Name (Auto)</label>
            <input v-model="newInvoice.resident" type="text" class="input" readonly />
          </div>
          <div>
            <label class="label text-[10px]">Apartment (Auto)</label>
            <input v-model="newInvoice.apartment" type="text" class="input" readonly />
          </div>
          <div>
            <label class="label text-[10px]">Invoice Type</label>
            <select v-model="newInvoice.type" class="input">
              <option>Maintenance</option>
              <option>Water Charges</option>
              <option>Facility Booking</option>
              <option>Fine/Penalty</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label class="label text-[10px]">Payer Responsibility</label>
            <select v-model="newInvoice.payerResponsibility" class="input">
              <option value="Resident">Resident</option>
              <option value="Owner">Owner</option>
            </select>
          </div>
          <div>
            <label class="label text-[10px]">Amount (₹)</label>
            <input v-model="newInvoice.amount" type="number" class="input" placeholder="2500" />
          </div>
          <div class="col-span-2">
            <label class="label text-[10px]">Due Date</label>
            <input v-model="newInvoice.dueDate" type="date" class="input" />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showAddModal = false" class="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">
            Cancel
          </button>
          <button @click="createInvoice" :disabled="isSubmitting" class="flex-[2] py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-200 transition-all">
            {{ isSubmitting ? 'Creating...' : 'Issue Invoice' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useInvoicesStore } from '../../stores/invoicesStore'
import { useResidentsStore } from '../../stores/residentsStore'

const invoicesStore = useInvoicesStore()
const residentsStore = useResidentsStore()

const tabs = ['All', 'Pending', 'Paid', 'Overdue']
const activeTab = ref('All')
const showAddModal = ref(false)
const isSubmitting = ref(false)

const selectedResidentId = ref('')
const newInvoice = ref({ residentId: '', resident: '', apartment: '', type: 'Maintenance', amount: 0, dueDate: '', status: 'pending', payerResponsibility: 'Resident' })

onMounted(() => {
  invoicesStore.fetchAll()
  residentsStore.fetchAll()
})

function onResidentSelect() {
  const r = residentsStore.items.find(res => res.ROWID === selectedResidentId.value)
  if (r) {
    newInvoice.value.residentId = r.ROWID
    newInvoice.value.resident = r.name
    newInvoice.value.apartment = r.apartment
  }
}

const filteredInvoices = computed(() => {
  if (activeTab.value === 'All') return invoicesStore.items
  return invoicesStore.items.filter(i => i.status?.toLowerCase() === activeTab.value.toLowerCase())
})

function statusClass(status) {
  return {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    overdue: 'bg-rose-100 text-rose-700',
  }[status?.toLowerCase()] || 'bg-slate-100 text-slate-600'
}

async function createInvoice() {
  if (!newInvoice.value.residentId || !newInvoice.value.amount) return
  isSubmitting.value = true
  try {
    await invoicesStore.create(newInvoice.value)
    showAddModal.value = false
    selectedResidentId.value = ''
    newInvoice.value = { residentId: '', resident: '', apartment: '', type: 'Maintenance', amount: 0, dueDate: '', status: 'pending', payerResponsibility: 'Resident' }
  } catch (err) {
    alert('Failed to create invoice: ' + (err.response?.data?.error || err.message))
  } finally {
    isSubmitting.value = false
  }
}
</script>
