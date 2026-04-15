<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="page-title">Domestic Help & Staff Entry</h1>
        <p class="text-sm text-slate-500 mt-1">Manage daily check-ins for maids, drivers, and cooks.</p>
      </div>
    </div>

    <div class="card p-0 overflow-hidden border-slate-200">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h2 class="font-bold text-slate-800 flex items-center gap-2"><UserCheck class="w-5 h-5 text-indigo-500" /> Registered Daily Help</h2>
      </div>

      <div class="p-4 bg-white border-b border-slate-100">
        <input v-model="searchQuery" type="text" placeholder="Search by name, type, or flat..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
      </div>

      <div v-if="loading" class="p-12 text-center text-slate-400 font-medium">Loading records...</div>
      <div v-else-if="filteredHelp.length === 0" class="p-12 text-center text-slate-400">
        No staff found matching your search.
      </div>
      <div v-else class="divide-y divide-slate-100">
        <div v-for="help in filteredHelp" :key="help.ROWID || help.id" class="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex flex-col items-center justify-center">
              <span class="text-slate-400 font-bold text-lg leading-none">{{ help.name[0] }}</span>
            </div>
            <div>
              <p class="font-bold text-slate-800">{{ help.name }} <span class="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ml-2">{{ help.type }}</span></p>
              <div class="text-xs text-slate-500 mt-1 flex gap-3">
                <span v-if="help.flatId">Assigned Flat: {{ help.flatId }}</span>
                <span>Phone: {{ help.phone || 'N/A' }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span :class="['px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5', help.status === 'Inside' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600']">
              <span :class="['w-1.5 h-1.5 rounded-full', help.status === 'Inside' ? 'bg-emerald-500' : 'bg-slate-400']"></span>
              {{ help.status || 'Outside' }}
            </span>
            <div class="flex gap-2 w-28 justify-end">
              <button v-if="help.status !== 'Inside'" @click="toggleStatus(help, 'Inside')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition">
                Check IN
              </button>
              <button v-if="help.status === 'Inside'" @click="toggleStatus(help, 'Outside')" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition">
                Check OUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { UserCheck } from 'lucide-vue-next'
import { useDomesticHelpStore } from '../../stores/domesticHelpStore'

const helpStore = useDomesticHelpStore()
const loading = computed(() => helpStore.isLoading)
const searchQuery = ref('')

onMounted(() => {
  helpStore.fetchAll() // Security fetches everyone globally
})

const filteredHelp = computed(() => {
  if (!searchQuery.value) return helpStore.items
  const lower = searchQuery.value.toLowerCase()
  return helpStore.items.filter(h => 
    (h.name || '').toLowerCase().includes(lower) || 
    (h.type || '').toLowerCase().includes(lower) ||
    String(h.flatId || '').includes(lower)
  )
})

async function toggleStatus(help, newStatus) {
  const id = help.ROWID || help.id
  await helpStore.update(id, { status: newStatus })
}
</script>
