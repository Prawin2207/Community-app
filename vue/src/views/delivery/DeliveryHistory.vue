<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Delivery History</h1>
      <p class="text-sm text-slate-500 mt-1">Log of all completed deliveries</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Supplier</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Resident</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Delivered At</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-if="deliveryStore.loading" class="animate-pulse">
            <td colspan="6" class="p-10 text-center text-slate-400">Loading history...</td>
          </tr>
          <tr v-else-if="deliveredHistory.length === 0">
            <td colspan="6" class="p-10 text-center text-slate-400">No delivery history found</td>
          </tr>
          <tr v-else v-for="d in deliveredHistory" :key="d.ROWID" class="hover:bg-slate-50 transition-colors">
            <td class="px-5 py-3 font-medium text-slate-700">{{ d.Deliveriessupplier }}</td>
            <td class="px-5 py-3">
              <p class="text-slate-700">{{ d.resident }}</p>
              <p class="text-xs text-slate-400">{{ d.apartment }}</p>
            </td>
            <td class="px-5 py-3 text-slate-500 text-xs">{{ d.type }}</td>
            <td class="px-5 py-3 text-slate-500 text-xs">{{ new Date(d.CREATEDTIME).toLocaleDateString() }}</td>
            <td class="px-5 py-3 text-slate-500 text-xs">{{ new Date(d.CREATEDTIME).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</td>
            <td class="px-5 py-3">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">Delivered</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useDeliveryStore } from '../../stores/deliveryStore'

const deliveryStore = useDeliveryStore()

onMounted(() => {
  deliveryStore.fetchAll()
})

const deliveredHistory = computed(() => {
  return deliveryStore.items.filter(i => i.status === 'delivered')
})
</script>
