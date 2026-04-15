<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Committee Dashboard</h1>
      <p class="text-sm text-slate-500 mt-1">RWA governance at a glance</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="s in stats" :key="s.label" class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" :class="s.iconBg">
          <component :is="s.icon" class="w-5 h-5" :class="s.iconColor" />
        </div>
        <p class="text-2xl font-bold text-slate-800">{{ s.value }}</p>
        <p class="text-sm text-slate-500 mt-0.5">{{ s.label }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Active Proposals -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 class="font-semibold text-slate-700 mb-4">Active Proposals</h2>
        <div class="space-y-3">
          <div v-for="p in proposals" :key="p.id" class="p-3 rounded-xl border border-slate-100 hover:border-cyan-200 transition-colors">
            <p class="text-sm font-medium text-slate-700">{{ p.title }}</p>
            <div class="flex items-center justify-between mt-2">
              <p class="text-xs text-slate-400">Votes: {{ p.for }} for / {{ p.against }} against</p>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-cyan-100 text-cyan-700">{{ p.status }}</span>
            </div>
            <div class="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div class="h-full bg-cyan-500 rounded-full" :style="{ width: (p.for / (p.for + p.against) * 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Meetings -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 class="font-semibold text-slate-700 mb-4">Upcoming Meetings</h2>
        <div class="space-y-3">
          <div v-for="m in meetings" :key="m.id" class="flex items-start gap-3 p-3 rounded-xl border border-slate-100">
            <div class="w-10 h-10 bg-cyan-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
              <p class="text-xs font-bold text-cyan-700">{{ m.day }}</p>
              <p class="text-[10px] text-cyan-500">{{ m.month }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-700">{{ m.title }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ m.time }} · {{ m.venue }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { Gavel, Vote, BookMarked } from 'lucide-vue-next'
import { useGovernanceStore } from '../../stores/governanceStore'

const governanceStore = useGovernanceStore()

onMounted(() => {
  governanceStore.fetchAll()
})

const stats = computed(() => [
  { label: 'Active Proposals', value: governanceStore.proposals.filter(p => p.status !== 'closed').length, icon: Gavel, iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600' },
  { label: 'Total Rules', value: governanceStore.rules.length, icon: Vote, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  { label: 'Meeting Minutes', value: governanceStore.minutes.length, icon: BookMarked, iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
])

const proposals = computed(() => governanceStore.proposals.slice(0, 3).map(p => ({
  id: p.ROWID || p.id,
  title: p.title,
  status: p.status || 'Voting Open',
  for: p.votesFor || 0,
  against: p.votesAgainst || 0
})))

const meetings = computed(() => governanceStore.minutes.slice(0, 3).map(m => {
  const dt = new Date(m.date || m.CREATEDTIME)
  return {
    id: m.ROWID || m.id,
    day: dt.getDate(),
    month: dt.toLocaleString('default', { month: 'short' }),
    title: m.title,
    time: m.time || '10:00 AM',
    venue: m.location || m.venue || 'Clubhouse'
  }
}))
</script>
