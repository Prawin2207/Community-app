<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Staff Performance</h1>
      <p class="text-sm text-slate-500 mt-1">Monthly performance ratings and incident log</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div v-if="hrStore.loading" class="p-10 text-center animate-pulse text-slate-400">Loading metrics...</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Staff</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Role / Dept</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Rating</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="s in hrStore.staff" :key="s.ROWID" class="hover:bg-slate-50 transition-colors">
            <td class="px-5 py-3 font-medium text-slate-700">{{ s.name }}</td>
            <td class="px-5 py-3 text-slate-500">{{ s.role }} ({{ s.dept }})</td>
            <td class="px-5 py-3">
              <div class="flex items-center gap-2">
                <div class="flex gap-0.5">
                  <span v-for="n in 5" :key="n" :class="n <= (s.performance || 5) ? 'text-amber-400' : 'text-slate-200'" class="text-lg">★</span>
                </div>
                <button @click="updateRating(s)" class="text-[10px] text-primary-600 font-bold uppercase hover:underline">Adjust</button>
              </div>
            </td>
            <td class="px-5 py-3">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">{{ s.status }}</span>
            </td>
          </tr>
          <tr v-if="hrStore.staff.length === 0">
            <td colspan="4" class="p-10 text-center text-slate-400">No staff records to show</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHrStore } from '../../stores/hrStore'

const hrStore = useHrStore()

onMounted(() => hrStore.fetchAll())

async function updateRating(staff) {
  const newRating = prompt(`Set new performance rating for ${staff.name} (1-5):`, staff.performance || 5)
  if (newRating && !isNaN(newRating)) {
    try {
      await hrStore.updateStaff(staff.ROWID, { performance: Number(newRating) })
    } catch (err) {
      alert('Failed to update rating')
    }
  }
}
</script>
