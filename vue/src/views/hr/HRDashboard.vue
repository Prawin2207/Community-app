<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">HR Dashboard</h1>
      <p class="text-sm text-slate-500 mt-1">Staff overview and workforce summary</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div v-for="s in stats" :key="s.label" class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="s.iconBg">
            <component :is="s.icon" class="w-5 h-5" :class="s.iconColor" />
          </div>
        </div>
        <p class="text-2xl font-bold text-slate-800">{{ s.value }}</p>
        <p class="text-sm text-slate-500 mt-0.5">{{ s.label }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Today's Shift -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 class="font-semibold text-slate-700 mb-4">Today's Shift Summary</h2>
        <div class="space-y-3">
          <div v-for="shift in todayShifts" :key="shift.name" class="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
            <div class="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-xs">{{ shift.initials }}</div>
            <div class="flex-1">
              <p class="text-sm font-medium text-slate-700">{{ shift.name }}</p>
              <p class="text-xs text-slate-400">{{ shift.role }} · {{ shift.time }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="shift.statusClass">{{ shift.status }}</span>
          </div>
        </div>
      </div>

      <!-- Staff by Department -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 class="font-semibold text-slate-700 mb-4">Staff by Department</h2>
        <div class="space-y-3">
          <div v-for="dept in departments" :key="dept.name">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-slate-600">{{ dept.name }}</span>
              <span class="font-semibold text-slate-800">{{ dept.count }}</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full">
              <div class="h-full rounded-full" :class="dept.color" :style="{ width: dept.pct + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useHrStore } from '../../stores/hrStore'
import { Users, CalendarClock, Star, AlertTriangle } from 'lucide-vue-next'

const hrStore = useHrStore()

onMounted(() => {
  hrStore.fetchAll()
})

const stats = computed(() => [
  { label: 'Total Staff', value: hrStore.staff.length, icon: Users, iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
  { label: 'Payroll Records', value: hrStore.payroll.length, icon: CalendarClock, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { label: 'Active Emp', value: hrStore.staff.filter(s => (s.status || '').toLowerCase() === 'active').length, icon: Star, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { label: 'Pending Payroll', value: hrStore.payroll.filter(p => (p.status || '').toLowerCase() === 'pending').length, icon: AlertTriangle, iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
])

const todayShifts = computed(() => hrStore.staff.slice(0, 5).map(s => ({
  initials: (s.name || '?').split(' ').map(n=>n[0]).join('').slice(0,2),
  name: s.name,
  role: s.position || s.role || 'Staff',
  time: 'Full Time',
  status: s.status || 'Active',
  statusClass: s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
})))

const departments = computed(() => {
  const depts = {}
  hrStore.staff.forEach(s => {
    const d = s.department || 'General'
    depts[d] = (depts[d] || 0) + 1
  })
  return Object.entries(depts).map(([name, count]) => ({
    name,
    count,
    pct: Math.min(100, (count / (hrStore.staff.length || 1)) * 100),
    color: 'bg-indigo-500'
  }))
})
</script>
