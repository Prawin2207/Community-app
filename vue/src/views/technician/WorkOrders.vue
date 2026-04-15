<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Work Orders</h1>
      <p class="text-sm text-slate-500 mt-1">All work orders across the property</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">WO #</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Facility</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Assigned To</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Priority</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Due</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="(task, i) in maintenanceStore.items" :key="task.ROWID || task.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-5 py-3 font-mono text-xs text-slate-500">WO-{{ String(i + 1).padStart(3, '0') }}</td>
            <td class="px-5 py-3 font-medium text-slate-700">{{ task.title }}</td>
            <td class="px-5 py-3 text-slate-500">{{ task.category || task.facility }}</td>
            <td class="px-5 py-3 text-slate-500 text-xs">{{ task.residentName || 'Admin' }}</td>
            <td class="px-5 py-3">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="priorityClass(task.priority)">{{ task.priority }}</span>
            </td>
            <td class="px-5 py-3">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusClass(task.status)">{{ (task.status || '').replace('_', ' ') }}</span>
            </td>
            <td class="px-5 py-3 text-slate-500 text-xs">{{ task.date || task.CREATEDTIME }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMaintenanceStore } from '../../stores/maintenanceStore'

const maintenanceStore = useMaintenanceStore()

onMounted(() => {
  maintenanceStore.fetchAll()
})

function priorityClass(p) {
  const pr = (p || 'medium').toLowerCase()
  return { critical: 'bg-rose-100 text-rose-700', high: 'bg-orange-100 text-orange-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-slate-100 text-slate-600' }[pr]
}
function statusClass(s) {
  const st = (s || 'pending').toLowerCase()
  return { in_progress: 'bg-indigo-100 text-indigo-700', pending: 'bg-amber-100 text-amber-700', resolved: 'bg-emerald-100 text-emerald-700', completed: 'bg-emerald-100 text-emerald-700' }[st] || 'bg-slate-100 text-slate-600'
}
</script>
