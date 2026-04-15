<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">My Tasks</h1>
      <p class="text-sm text-slate-500 mt-1">View and update your assigned maintenance tasks</p>
    </div>
    <div class="space-y-3">
      <div v-if="opsStore.loading" class="p-10 text-center animate-pulse text-slate-400">Fetching assigned tasks...</div>
      <div v-else-if="opsStore.tasks.length === 0" class="p-10 text-center text-slate-400">No tasks assigned to you</div>
      <div v-for="task in myTasks" :key="task.ROWID || task.id" class="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary-200 transition-all group">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <h3 class="font-semibold text-slate-800">{{ task.title }}</h3>
            <p class="text-sm text-slate-500 mt-1">{{ task.description }}</p>
            <div class="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <span class="flex items-center gap-1"><MapPin class="w-3 h-3" /> {{ task.facility || 'N/A' }}</span>
              <span class="flex items-center gap-1"><Calendar class="w-3 h-3" /> {{ task.dueDate || 'No date' }}</span>
            </div>
          </div>
          <div class="flex-shrink-0 text-right">
            <span class="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider block mb-2" :class="priorityClass(task.priority)">{{ task.priority }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusClass(task.status)">{{ task.status?.replace('_', ' ') }}</span>
          </div>
        </div>
        <div class="mt-4 flex gap-2" v-if="task.status !== 'completed'">
          <button v-if="task.status === 'pending'" @click="opsStore.updateTask(task.ROWID, { status: 'in_progress' })" class="text-xs px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">Start Task</button>

          <button @click="opsStore.updateTask(task.ROWID, { status: 'completed' })" class="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">Complete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { MapPin, Calendar } from 'lucide-vue-next'
import { useOpsStore } from '../../stores/opsStore'

const opsStore = useOpsStore()
const auth = useAuthStore()

onMounted(() => opsStore.fetchAll())

const myTasks = computed(() => {
  const me = auth.currentUser?.ROWID || auth.currentUser?.id
  return opsStore.tasks.filter(t => !t.assignedTo || String(t.assignedTo) === String(me))
})

function priorityClass(p) {
  return { 
    critical: 'bg-rose-50 text-rose-700', 
    high: 'bg-orange-50 text-orange-700', 
    medium: 'bg-amber-50 text-amber-700', 
    low: 'bg-slate-50 text-slate-600' 
  }[p?.toLowerCase()] || 'bg-slate-50 text-slate-600'
}

function statusClass(s) {
  return { 
    in_progress: 'bg-indigo-50 text-indigo-700 font-bold', 
    pending: 'bg-amber-50 text-amber-700', 
    completed: 'bg-emerald-50 text-emerald-700' 
  }[s?.toLowerCase()] || 'bg-slate-50 text-slate-600'
}
</script>
