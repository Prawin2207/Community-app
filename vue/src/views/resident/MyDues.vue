<template>
  <div class="p-6 space-y-6">
    <h1 class="page-title">My Dues</h1>

    <!-- Summary Banner -->
    <div class="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 text-white">
      <p class="text-sm font-medium opacity-80">Total Outstanding</p>
      <p class="text-3xl font-bold mt-1">₹{{ pendingDuesTotal.toLocaleString() }}</p>
      <p class="text-sm opacity-75 mt-1">{{ pendingCount }} pending {{ pendingCount === 1 ? 'invoice' : 'invoices' }}</p>
      <button @click="payAll" :disabled="isPaying || pendingCount === 0" class="mt-4 px-5 py-2 bg-white text-amber-700 font-bold text-sm rounded-xl hover:bg-amber-50 disabled:opacity-50 transition-colors shadow-sm">
        {{ isPaying && !payingId ? 'Processing...' : 'Pay Now (Mock)' }}
      </button>
    </div>

    <!-- Invoice List -->
    <div class="space-y-3">
      <div
        v-for="inv in myInvoices"
        :key="inv.id"
        class="card hover:shadow-card-hover transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-slate-800">{{ inv.month }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ inv.type }} &bull; {{ inv.id }}</p>
            <p class="text-xs text-slate-400 mt-0.5">Due: {{ inv.dueDate }}</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-slate-800">₹{{ inv.amount.toLocaleString() }}</p>
            <StatusBadge :status="inv.status" class="mt-1" />
          </div>
        </div>
        <div v-if="inv.status === 'pending' || inv.status === 'overdue'" class="mt-4 pt-3 border-t border-slate-100">
          <button @click="paySingle(inv)" :disabled="isPaying" class="btn-primary text-xs py-1.5 disabled:opacity-50">
            {{ isPaying && payingId === inv.id ? 'Processing...' : `Pay ₹${inv.amount.toLocaleString()}` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useInvoicesStore } from '../../stores/invoicesStore'
import StatusBadge from '../../components/StatusBadge.vue'

const auth = useAuthStore()
const data = useInvoicesStore()

onMounted(() => {
  data.fetchAll()
})

const myInvoices = computed(() => {
  // Use apartment for filtering if resident name is not available
  const apt = auth.currentUser?.apartment
  const userId = auth.currentUser?.ROWID || auth.currentUser?.id
  return data.items.filter(i => {
    const isMine = i.apartment === apt || i.residentId === userId
    return isMine && (!i.payerResponsibility || i.payerResponsibility === 'Resident')
  })
})

const pendingDuesTotal = computed(() => {
  return myInvoices.value.filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.amount, 0)
})

const pendingCount = computed(() => {
  return myInvoices.value.filter(i => i.status === 'pending' || i.status === 'overdue').length
})

const isPaying = ref(false)
const payingId = ref(null)

async function paySingle(inv) {
  isPaying.value = true
  payingId.value = inv.id
  await new Promise(r => setTimeout(r, 600)) // Artificial payment delay
  await data.payInvoice(inv.ROWID || inv.id)
  isPaying.value = false
  payingId.value = null
}

async function payAll() {
  if (pendingCount.value === 0) return
  isPaying.value = true
  payingId.value = null
  await new Promise(r => setTimeout(r, 800)) // Artificial payment delay
  await data.payAllPending()
  isPaying.value = false
}
</script>
