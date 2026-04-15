<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Payroll</h1>
        <p class="text-sm text-slate-500 mt-1">Salary records and payment history</p>
      </div>
      <button @click="showAddModal = true" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
        <Plus class="w-4 h-4" /> Generate Payroll
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div v-if="hrStore.loading" class="p-10 text-center animate-pulse text-slate-400">Syncing payroll records...</div>
      <div v-else-if="hrStore.payroll.length === 0" class="p-10 text-center text-slate-400">No payroll records found</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Staff</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Month</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
            <th class="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th class="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="p in displayPayroll" :key="p.ROWID" class="hover:bg-slate-50 transition-colors">
            <td class="px-5 py-3">
              <div class="font-medium text-slate-700">{{ p.staffName }}</div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">{{ p.staffDept }}</div>
            </td>
            <td class="px-5 py-3 text-slate-600">{{ p.payrollmonth }}</td>
            <td class="px-5 py-3 text-slate-500">{{ p.payrolldate }}</td>
            <td class="px-5 py-3 text-right font-bold text-slate-800">₹{{ p.amount.toLocaleString() }}</td>
            <td class="px-5 py-3">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="p.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">{{ p.status }}</span>
            </td>
            <td class="px-5 py-3 text-center">
              <button v-if="p.status !== 'Paid'" @click="hrStore.updatePayrollStatus(p.ROWID, 'Paid')" class="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">Mark Paid</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Generate Payroll Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="showAddModal = false"></div>
      <div class="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <h2 class="text-xl font-bold text-slate-800 mb-6">Generate Payroll</h2>
        <div class="space-y-4">
          <div>
            <label class="label text-[10px]">Select Staff</label>
            <select v-model="newRecord.staffId" class="input">
              <option v-for="s in hrStore.staff" :key="s.ROWID" :value="s.ROWID">{{ s.name }} ({{ s.dept }})</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label text-[10px]">Month</label>
              <input v-model="newRecord.month" type="text" class="input" placeholder="January 2024" />
            </div>
            <div>
              <label class="label text-[10px]">Date</label>
              <input v-model="newRecord.payrolldate" type="date" class="input" />
            </div>
          </div>
          <div>
            <label class="label text-[10px]">Amount</label>
            <input v-model="newRecord.amount" type="number" class="input" placeholder="25000" />
          </div>
          <div class="flex gap-3 mt-2">
            <button @click="showAddModal = false" class="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">
              Cancel
            </button>
            <button @click="generatePayroll" :disabled="isSubmitting" class="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all">
              {{ isSubmitting ? 'Generating...' : 'Confirm Payment' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useHrStore } from '../../stores/hrStore'

const hrStore = useHrStore()
const showAddModal = ref(false)
const isSubmitting = ref(false)

const newRecord = ref({
  staffId: '',
  amount: '',
  month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
  payrolldate: new Date().toISOString().split('T')[0],
  status: 'Pending'
})

onMounted(() => hrStore.fetchAll())

const displayPayroll = computed(() => {
  return hrStore.payroll.map(p => {
    const s = hrStore.staff.find(staff => staff.ROWID === p.staffId)
    return {
      ...p,
      staffName: s ? s.name : 'Unknown Staff',
      staffDept: s ? s.dept : 'N/A'
    }
  })
})

async function generatePayroll() {
  if (!newRecord.value.staffId || !newRecord.value.amount) return
  isSubmitting.value = true
  try {
    await hrStore.generatePayroll(newRecord.value)
    showAddModal.value = false
    newRecord.value = {
      staffId: '',
      amount: '',
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      payrolldate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    }
  } catch (err) {
    alert('Failed to generate payroll record: ' + (err.response?.data?.error || err.message))
  } finally {
    isSubmitting.value = false
  }
}
</script>
