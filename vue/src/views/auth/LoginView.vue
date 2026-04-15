<template>
  <div class="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
    style="background: var(--bg-base);">

    <!-- Animated mesh orbs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div class="absolute w-[600px] h-[600px] rounded-full opacity-20 animate-pulse-slow"
        :style="{ background: `radial-gradient(circle, ${activeAccent}55, transparent 70%)`, top: '-10%', left: '-10%', transition: 'background 0.8s ease' }"></div>
      <div class="absolute w-[500px] h-[500px] rounded-full opacity-15 animate-float"
        :style="{ background: `radial-gradient(circle, ${activeAccentSecondary}44, transparent 70%)`, bottom: '-15%', right: '-10%', transition: 'background 0.8s ease' }"></div>
      <div class="absolute w-[300px] h-[300px] rounded-full opacity-10"
        style="background: radial-gradient(circle, rgba(99,102,241,0.6), transparent 70%); top: 50%; left: 50%; transform: translate(-50%,-50%);"></div>
    </div>

    <!-- Login Card -->
    <div class="w-full max-w-md relative z-10">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4 shadow-2xl"
          :style="{ background: activeGradient, transition: 'background 0.8s ease' }">
          <Building2 class="w-7 h-7 text-white" />
        </div>
        <h1 class="text-3xl font-black tracking-tight text-[var(--text-primary)]">CommunityHub <span :style="{ background: activeGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', transition: 'background 0.8s ease' }">Pro</span></h1>
        <p class="mt-1.5 text-sm text-[var(--text-muted)]">Premium community management platform</p>
      </div>

      <!-- Glass Card -->
      <div class="rounded-3xl p-6 shadow-2xl bg-[var(--bg-glass)] border-opacity-50 border border-[var(--border-glass)] backdrop-blur-xl">

        <!-- Demo banner -->
        <div class="flex items-center gap-2 px-3 py-2 rounded-xl mb-5 text-xs bg-[var(--bg-glass-hover)] border border-[var(--border-glass)]">
          <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span class="text-[var(--text-muted)]">Demo mode — select any role to explore the platform</span>
        </div>

        <!-- Role selector heading -->
        <p class="text-xs font-bold uppercase tracking-widest mb-3 text-[var(--text-muted)]">Select your role</p>

        <!-- User cards grid -->
        <div class="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto no-scrollbar pr-1">
          <button v-for="user in filteredUsers" :key="user.id"
            @click="selectedUser = user"
            class="flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 text-left w-full"
            :style="selectedUser?.id === user.id
              ? { background: getRoleGradient(user.role) + '25', border: '1px solid ' + getRoleAccent(user.role) + '55', boxShadow: '0 0 20px ' + getRoleAccent(user.role) + '20' }
              : { background: 'var(--bg-glass-hover)', border: '1px solid var(--border-glass)' }">
            <!-- Avatar -->
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg"
              :style="{ background: getRoleGradient(user.role) }">
              {{ user.name.split(' ').map(n => n[0]).join('').slice(0, 2) }}
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate text-[var(--text-primary)]">{{ user.name }}</p>
              <p class="text-[11px] truncate" :style="{ color: getRoleAccent(user.role) }">{{ roleLabel(user.role) }}</p>
            </div>
            <!-- Check -->
            <div v-if="selectedUser?.id === user.id"
              class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              :style="{ background: getRoleGradient(user.role) }">
              <Check class="w-3 h-3 text-white" />
            </div>
          </button>
        </div>

        <!-- Sign In button -->
        <button @click="signIn"
          :disabled="!selectedUser"
          class="mt-5 w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden"
          :class="selectedUser ? 'text-white' : 'text-[var(--text-muted)]'"
          :style="selectedUser
            ? { background: activeGradient, boxShadow: '0 8px 32px ' + activeAccent + '44' }
            : { background: 'var(--bg-glass-hover)', cursor: 'not-allowed' }">
          <span class="relative z-10 flex items-center justify-center gap-2">
            <LogIn class="w-4 h-4" />
            {{ selectedUser ? `Sign in as ${selectedUser.name.split(' ')[0]}` : 'Select a role to sign in' }}
          </span>
        </button>

        <!-- Signup link -->
        <p class="text-center text-xs mt-3 text-[var(--text-muted)]">
          New here?
          <RouterLink to="/signup" class="font-semibold" style="color: #818cf8;">Create an account</RouterLink>
        </p>
      </div>

      <p class="text-center mt-5 text-[11px] text-[var(--text-muted)]">
        CommunityHub Pro · © 2024 · All rights reserved
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { mockUsers, ROLES } from '../../data/mockData'
import { getRoleHomePath } from '../../router'
import { Building2, Check, LogIn } from 'lucide-vue-next'

const auth = useAuthStore()
const settingsStore = useSettingsStore()
const router = useRouter()
const selectedUser = ref(null)

onMounted(() => {
  settingsStore.fetchSettings()
})

const filteredUsers = computed(() => mockUsers)

const ROLE_GRADIENTS = {
  [ROLES.SUPER_ADMIN]:      'linear-gradient(135deg, #6366f1, #8b5cf6)',
  [ROLES.RESIDENT]:         'linear-gradient(135deg, #10b981, #06b6d4)',
  [ROLES.SECURITY]:         'linear-gradient(135deg, #f59e0b, #ef4444)',

  [ROLES.ACCOUNTANT]:       'linear-gradient(135deg, #14b8a6, #0ea5e9)',
  [ROLES.HR_MANAGER]:       'linear-gradient(135deg, #f43f5e, #fb923c)',
  [ROLES.COMMITTEE_MEMBER]: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
  [ROLES.TECHNICIAN]:       'linear-gradient(135deg, #f97316, #eab308)',
  [ROLES.DELIVERY_AGENT]:   'linear-gradient(135deg, #8b5cf6, #ec4899)',
  [ROLES.OWNER]:            'linear-gradient(135deg, #f59e0b, #f97316)',
}
const ROLE_ACCENTS = {
  [ROLES.SUPER_ADMIN]: '#818cf8', [ROLES.RESIDENT]: '#34d399', [ROLES.SECURITY]: '#fbbf24',
  [ROLES.ACCOUNTANT]: '#2dd4bf', [ROLES.HR_MANAGER]: '#fb7185',
  [ROLES.COMMITTEE_MEMBER]: '#22d3ee', [ROLES.TECHNICIAN]: '#fb923c', [ROLES.DELIVERY_AGENT]: '#a78bfa',
  [ROLES.OWNER]: '#fbbf24',
}
const ROLE_ACCENTS_2 = {
  [ROLES.SUPER_ADMIN]: '#8b5cf6', [ROLES.RESIDENT]: '#06b6d4', [ROLES.SECURITY]: '#ef4444',
  [ROLES.ACCOUNTANT]: '#0ea5e9', [ROLES.HR_MANAGER]: '#f97316',
  [ROLES.COMMITTEE_MEMBER]: '#3b82f6', [ROLES.TECHNICIAN]: '#eab308', [ROLES.DELIVERY_AGENT]: '#db2777',
  [ROLES.OWNER]: '#ea580c',
}

const activeGradient = computed(() => ROLE_GRADIENTS[selectedUser.value?.role] || 'linear-gradient(135deg, #6366f1, #8b5cf6)')
const activeAccent = computed(() => ROLE_ACCENTS[selectedUser.value?.role] || '#818cf8')
const activeAccentSecondary = computed(() => ROLE_ACCENTS_2[selectedUser.value?.role] || '#8b5cf6')

function getRoleGradient(role) { return ROLE_GRADIENTS[role] || 'linear-gradient(135deg,#6366f1,#8b5cf6)' }
function getRoleAccent(role) { return ROLE_ACCENTS[role] || '#818cf8' }
function roleLabel(role) {
  return {
    [ROLES.SUPER_ADMIN]: 'Super Admin', [ROLES.RESIDENT]: 'Resident',
    [ROLES.SECURITY]: 'Security Guard',
    [ROLES.ACCOUNTANT]: 'Accountant', [ROLES.HR_MANAGER]: 'HR Manager',
    [ROLES.COMMITTEE_MEMBER]: 'Committee Member', [ROLES.TECHNICIAN]: 'Technician',
    [ROLES.DELIVERY_AGENT]: 'Delivery Agent', [ROLES.OWNER]: 'Property Owner',
  }[role] || role
}
function signIn() {
  if (!selectedUser.value) return
  auth.login(selectedUser.value.id)
  router.push(getRoleHomePath(selectedUser.value.role))
}
</script>
