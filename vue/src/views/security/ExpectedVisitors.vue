<template>
  <div class="p-6 space-y-6">
    <h1 class="page-title">Expected Visitors</h1>
    <div class="card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Visitor</th>
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Host ID</th>
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Purpose</th>
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="v in data.items" :key="v.ROWID || v.id" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <p class="text-sm font-medium text-slate-800">{{ v.name }}</p>
                <p class="text-xs text-slate-400">{{ v.phone }}</p>
              </td>
              <td class="px-4 py-3">
                <p class="text-sm text-slate-700">{{ v.residentId || 'N/A' }}</p>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ v.purpose }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ v.CREATEDTIME ? v.CREATEDTIME.split(' ')[0] : '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useVisitorsStore } from '../../stores/visitorsStore'

const data = useVisitorsStore()

onMounted(() => {
  data.fetchAll()
})
</script>
