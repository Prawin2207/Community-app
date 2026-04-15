<template>
  <div class="p-4 space-y-5">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Flat History</h1>
      <p class="text-xs text-slate-500 mt-0.5">Complete ownership and tenant timeline</p>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
    </div>
    <div v-else-if="history.length === 0" class="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
      <ClipboardList class="w-12 h-12 mx-auto mb-3 opacity-20" />
      <p class="font-medium text-sm">No history to display</p>
    </div>
    <div v-else class="space-y-3">
      <div v-for="h in history" :key="h.ROWID" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-4">
        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          h.entityType === 'owner' ? 'bg-amber-100' : 'bg-indigo-100']">
          <Crown v-if="h.entityType === 'owner'" class="w-5 h-5 text-amber-600" />
          <User v-else class="w-5 h-5 text-indigo-600" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <p class="text-sm font-bold text-slate-800">{{ h.entityName }}</p>
            <span :class="[eventClass(h.eventType), 'text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide']">
              {{ h.eventType?.replace(/_/g, ' ') }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">{{ h.entityType === 'owner' ? 'Owner' : 'Tenant' }} · {{ h.eventDate }}</p>
          <p v-if="h.notes" class="text-[10px] text-slate-400 italic mt-1">{{ h.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Crown, User, ClipboardList } from 'lucide-vue-next'
import { useFlatsStore } from '../../stores/flatsStore'
import { flatHistoryAPI } from '../../services/api'

const flatsStore = useFlatsStore()
const history = ref([])
const loading = ref(true)
const myFlat = computed(() => flatsStore.items[0])

onMounted(async () => {
  await flatsStore.fetchAll()
  if (myFlat.value) {
    try {
      const res = await flatHistoryAPI.list({ flatId: myFlat.value.ROWID })
      const raw = res.data?.data || res.data || []
      history.value = Array.isArray(raw) ? raw.map(r => r.FlatHistory || r) : []
    } catch (e) { console.error(e) }
  }
  loading.value = false
})

function eventClass(type) {
  return {
    move_in: 'bg-emerald-100 text-emerald-700',
    move_out: 'bg-rose-100 text-rose-700',
    ownership_transfer: 'bg-amber-100 text-amber-700',
  }[type] || 'bg-slate-100 text-slate-600'
}
</script>
