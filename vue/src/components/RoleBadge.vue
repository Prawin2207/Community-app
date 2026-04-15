<template>
  <span :class="['badge', badgeClasses]">
    <span class="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" :class="dotClasses"></span>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { ROLES } from '../data/mockData'

const props = defineProps({
  role: { type: String, required: true },
  size: { type: String, default: 'md' }, // sm, md
})

const config = computed(() => ({
  [ROLES.SUPER_ADMIN]:      { label: 'Super Admin',       badge: 'bg-primary-50 text-primary-700 ring-1 ring-primary-200',   dot: 'bg-primary-500' },
  [ROLES.RESIDENT]:         { label: 'Resident',           badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',   dot: 'bg-emerald-500' },
  [ROLES.SECURITY]:         { label: 'Security Guard',     badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',         dot: 'bg-amber-500' },
  [ROLES.ACCOUNTANT]:       { label: 'Accountant',         badge: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',            dot: 'bg-teal-500' },
  [ROLES.HR_MANAGER]:       { label: 'HR Manager',         badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',            dot: 'bg-rose-500' },
  [ROLES.COMMITTEE_MEMBER]: { label: 'Committee Member',  badge: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',            dot: 'bg-cyan-500' },
  [ROLES.TECHNICIAN]:       { label: 'Technician',         badge: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',      dot: 'bg-orange-500' },
  [ROLES.DELIVERY_AGENT]:   { label: 'Delivery Agent',     badge: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',      dot: 'bg-indigo-500' },
})[props.role] || { label: props.role, badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' })

const label = computed(() => config.value.label)
const badgeClasses = computed(() => config.value.badge)
const dotClasses = computed(() => config.value.dot)
</script>
