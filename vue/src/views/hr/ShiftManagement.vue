<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Shift Management</h1>
      <p class="text-sm text-slate-500 mt-1">Weekly shift planner — Week of Jan 29 – Feb 4, 2024</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
      <table class="w-full text-sm min-w-[700px]">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500">Staff</th>
            <th v-for="d in days" :key="d" class="px-3 py-3 text-xs font-semibold text-slate-500 text-center">{{ d }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="row in schedule" :key="row.name" class="hover:bg-slate-50">
            <td class="px-5 py-3 font-medium text-slate-700">{{ row.name }}</td>
            <td v-for="(shift, i) in row.shifts" :key="i" class="px-2 py-3 text-center">
              <span class="text-xs px-2 py-0.5 rounded-lg font-medium" :class="shiftClass(shift)">{{ shift || '—' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useHrStore } from '../../stores/hrStore'

const hrStore = useHrStore()
onMounted(() => hrStore.fetchAll())

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const schedule = computed(() => {
  if (hrStore.staff.length === 0) return []
  
  const mockPatterns = [
    ['M', 'M', 'M', 'M', 'M', 'OFF', 'OFF'],
    ['E', 'E', 'E', 'E', 'E', 'E', 'OFF'],
    ['D', 'D', 'OFF', 'D', 'D', 'D', 'OFF'],
    ['M', 'M', 'M', 'OFF', 'M', 'OFF', 'OFF'],
    ['D', 'OFF', 'D', 'D', 'D', 'D', 'OFF']
  ]

  return hrStore.staff.map((s, idx) => ({
    name: s.name,
    dept: s.dept,
    shifts: mockPatterns[idx % mockPatterns.length]
  }))
})

function shiftClass(s) {
  if (!s || s === 'OFF') return 'bg-slate-100 text-slate-400'
  if (s === 'M') return 'bg-rose-100 text-rose-700'
  if (s === 'D') return 'bg-amber-100 text-amber-700'
  if (s === 'E') return 'bg-indigo-100 text-indigo-700'
  return 'bg-slate-100 text-slate-600'
}
</script>
