<template>
  <div class="p-6 space-y-6">
    <h1 class="page-title">Visitor History</h1>
    <div class="flex gap-3 mb-4">
      <input v-model="search" class="input flex-1" placeholder="Search by name, apartment..." />
      <select v-model="statusFilter" class="input w-40">
        <option value="">All Status</option>
        <option value="inside">Inside</option>
        <option value="exited">Exited</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>
    <div class="space-y-3">
      <div
        v-for="v in filtered"
        :key="v.ROWID || v.id"
        class="card flex items-center gap-4"
      >
        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold flex-shrink-0">
          {{ v.name.split(' ').map(n=>n[0]).join('').slice(0,2) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-slate-800">{{ v.name }}</p>
          <p class="text-xs text-slate-500">{{ v.phone }} &bull; {{ v.purpose }}</p>
          <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
             <span v-if="v.CREATEDTIME">Date: {{ v.CREATEDTIME.split(' ')[0] || v.CREATEDTIME }}</span>
          </div>
        </div>
      </div>
      <div v-if="!filtered.length" class="text-center text-sm text-slate-400 py-8">No records found</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVisitorsStore } from '../../stores/visitorsStore'

const data = useVisitorsStore()
const search = ref('')
const statusFilter = ref('')

onMounted(() => {
  data.fetchAll()
})

const filtered = computed(() => data.items.filter(v => {
  const q = search.value.toLowerCase()
  return (!q || v.name?.toLowerCase().includes(q) || v.phone?.toLowerCase().includes(q))
}))
</script>
