<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="page-title">My Dashboard</h1>
      <p class="text-sm text-slate-500 mt-1">Welcome back, {{ auth.currentUser?.name }} — {{ auth.currentUser?.apartment }}</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard v-if="settingsStore.invoicingEnabled" label="Pending Dues" :value="`₹${pendingDuesTotal.toLocaleString()}`" :icon="Wallet" color="amber" />
      <StatCard v-if="settingsStore.complaintsEnabled" label="Active Complaints" :value="myComplaints.length" :icon="MessageSquare" color="rose" />
      <StatCard label="Latest Notices" :value="noticesStore.items.length" :icon="Bell" color="violet" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- My Dues Summary -->
      <div v-if="settingsStore.invoicingEnabled" class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="section-title mb-0">My Dues</h3>
          <RouterLink to="/resident/dues" class="text-xs font-semibold text-primary-600 hover:text-primary-700">View all →</RouterLink>
        </div>
        <div class="space-y-3">
          <div v-for="inv in myInvoices.slice(0, 2)" :key="inv.ROWID || inv.id"
            :class="['flex items-center justify-between p-3 rounded-xl border', inv.status === 'paid' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100']">
            <div>
              <p class="text-sm font-bold text-slate-800">{{ inv.ROWID || inv.id }}</p>
              <p class="text-xs text-slate-500">Due: {{ inv.dueDate }}</p>
            </div>
            <div class="text-right">
              <p :class="['font-bold', inv.status === 'paid' ? 'text-emerald-600' : 'text-rose-600']">₹{{ (inv.amount || 0).toLocaleString() }}</p>
              <StatusBadge :status="inv.status" />
            </div>
          </div>
          <div v-if="myInvoices.length === 0" class="text-center py-4 text-xs text-slate-400">No dues found</div>
        </div>
      </div>

      <!-- Latest Notices -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="section-title mb-0">Latest Notices</h3>
          <RouterLink to="/resident/notices" class="text-xs font-semibold text-primary-600 hover:text-primary-700">View all →</RouterLink>
        </div>
        <div class="space-y-3">
          <div
            v-for="notice in noticesStore.items.slice(0, 3)"
            :key="notice.ROWID || notice.id"
            class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl"
          >
            <div class="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center text-base flex-shrink-0">
              {{ categoryEmoji(notice.category) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-800 truncate">{{ notice.title }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ notice.date }}</p>
            </div>
          </div>
          <div v-if="noticesStore.items.length === 0" class="text-center py-4 text-xs text-slate-400">No notices found</div>
        </div>
      </div>

      <!-- Rent & Maintenance Notices -->
      <div class="card lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h3 class="section-title mb-0">Rent & Maintenance Notices</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="notif in myMaintenanceNotices.slice(0, 4)" :key="notif.ROWID || notif.id"
            class="p-4 rounded-xl border bg-indigo-50 border-indigo-100 flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-bold text-indigo-900">{{ notif.month }}</p>
              <p class="text-xs text-indigo-600 mt-0.5">Due: {{ notif.dueDate }}</p>
              <p v-if="notif.notes" class="text-[10px] text-indigo-400 mt-1 truncate max-w-[200px]">{{ notif.notes }}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">Amount</p>
              <p class="text-lg font-black text-indigo-700">₹{{ notif.amount }}</p>
            </div>
          </div>
          <div v-if="myMaintenanceNotices.length === 0" class="col-span-1 md:col-span-2 text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl">
            No rent or maintenance notices found
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <h3 class="section-title">Quick Actions</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <RouterLink v-if="settingsStore.complaintsEnabled" to="/resident/complaint"
          class="flex flex-col items-center gap-2 p-4 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors group">
          <div class="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center group-hover:bg-rose-200 transition-colors">
            <MessageSquare class="w-5 h-5 text-rose-600" />
          </div>
          <span class="text-xs font-semibold text-rose-700">Raise Complaint</span>
        </RouterLink>
        <RouterLink to="/resident/visitors"
          class="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors group">
          <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
            <Users class="w-5 h-5 text-emerald-600" />
          </div>
          <span class="text-xs font-semibold text-emerald-700">Add Visitor</span>
        </RouterLink>
        <RouterLink v-if="settingsStore.invoicingEnabled" to="/resident/dues"
          class="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-colors group">
          <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
            <Wallet class="w-5 h-5 text-amber-600" />
          </div>
          <span class="text-xs font-semibold text-amber-700">Pay Dues</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useComplaintsStore } from '../../stores/complaintsStore'
import { useInvoicesStore } from '../../stores/invoicesStore'
import { useNoticesStore } from '../../stores/noticesStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useMaintenanceNotifStore } from '../../stores/maintenanceNotifStore'
import StatCard from '../../components/StatCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { Wallet, MessageSquare, Calendar, Bell, Users } from 'lucide-vue-next'

const auth = useAuthStore()
const complaintsStore = useComplaintsStore()
const invoicesStore = useInvoicesStore()
const noticesStore = useNoticesStore()
const settingsStore = useSettingsStore()
const maintenanceNotifStore = useMaintenanceNotifStore()

onMounted(() => {
  const userId = auth.currentUser?.ROWID || auth.currentUser?.id
  complaintsStore.fetchAll({ residentId: userId })
  invoicesStore.fetchAll({ residentId: userId })
  noticesStore.fetchAll()
  settingsStore.fetchSettings()
  maintenanceNotifStore.fetchAll() // Optional: backend scope by flatId later
})

const myInvoices = computed(() => {
  return invoicesStore.items.filter(i => !i.payerResponsibility || i.payerResponsibility === 'Resident')
})

const myComplaints = computed(() => complaintsStore.items)

const pendingDuesTotal = computed(() => {
  return myInvoices.value.filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.amount, 0)
})

const myMaintenanceNotices = computed(() => {
  return maintenanceNotifStore.items.filter(n => n.sentTo === 'tenant' || n.sentTo === 'both')
})

function categoryEmoji(cat) {
  const m = { Meeting: '📋', Maintenance: '🔧', Announcement: '📢', Rules: '📜', Event: '🎉' }
  return m[cat] || '📌'
}
</script>
