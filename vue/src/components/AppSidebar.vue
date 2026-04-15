<template>
  <!-- Desktop floating glass sidebar — hidden on mobile -->
  <aside
    class="hidden md:flex flex-col h-full transition-all duration-300 relative z-30 flex-shrink-0"
    :style="{ width: collapsed ? '68px' : '220px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-glass)' }"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-4 py-4 flex-shrink-0"
      style="border-bottom: 1px solid var(--border-glass); min-height: 56px;">
      <div class="w-8 h-8 flex items-center justify-center flex-shrink-0"
        :style="{ background: roleGradient }">
        <Building2 class="w-4 h-4 text-[#1a1a1a]" />
      </div>
      <transition name="fade">
        <div v-if="!collapsed" class="overflow-hidden">
          <p class="text-sm font-bold text-[var(--text-primary)] leading-tight">CommunityHub</p>
          <p class="text-[10px] font-bold uppercase tracking-widest" :style="{ color: roleAccent }">Pro</p>
        </div>
      </transition>
      <button v-if="!collapsed" @click="$emit('toggle')"
        class="ml-auto p-1 rounded-lg transition-colors hover:bg-slate-500/10 text-[var(--text-muted)]">
        <PanelLeftClose class="w-4 h-4" />
      </button>
    </div>

    <!-- Role badge -->
    <div v-if="!collapsed" class="px-4 pt-3 pb-1">
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
        :style="{ background: roleGradient + '22', border: '1px solid ' + roleAccent + '55', color: roleAccent }">
        <span class="w-1.5 h-1.5 rounded-full animate-pulse" :style="{ background: roleAccent }"></span>
        {{ currentRoleLabel }}
      </span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
      <template v-for="item in navItems" :key="item.name || item.label">
        <!-- Section header -->
        <div v-if="item.type === 'section' && !collapsed"
          class="pt-4 pb-1 px-2">
          <p class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{{ item.label }}</p>
        </div>
        <div v-else-if="item.type === 'section' && collapsed" class="pt-3 pb-1 flex justify-center">
          <div class="w-4 h-px" style="background: var(--border-bright);"></div>
        </div>

        <!-- Nav link -->
        <RouterLink v-else-if="item.type !== 'section'" :to="item.path" custom v-slot="{ isActive, navigate }">
          <button @click="navigate"
            :title="collapsed ? item.name : ''"
            :class="['sidebar-link w-full group', isActive ? 'sidebar-link-active' : 'sidebar-link-inactive', collapsed ? 'justify-center px-2' : '']"
            :style="isActive ? { color: '#1a1a1a' } : {}">
            <component :is="item.icon" class="w-4 h-4 flex-shrink-0"
              :style="isActive ? { color: '#1a1a1a' } : {}" />
            <span v-if="!collapsed" class="truncate text-sm">{{ item.name }}</span>
            <span v-if="item.badge && !collapsed"
              class="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              :class="item.badgeClass || ''">{{ item.badge }}</span>
          </button>
        </RouterLink>
      </template>
    </nav>

    <!-- User bottom -->
    <div class="p-2 flex-shrink-0" style="border-top: 1px solid var(--border-glass);">
      <div :class="['flex items-center gap-2.5 px-2 py-2 rounded-xl transition-colors hover:bg-slate-500/10 cursor-pointer', collapsed ? 'justify-center' : '']">
        <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          :style="{ background: roleGradient }">{{ userInitials }}</div>
        <div v-if="!collapsed" class="flex-1 min-w-0">
          <p class="text-xs font-semibold truncate text-[var(--text-primary)]">{{ auth.currentUser?.name }}</p>
          <p class="text-[10px] truncate text-[var(--text-muted)]">{{ auth.currentUser?.email }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useSettingsStore } from '../stores/settingsStore'
import { ROLES } from '../data/mockData'
import { Building2, PanelLeftClose, LayoutDashboard, Users, Home, CreditCard, MessageSquare, Dumbbell, BarChart2, Bell, Settings, Wallet, Calendar, BookOpen, ShieldCheck, Clock, History, AlertTriangle, Wrench, FileText, Rss, UserCircle, Receipt, Landmark, TrendingUp, CalendarClock, Star, DollarSign, Vote, Gavel, BookMarked, Scale, ClipboardCheck, ClipboardList, Boxes, Package, Key, PackageX, Building, IndianRupee, UserCheck, BellRing } from 'lucide-vue-next'

defineProps({ collapsed: { type: Boolean, default: false } })
defineEmits(['toggle'])

const auth = useAuthStore()
const settingsStore = useSettingsStore()

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin', [ROLES.RESIDENT]: 'Resident', [ROLES.SECURITY]: 'Security Guard',
  [ROLES.ACCOUNTANT]: 'Accountant', [ROLES.HR_MANAGER]: 'HR Manager',
  [ROLES.COMMITTEE_MEMBER]: 'Committee Member', [ROLES.TECHNICIAN]: 'Technician', [ROLES.DELIVERY_AGENT]: 'Delivery Agent',
  [ROLES.OWNER]: 'Property Owner',
}

const roleGradient = computed(() => 'var(--accent-1)')
const roleAccent = computed(() => 'var(--accent-1)')
const currentRoleLabel = computed(() => ROLE_LABELS[auth.role] || 'User')
const userInitials = computed(() => (auth.currentUser?.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2))

const NAV_MAP = {
  [ROLES.SUPER_ADMIN]: [
    { type: 'section', label: 'Overview' },
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { type: 'section', label: 'Management' },
    { name: 'Residents', path: '/admin/residents', icon: Users },
    { name: 'Owners', path: '/admin/owners', icon: Home },
    { name: 'Finance & Dues', path: '/admin/finance', icon: CreditCard },
    { name: 'Complaints', path: '/admin/complaints', icon: MessageSquare, badge: '5', badgeClass: 'bg-rose-500/20 text-rose-400' },
    { type: 'section', label: 'Flat Master' },
    { name: 'Flat Registry', path: '/admin/flats', icon: Building },
    { name: 'Maintenance Notify', path: '/admin/maintenance-notify', icon: BellRing },
    { type: 'section', label: 'Governance' },
    { name: 'Proposals', path: '/committee/proposals', icon: Gavel },
    { name: 'Voting Portal', path: '/committee/voting', icon: Vote },
    { name: 'Rules & Regulations', path: '/admin/rules', icon: Scale },
    { type: 'section', label: 'Analytics' },
    { name: 'Reports', path: '/admin/reports', icon: BarChart2 },
    { name: 'Notices', path: '/admin/notices', icon: Bell },
    { type: 'section', label: 'System' },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ],
  [ROLES.RESIDENT]: [
    { type: 'section', label: 'Overview' },
    { name: 'Dashboard', path: '/resident/dashboard', icon: LayoutDashboard },
    { type: 'section', label: 'My Account' },
    { name: 'My Dues', path: '/resident/dues', icon: Wallet },
    { name: 'Visitors', path: '/resident/visitors', icon: Users },
    { name: 'Create Gate Pass', path: '/resident/gate-pass', icon: Key },
    { name: 'Domestic Help', path: '/resident/help', icon: UserCheck },
    { name: 'Raise Complaint', path: '/resident/complaint', icon: MessageSquare },
    { name: 'Community Feed', path: '/resident/feed', icon: Rss },
    { name: 'Notices', path: '/resident/notices', icon: Bell },
    { type: 'section', label: 'Governance' },
    { name: 'Voting & Proposals', path: '/committee/voting', icon: Vote },
    { name: 'Rules & Regulations', path: '/resident/rules', icon: Scale },
    { name: 'Profile', path: '/resident/profile', icon: UserCircle },
  ],
  [ROLES.SECURITY]: [
    { type: 'section', label: 'Overview' },
    { name: 'Dashboard', path: '/security/dashboard', icon: LayoutDashboard },
    { type: 'section', label: 'Visitor Management' },
    { name: 'Visitor Entry', path: '/security/visitor-entry', icon: ShieldCheck },
    { name: 'Staff Entry', path: '/security/staff-entry', icon: UserCheck },
    { name: 'Expected Visitors', path: '/security/expected', icon: Clock },
    { name: 'Visitor History', path: '/security/history', icon: History },
  ],

  [ROLES.ACCOUNTANT]: [
    { type: 'section', label: 'Overview' },
    { name: 'Dashboard', path: '/accountant/dashboard', icon: LayoutDashboard },
    { type: 'section', label: 'Finance' },
    { name: 'Invoice Management', path: '/accountant/invoices', icon: Receipt, badge: '3', badgeClass: 'bg-teal-500/20 text-teal-400' },
    { name: 'Payment Tracking', path: '/accountant/payments', icon: CreditCard },
    { type: 'section', label: 'Planning' },
    { name: 'Budget Planning', path: '/accountant/budget', icon: Landmark },
    { name: 'Financial Reports', path: '/accountant/reports', icon: TrendingUp },
  ],
  [ROLES.HR_MANAGER]: [
    { type: 'section', label: 'Overview' },
    { name: 'Dashboard', path: '/hr/dashboard', icon: LayoutDashboard },
    { type: 'section', label: 'Staff' },
    { name: 'Staff Directory', path: '/hr/staff', icon: Users },
    { name: 'Shift Management', path: '/hr/shifts', icon: CalendarClock },
    { name: 'Performance', path: '/hr/performance', icon: Star },
    { type: 'section', label: 'Payroll' },
    { name: 'Payroll', path: '/hr/payroll', icon: DollarSign },
  ],
  [ROLES.COMMITTEE_MEMBER]: [
    { type: 'section', label: 'Overview' },
    { name: 'Dashboard', path: '/committee/dashboard', icon: LayoutDashboard },
    { type: 'section', label: 'Governance' },
    { name: 'Proposals', path: '/committee/proposals', icon: Gavel, badge: '2', badgeClass: 'bg-cyan-500/20 text-cyan-400' },
    { name: 'Voting Portal', path: '/committee/voting', icon: Vote },
    { type: 'section', label: 'Records' },
    { name: 'Meeting Minutes', path: '/committee/minutes', icon: BookMarked },
    { name: 'Rules & Regulations', path: '/committee/rules', icon: Scale },
  ],
  [ROLES.TECHNICIAN]: [
    { type: 'section', label: 'Overview' },
    { name: 'Dashboard', path: '/technician/dashboard', icon: LayoutDashboard },
    { type: 'section', label: 'Work' },
    { name: 'My Tasks', path: '/technician/tasks', icon: ClipboardCheck, badge: '4', badgeClass: 'bg-orange-500/20 text-orange-400' },
    { name: 'Work Orders', path: '/technician/work-orders', icon: ClipboardList },
    { name: 'Complaints', path: '/technician/complaints', icon: MessageSquare },
    { type: 'section', label: 'Inventory' },
    { name: 'Parts Inventory', path: '/technician/inventory', icon: Boxes },
  ],
  [ROLES.DELIVERY_AGENT]: [
    { type: 'section', label: 'Overview' },
    { name: 'Dashboard', path: '/delivery/dashboard', icon: LayoutDashboard },
    { type: 'section', label: 'Deliveries' },
    { name: 'Active Deliveries', path: '/delivery/active', icon: Package, badge: '6', badgeClass: 'bg-indigo-500/20 text-indigo-400' },
    { type: 'section', label: 'History' },
    { name: 'Delivery History', path: '/delivery/history', icon: PackageX },
  ],
  [ROLES.OWNER]: [
    { type: 'section', label: 'Overview' },
    { name: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
    { type: 'section', label: 'Flat Management' },
    { name: 'My Residents', path: '/owner/tenants', icon: Users },
    { type: 'section', label: 'Records' },
    { name: 'Flat History', path: '/owner/history', icon: History },
    { name: 'Rules & Regs', path: '/owner/rules', icon: Scale },
  ],
}

const navItems = computed(() => {
  let items = NAV_MAP[auth.role] || []
  
  return items.filter(item => {
    const name = (item.name || item.label || '').toLowerCase()
    
    // Complaints
    if (!settingsStore.complaintsEnabled) {
      if (name.includes('complaint')) return false
    }

    // Rules & Regulations
    if (!settingsStore.rulesEnabled) {
      if (name.includes('rules') || name.includes('regulations') || name.includes('regs')) return false
    }

    // Invoicing & Finance
    if (!settingsStore.invoicingEnabled) {
      const isFinance = name.includes('finance') || name.includes('invoice') || name.includes('dues') || name.includes('wallet') || name.includes('payment') || name.includes('receipt') || name.includes('payroll')
      if (isFinance) return false
    }

    return true
  })
})
</script>
