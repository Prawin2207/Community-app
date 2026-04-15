<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Technician Dashboard</h1>
      <p class="text-sm text-slate-500 mt-1">Your workload for today, {{ today }}</p>
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
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 class="font-semibold text-slate-700 mb-4 flex items-center gap-2"><ClipboardCheck class="w-4 h-4 text-orange-500" /> Today's Assigned Tasks</h2>
        <div class="space-y-3">
          <div v-for="task in todayTasks" :key="task.ROWID || task.id" class="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-orange-200 transition-colors">
            <div class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" :class="priorityBg(task.priority)">
              <Wrench class="w-4 h-4" :class="priorityColor(task.priority)" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-700">{{ task.title }}</p>
              <p class="text-xs text-slate-400 truncate">{{ task.facility }} · {{ task.status }}</p>
            </div>
          </div>
          <div v-if="todayTasks.length === 0" class="text-center py-6 text-xs text-slate-400 italic">No tasks assigned for today</div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 class="font-semibold text-slate-700 mb-4 flex items-center gap-2"><ClipboardList class="w-4 h-4 text-amber-500" /> Recent Work Orders</h2>
        <div class="space-y-3">
          <div v-for="wo in workOrders" :key="wo.ROWID || wo.id" class="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-amber-200 transition-colors">
            <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <ClipboardList class="w-4 h-4 text-amber-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-700">{{ wo.title }}</p>
              <p class="text-xs text-slate-400 truncate">{{ wo.category }} · {{ wo.status }}</p>
            </div>
          </div>
          <div v-if="workOrders.length === 0" class="text-center py-6 text-xs text-slate-400 italic">No open work orders</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { ClipboardCheck, ClipboardList, CheckCircle2, Wrench } from 'lucide-vue-next'
import { useOpsStore } from '../../stores/opsStore'
import { useMaintenanceStore } from '../../stores/maintenanceStore'

const opsStore = useOpsStore()
const maintenanceStore = useMaintenanceStore()
const auth = useAuthStore()

onMounted(() => {
  opsStore.fetchAll()
  maintenanceStore.fetchAll()
})

const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

const myTasks = computed(() => {
  const me = auth.currentUser?.ROWID || auth.currentUser?.id
  return opsStore.tasks.filter(t => !t.assignedTo || String(t.assignedTo) === String(me))
})

const todayTasks = computed(() => myTasks.value.slice(0, 4))
const workOrders = computed(() => maintenanceStore.items.slice(0, 4))

const stats = computed(() => [
  { label: 'Assigned Tasks', value: myTasks.value.length, icon: ClipboardCheck, iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  { label: 'Open Work Orders', value: maintenanceStore.items.filter(i => i.status !== 'resolved').length, icon: ClipboardList, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { label: 'Completed', value: myTasks.value.filter(i => i.status === 'completed').length + maintenanceStore.items.filter(i => i.status === 'resolved').length, icon: CheckCircle2, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
])

function priorityBg(p) {
  const pr = (p || 'medium').toLowerCase()
  return { critical: 'bg-rose-100', high: 'bg-orange-100', medium: 'bg-amber-100', low: 'bg-slate-100' }[pr] || 'bg-slate-100'
}
function priorityColor(p) {
  const pr = (p || 'medium').toLowerCase()
  return { critical: 'text-rose-600', high: 'text-orange-600', medium: 'text-amber-600', low: 'text-slate-500' }[pr] || 'text-slate-500'
}
function statusClass(s) {
  const st = (s || 'pending').toLowerCase()
  return { in_progress: 'bg-indigo-100 text-indigo-700', pending: 'bg-amber-100 text-amber-700', resolved: 'bg-emerald-100 text-emerald-700', completed: 'bg-emerald-100 text-emerald-700' }[st] || 'bg-slate-100 text-slate-600'
}
</script>
