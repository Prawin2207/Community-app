<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Gate Pass Requests</h1>
      <p class="text-sm text-slate-500 mt-1">Approve or deny temporary entry requests</p>
    </div>
    <div class="space-y-3">
      <div v-if="visitorsStore.loading" class="animate-pulse p-10 text-center text-slate-400">Loading requests...</div>
      <div v-else-if="visitorsStore.items.length === 0" class="p-10 text-center text-slate-400">No requests found</div>
      <div v-for="req in visitorsStore.items" :key="req.ROWID" class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-3">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="font-semibold text-slate-800">{{ req.name }}</h3>
            <p class="text-xs text-slate-400 mt-1">{{ req.purpose }} · Host: {{ req.hostResident || 'N/A' }}</p>
            <div class="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span>📅 {{ new Date(req.CREATEDTIME).toLocaleDateString() }}</span>
              <span>🕐 {{ new Date(req.CREATEDTIME).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
            </div>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
            :class="statusClass(req.status)">
            {{ (req.status || 'Pending').toUpperCase() }}
          </span>
        </div>
        <div class="mt-4 flex gap-2" v-if="!req.status || req.status === 'Pending'">
          <button @click="updateStatus(req, 'Approved')" class="text-xs px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">✓ Approve</button>
          <button @click="updateStatus(req, 'Denied')" class="text-xs px-4 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg font-medium transition-colors">✗ Deny</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useVisitorsStore } from '../../stores/visitorsStore'

const visitorsStore = useVisitorsStore()

onMounted(() => {
  visitorsStore.fetchAll()
})

function statusClass(s) {
  const status = (s || 'pending').toLowerCase()
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  if (status === 'approved' || status === 'inside') return 'bg-emerald-100 text-emerald-700'
  return 'bg-rose-100 text-rose-700'
}

async function updateStatus(req, status) {
  try {
    await visitorsStore.updateStatus(req.ROWID, status.toLowerCase())
  } catch (err) {
    alert('Failed to update status')
  }
}
</script>
