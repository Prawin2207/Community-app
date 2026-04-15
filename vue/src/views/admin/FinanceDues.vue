<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="page-title">Finance & Dues</h1>
        <p class="text-sm text-slate-500 mt-1">Track maintenance invoices and collections</p>
      </div>
      <router-link to="/accountant/invoices" class="btn-primary flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all">
        <Plus class="w-4 h-4" /> Create Invoice
      </router-link>
    </div>

    <!-- Summary Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Dues" :value="'₹' + summary.total.toLocaleString()" :icon="FileText" iconColor="text-indigo-500" />
      <StatCard title="Paid" :value="'₹' + summary.paid.toLocaleString()" :icon="CheckCircle" iconColor="text-emerald-500" />
      <StatCard title="Pending" :value="'₹' + summary.pending.toLocaleString()" :icon="Clock" iconColor="text-amber-500" />
      <StatCard title="Overdue" :value="'₹' + summary.overdue.toLocaleString()" :icon="AlertCircle" iconColor="text-rose-500" />
    </div>

    <!-- Main Content -->
    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <div class="card p-0 overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <h2 class="font-semibold text-slate-800">Recent Invoices</h2>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <input v-model="search" type="text" placeholder="Search invoices..." class="search-input w-full sm:w-64" />
              <select v-model="statusFilter" class="form-select bg-white">
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/50 text-slate-500 border-b border-slate-100 text-xs uppercase tracking-wider">
                  <th class="px-5 py-3 font-semibold">Resident</th>
                  <th class="px-5 py-3 font-semibold hidden md:table-cell">Type</th>
                  <th class="px-5 py-3 font-semibold">Amount</th>
                  <th class="px-5 py-3 font-semibold">Status</th>
                  <th class="px-5 py-3 font-semibold hidden sm:table-cell">Due Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="inv in filteredInvoices" :key="inv.id" class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-5 py-4">
                    <div>
                      <p class="text-sm font-medium text-slate-800">{{ inv.resident }}</p>
                      <p class="text-xs text-slate-400">{{ inv.apartment }}</p>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-sm text-slate-600 hidden md:table-cell">{{ inv.type }}</td>
                  <td class="px-5 py-4 text-sm font-bold text-slate-800">₹{{ inv.amount.toLocaleString() }}</td>
                  <td class="px-5 py-4">
                    <div class="flex flex-col gap-1">
                      <StatusBadge :status="inv.status" />
                      <select
                        :value="inv.status"
                        @change="e => updateStatus(inv.ROWID || inv.id, e.target.value)"
                        class="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-sm text-slate-500 hidden sm:table-cell">{{ inv.dueDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Chart -->
      <ChartCard title="Monthly Collection" type="line" :data="dynamicChartData" height="h-64" />
    </div>

    <!-- Disabled State Overlay -->
    <div v-if="!settingsStore.invoicingEnabled" class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
      <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle class="w-10 h-10 text-slate-400" />
      </div>
      <h2 class="text-2xl font-black text-slate-800">Module Disabled</h2>
      <p class="text-slate-500 max-w-sm mt-2">The invoicing and finance module is currently disabled in system settings.</p>
      <button @click="$router.push('/admin/settings')" class="mt-6 btn-primary">Go to Settings</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInvoicesStore } from '../../stores/invoicesStore'
import { useSettingsStore } from '../../stores/settingsStore'
import StatCard from '../../components/StatCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import ChartCard from '../../components/ChartCard.vue'
import { FileText, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-vue-next'

const data = useInvoicesStore()
const settingsStore = useSettingsStore()
const search = ref('')
const statusFilter = ref('')

onMounted(() => {
  data.fetchAll()
})

const filteredInvoices = computed(() => data.items.filter(i => {
  const q = search.value.toLowerCase()
  const resName = (i.resident || i.residentName || '').toLowerCase()
  const apt = (i.apartment || '').toLowerCase()
  return (
      (resName.includes(q) || apt.includes(q)) &&
      (!statusFilter.value || i.status === statusFilter.value)
  )
}))

async function updateStatus(id, newStatus) {
  await data.update({ ROWID: id, status: newStatus })
}

const summary = computed(() => {
  const all = data.items
  return {
    total: all.reduce((sum, i) => sum + (i.amount || 0), 0),
    paid: all.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0),
    pending: all.filter(i => i.status === 'pending').reduce((sum, i) => sum + (i.amount || 0), 0),
    overdue: all.filter(i => i.status === 'overdue').reduce((sum, i) => sum + (i.amount || 0), 0),
  }
})

const dynamicChartData = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const totals = [0, 0, 0, 0, 0, 0]
  
  data.items.forEach(i => {
    if (i.status === 'paid') {
      const mIdx = months.indexOf((i.month || 'Jan').slice(0, 3))
      if (mIdx !== -1) totals[mIdx] += (i.amount || 0)
    }
  })

  return {
    labels: months,
    datasets: [{
      label: 'Monthly Collection',
      data: totals,
      borderColor: '#c5a075',
      backgroundColor: 'rgba(197, 160, 117, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }
})
</script>
