<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Payment Tracking</h1>
      <p class="text-sm text-slate-500 mt-1">Monitor all incoming payments in real time</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="s in summaryCards" :key="s.label" class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-500">{{ s.label }}</p>
        <p class="text-2xl font-bold mt-1" :class="s.valueClass">{{ s.value }}</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="text-base font-semibold text-slate-700">Recent Transactions</h2>
      </div>
      <div class="divide-y divide-slate-50">
        <div v-if="invoicesStore.loading" class="p-10 text-center animate-pulse text-slate-400">Loading payments...</div>
        <div v-else-if="paidInvoices.length === 0" class="py-12 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl text-center flex items-center justify-center m-4">
          <p class="text-sm font-medium text-slate-400">No payment records found</p>
        </div>
        <div v-else v-for="pay in paidInvoices" :key="pay.ROWID" class="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
              {{ pay.resident?.[0] || 'R' }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-700">{{ pay.resident }}</p>
              <p class="text-xs text-slate-400">{{ pay.apartment }} · {{ pay.type }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-emerald-600">+₹{{ Number(pay.amount || 0).toLocaleString() }}</p>
            <p class="text-xs text-slate-400">{{ pay.status === 'paid' ? 'Completed' : 'Processing' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useInvoicesStore } from '../../stores/invoicesStore'

const invoicesStore = useInvoicesStore()

onMounted(() => invoicesStore.fetchAll())

const summaryCards = computed(() => [
  { label: 'Total Collections', value: '₹' + invoicesStore.financialStats.totalPaid.toLocaleString(), valueClass: 'text-emerald-600' },
  { label: 'Pending Receivables', value: '₹' + invoicesStore.financialStats.totalPending.toLocaleString(), valueClass: 'text-amber-600' },
  { label: 'Collection Rate', value: Math.round((invoicesStore.financialStats.totalPaid / (invoicesStore.financialStats.totalPaid + invoicesStore.financialStats.totalPending || 1)) * 100) + '%', valueClass: 'text-primary-600' },
])

const paidInvoices = computed(() => invoicesStore.items.filter(i => i.status === 'paid'))
</script>
