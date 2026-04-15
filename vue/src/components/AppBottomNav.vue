<template>
  <!-- Mobile-only frosted glass bottom tab bar -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch bg-[var(--bg-card)] border-t border-[var(--border-glass)] backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
    <RouterLink v-for="tab in tabs" :key="tab.path" :to="tab.path" custom v-slot="{ isActive, navigate }">
      <button @click="navigate"
        class="bottom-nav-tab relative"
        :class="{ active: isActive }">
        <!-- Active indicator glow line on top -->
        <div v-if="isActive" class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
          :style="{ background: roleGradient }"></div>
        <!-- Icon -->
        <div class="relative">
          <component :is="tab.icon" class="w-5 h-5" :style="isActive ? { color: roleAccent } : { color: 'var(--text-muted)' }" />
          <span v-if="tab.badge"
            class="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold rounded-full bg-rose-500 text-white px-1">
            {{ tab.badge }}
          </span>
        </div>
        <!-- Label -->
        <span class="text-[10px] font-semibold leading-none"
          :style="isActive ? { color: roleAccent } : { color: 'var(--text-muted)' }">
          {{ tab.name }}
        </span>
      </button>
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useSettingsStore } from '../stores/settingsStore'
import { ROLES } from '../data/mockData'
import {
  LayoutDashboard, Users, CreditCard, MessageSquare, ShieldCheck,
  Calendar, Bell, Wrench, Receipt, DollarSign, Vote, ClipboardCheck,
  Package, Dumbbell, UserCircle
} from 'lucide-vue-next'

const auth = useAuthStore()
const settingsStore = useSettingsStore()

const ROLE_GRADIENTS = {
  [ROLES.SUPER_ADMIN]:      'linear-gradient(90deg, #6366f1, #8b5cf6)',
  [ROLES.RESIDENT]:         'linear-gradient(90deg, #10b981, #06b6d4)',
  [ROLES.SECURITY]:         'linear-gradient(90deg, #f59e0b, #ef4444)',
  [ROLES.ACCOUNTANT]:       'linear-gradient(90deg, #14b8a6, #0ea5e9)',
  [ROLES.HR_MANAGER]:       'linear-gradient(90deg, #f43f5e, #fb923c)',
  [ROLES.COMMITTEE_MEMBER]: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
  [ROLES.TECHNICIAN]:       'linear-gradient(90deg, #f97316, #eab308)',
  [ROLES.DELIVERY_AGENT]:   'linear-gradient(90deg, #6366f1, #14b8a6)',
}
const ROLE_ACCENTS = {
  [ROLES.SUPER_ADMIN]: '#818cf8', [ROLES.RESIDENT]: '#34d399', [ROLES.SECURITY]: '#fbbf24',
  [ROLES.ACCOUNTANT]: '#2dd4bf', [ROLES.HR_MANAGER]: '#fb7185',
  [ROLES.COMMITTEE_MEMBER]: '#22d3ee', [ROLES.TECHNICIAN]: '#fb923c', [ROLES.DELIVERY_AGENT]: '#818cf8',
}

const roleGradient = computed(() => ROLE_GRADIENTS[auth.role] || ROLE_GRADIENTS[ROLES.SUPER_ADMIN])
const roleAccent = computed(() => ROLE_ACCENTS[auth.role] || '#818cf8')

// Show max 5 key tabs per role for mobile
const TAB_MAP = {
  [ROLES.SUPER_ADMIN]: [
    { name: 'Home', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Residents', path: '/admin/residents', icon: Users },
    { name: 'Finance', path: '/admin/finance', icon: CreditCard },
    { name: 'Complaints', path: '/admin/complaints', icon: MessageSquare, badge: '5' },
    { name: 'Reports', path: '/admin/reports', icon: Bell },
  ],
  [ROLES.RESIDENT]: [
    { name: 'Home', path: '/resident/dashboard', icon: LayoutDashboard },
    { name: 'Dues', path: '/resident/dues', icon: CreditCard },
    { name: 'Visitors', path: '/resident/visitors', icon: Users },
    { name: 'Profile', path: '/resident/profile', icon: UserCircle },
  ],
  [ROLES.SECURITY]: [
    { name: 'Home', path: '/security/dashboard', icon: LayoutDashboard },
    { name: 'Entry', path: '/security/visitor-entry', icon: ShieldCheck },
    { name: 'Expected', path: '/security/expected', icon: Users },
    { name: 'History', path: '/security/history', icon: Calendar },
    { name: 'Alerts', path: '/security/emergency', icon: MessageSquare, badge: '1' },
  ],
  [ROLES.ACCOUNTANT]: [
    { name: 'Home', path: '/accountant/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', path: '/accountant/invoices', icon: Receipt, badge: '3' },
    { name: 'Payments', path: '/accountant/payments', icon: CreditCard },
    { name: 'Budget', path: '/accountant/budget', icon: DollarSign },
    { name: 'Reports', path: '/accountant/reports', icon: Bell },
  ],
  [ROLES.HR_MANAGER]: [
    { name: 'Home', path: '/hr/dashboard', icon: LayoutDashboard },
    { name: 'Staff', path: '/hr/staff', icon: Users },
    { name: 'Shifts', path: '/hr/shifts', icon: Calendar },
    { name: 'Performance', path: '/hr/performance', icon: MessageSquare },
    { name: 'Payroll', path: '/hr/payroll', icon: DollarSign },
  ],
  [ROLES.COMMITTEE_MEMBER]: [
    { name: 'Home', path: '/committee/dashboard', icon: LayoutDashboard },
    { name: 'Proposals', path: '/committee/proposals', icon: MessageSquare, badge: '2' },
    { name: 'Vote', path: '/committee/voting', icon: Vote },
    { name: 'Minutes', path: '/committee/minutes', icon: Bell },
    { name: 'Rules', path: '/committee/rules', icon: ShieldCheck },
  ],
  [ROLES.TECHNICIAN]: [
    { name: 'Home', path: '/technician/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', path: '/technician/tasks', icon: ClipboardCheck, badge: '4' },
    { name: 'Orders', path: '/technician/work-orders', icon: Wrench },
    { name: 'Inventory', path: '/technician/inventory', icon: Bell },
  ],
  [ROLES.DELIVERY_AGENT]: [
    { name: 'Home', path: '/delivery/dashboard', icon: LayoutDashboard },
    { name: 'Active', path: '/delivery/active', icon: Package, badge: '6' },
    { name: 'Gate Pass', path: '/delivery/gate-pass', icon: ShieldCheck },
    { name: 'History', path: '/delivery/history', icon: Bell },
  ],
}

const tabs = computed(() => {
  return TAB_MAP[auth.role] || TAB_MAP[ROLES.SUPER_ADMIN]
})
</script>
