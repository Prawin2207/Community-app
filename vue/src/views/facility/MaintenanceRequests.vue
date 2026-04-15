<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="page-title">Maintenance Requests</h1>
      <p class="text-sm text-slate-500 mt-1">Track and manage facility maintenance tasks</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Tasks" :value="data.items.length" :icon="Wrench" color="indigo" />
      <StatCard label="Pending" :value="data.items.filter(t=>t.status==='pending').length" :icon="Clock" color="amber" />
      <StatCard label="In Progress" :value="data.items.filter(t=>t.status==='in_progress').length" :icon="RefreshCw" color="blue" />
      <StatCard label="Completed" :value="data.items.filter(t=>t.status==='completed').length" :icon="CheckCircle" color="emerald" />
    </div>

    <div class="space-y-4">
      <div
        v-for="task in data.items"
        :key="task.ROWID || task.id"
        class="card hover:shadow-card-hover transition-shadow"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <StatusBadge :status="task.priority" />
              <span class="badge bg-slate-100 text-slate-600">{{ task.facility }}</span>
            </div>
            <h3 class="font-bold text-slate-800">{{ task.title }}</h3>
            <p class="text-xs text-slate-500 mt-1">{{ task.description }}</p>
            <div class="flex items-center gap-4 mt-2 text-xs text-slate-400">
              <span>👤 {{ task.assignedTo }}</span>
              <span>📅 Due: {{ task.dueDate }}</span>
            </div>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <StatusBadge :status="task.status" />
            <select
              :value="task.status"
              @change="e => data.updateTask({ ...task, status: e.target.value })"
              class="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
      <div v-if="data.items.length === 0" class="text-center py-10 text-sm text-slate-400">No maintenance tasks found</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMaintenanceStore } from '../../stores/maintenanceStore'
import StatCard from '../../components/StatCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { Wrench, Clock, RefreshCw, CheckCircle } from 'lucide-vue-next'

const data = useMaintenanceStore()

onMounted(() => {
  data.fetchAll()
})
</script>
