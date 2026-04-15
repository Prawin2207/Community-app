<template>
  <!-- Slim dark glass top bar -->
  <header class="sticky top-0 z-40 flex items-center gap-3 px-4 h-14 bg-[var(--bg-card)] border-b border-[var(--border-glass)]">
    <!-- Mobile: hamburger (only when no bottom nav or for drawer) -->
    <button class="md:hidden p-1.5 rounded-lg transition-colors text-[var(--text-muted)]"
      @click="$emit('toggle-mobile')">
      <Menu class="w-5 h-5" />
    </button>

    <!-- Desktop sidebar toggle -->
    <button class="hidden md:flex p-1.5 rounded-lg transition-colors hover:bg-slate-500/10 text-[var(--text-muted)]"
      @click="$emit('toggle-sidebar')">
      <PanelLeft class="w-5 h-5" />
    </button>

    <!-- Role accent bar + page name -->
    <div class="flex items-center gap-2.5 flex-1 min-w-0">
      <div class="w-1 h-5 flex-shrink-0" :style="{ background: roleGradient }"></div>
      <span class="text-sm font-semibold truncate text-[var(--text-primary)]">{{ currentPageName }}</span>
    </div>

    <!-- Right actions -->
    <div class="flex items-center gap-1">
      <!-- Role switcher pill -->
      <div class="relative" ref="roleSwitcherRef">
        <button @click="showRoleSwitcher = !showRoleSwitcher"
          class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all glass-elevated">
          <ArrowLeftRight class="w-3 h-3" />
          Switch
        </button>

        <Transition name="slide-up">
          <div v-if="showRoleSwitcher"
            class="absolute right-0 top-full mt-2 w-64 z-50 overflow-hidden glass-elevated">
            <p class="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Switch Role (Demo)</p>
            <div class="px-2 pb-2 max-h-80 overflow-y-auto no-scrollbar">
              <button v-for="user in auth.mockUsers" :key="user.id"
                @click="switchToRole(user)"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group hover:bg-slate-500/10"
                :class="auth.currentUser?.id === user.id ? 'bg-slate-500/10' : ''">
                <div class="w-8 h-8 flex items-center justify-center text-[#1a1a1a] text-xs font-bold flex-shrink-0"
                  :style="{ background: getRoleGradient(user.role) }">
                  {{ user.name.split(' ').map(n => n[0]).join('').slice(0, 2) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate text-[var(--text-primary)]">{{ user.name }}</p>
                  <p class="text-xs truncate text-[var(--text-muted)]">{{ roleLabel(user.role) }}</p>
                </div>
                <Check v-if="auth.currentUser?.id === user.id" class="w-4 h-4 text-emerald-500 flex-shrink-0" />
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Theme toggle (sun/moon) -->
      <button @click="theme.toggle()"
        class="p-2 rounded-lg transition-all duration-300 hover:bg-slate-500/10 relative overflow-hidden text-[var(--text-muted)]"
        :title="theme.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
        <Transition name="fade" mode="out-in">
          <Sun v-if="!theme.isDark" key="sun" class="w-5 h-5" style="color: #fbbf24;" />
          <Moon v-else key="moon" class="w-5 h-5" style="color: #818cf8;" />
        </Transition>
      </button>

      <!-- Notification bell -->
      <div class="relative" ref="notificationRef">
        <button @click="showNotifications = !showNotifications" 
          class="relative p-2 rounded-lg transition-colors hover:bg-slate-500/10 text-[var(--text-muted)]">
          <Bell class="w-5 h-5" />
          <span v-if="notifications.unreadCount > 0" 
            class="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-rose-500 text-[8px] font-black text-white border border-[var(--bg-card)]">
            {{ notifications.unreadCount > 9 ? '9+' : notifications.unreadCount }}
          </span>
        </button>

        <Transition name="slide-up">
          <div v-if="showNotifications"
            class="absolute right-0 top-full mt-2 w-80 z-50 glass-elevated overflow-hidden">
            <div class="px-4 py-3 flex items-center justify-between border-b border-[var(--border-glass)]">
              <span class="text-xs font-bold text-[var(--text-primary)]">Notifications</span>
              <button v-if="notifications.items.length > 0" @click="notifications.markAllRead()"
                class="text-[10px] font-bold text-indigo-500 hover:text-indigo-400">Mark all as read</button>
            </div>
            
            <div class="max-h-[24rem] overflow-y-auto no-scrollbar py-2">
              <div v-if="notifications.items.length === 0" class="p-8 text-center">
                <div class="w-10 h-10 bg-slate-500/5 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell class="w-5 h-5 text-[var(--text-muted)] opacity-20" />
                </div>
                <p class="text-xs text-[var(--text-muted)] font-medium">No notifications yet</p>
              </div>
              <div v-else class="space-y-1 px-2">
                <button v-for="n in notifications.items" :key="n.id"
                  @click="handleNotificationClick(n)"
                  class="w-full flex gap-3 p-3 rounded-xl transition-all hover:bg-slate-500/5 text-left relative group">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getEventColor(n.event)">
                    <component :is="getEventIcon(n.event)" class="w-4 h-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium leading-relaxed text-[var(--text-primary)]" :class="n.read ? 'opacity-60' : 'font-bold'">
                      {{ n.message }}
                    </p>
                    <p class="text-[10px] text-[var(--text-muted)] mt-1 font-medium">{{ formatTime(n.ts) }}</p>
                  </div>
                  <div v-if="!n.read" class="w-1.5 h-1.5 rounded-full bg-indigo-500 absolute top-4 right-3"></div>
                </button>
              </div>
            </div>
            
            <div v-if="notifications.items.length > 0" class="p-3 border-t border-[var(--border-glass)] text-center">
              <button @click="notifications.clear()" 
                class="text-[10px] font-bold text-[var(--text-muted)] hover:text-rose-500 transition-colors">Clear history</button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Avatar + profile dropdown -->
      <div class="relative" ref="profileRef">
        <button @click="showProfile = !showProfile"
          class="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-all hover:bg-slate-500/10">
          <div class="w-7 h-7 flex items-center justify-center text-[#1a1a1a] text-xs font-bold shadow-md"
            :style="{ background: roleGradient }">
            {{ userInitials }}
          </div>
          <span class="hidden lg:block text-xs font-semibold text-[var(--text-primary)]">{{ firstName }}</span>
          <ChevronDown class="hidden lg:block w-3 h-3 text-[var(--text-muted)]" />
        </button>

        <Transition name="slide-up">
          <div v-if="showProfile"
            class="absolute right-0 top-full mt-2 w-56 z-50 glass-elevated">
            <div class="px-4 py-4">
              <div class="w-10 h-10 flex items-center justify-center text-[#1a1a1a] font-bold mb-2"
                :style="{ background: roleGradient }">{{ userInitials }}</div>
              <p class="text-sm font-semibold text-[var(--text-primary)]">{{ auth.currentUser?.name }}</p>
              <p class="text-xs mt-0.5 text-[var(--text-muted)]">{{ auth.currentUser?.email }}</p>
              <div class="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                :style="{ background: roleGradient + '33', border: '1px solid ' + roleGradient.split(',')[0].replace('linear-gradient(135deg,', '') + '55', color: 'var(--text-primary)' }">
                <span class="w-1.5 h-1.5 animate-pulse" :style="{ background: roleGradient }"></span>
                {{ roleLabel(auth.role) }}
              </div>
            </div>
            <div style="border-top: 1px solid var(--border-glass);" class="p-2">
              <button @click="logout"
                class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-rose-500/10 text-rose-500">
                <LogOut class="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { useNotificationStore } from '../stores/notificationStore'
import { getRoleHomePath } from '../router'
import { ROLES } from '../data/mockData'
import { Menu, PanelLeft, Bell, ChevronDown, ArrowLeftRight, Check, LogOut, Sun, Moon, User, Wrench, Megaphone, Info, AlertCircle } from 'lucide-vue-next'

defineEmits(['toggle-sidebar', 'toggle-mobile'])
const auth = useAuthStore()
const theme = useThemeStore()
const notifications = useNotificationStore()
const router = useRouter()
const route = useRoute()
const showProfile = ref(false)
const showRoleSwitcher = ref(false)
const showNotifications = ref(false)
const profileRef = ref(null)
const roleSwitcherRef = ref(null)
const notificationRef = ref(null)

onMounted(() => {
  notifications.init()
  document.addEventListener('click', handleOutsideClick)
})

const userInitials = computed(() => {
  const name = auth.currentUser?.name || ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const firstName = computed(() => auth.currentUser?.name?.split(' ')[0] || '')

const currentPageName = computed(() => {
  const name = route.name || ''
  return name.replace(/([A-Z])/g, ' $1').trim()
})

const roleGradient = computed(() => 'var(--accent-1)')
function getRoleGradient(role) { return 'var(--accent-1)' }

function roleLabel(role) {
  return {
    [ROLES.SUPER_ADMIN]: 'Super Admin', [ROLES.RESIDENT]: 'Resident',
    [ROLES.SECURITY]: 'Security Guard',
    [ROLES.ACCOUNTANT]: 'Accountant', [ROLES.HR_MANAGER]: 'HR Manager',
    [ROLES.COMMITTEE_MEMBER]: 'Committee Member', [ROLES.TECHNICIAN]: 'Technician',
    [ROLES.DELIVERY_AGENT]: 'Delivery Agent',
  }[role] || role
}

function switchToRole(user) {
  auth.switchRole(user.id)
  showRoleSwitcher.value = false
  router.push(getRoleHomePath(user.role))
}
function logout() { 
  auth.logout()
  showProfile.value = false
  router.push('/login') 
}

function handleNotificationClick(n) {
  notifications.markRead(n.id)
  // Logic to navigate or open detail could be added here
}

function getEventIcon(e) {
  if (e.includes('visitor')) return User
  if (e.includes('complaint')) return Wrench
  if (e.includes('broadcast')) return Megaphone
  if (e.includes('emergency')) return AlertCircle
  return Info
}

function getEventColor(e) {
  if (e.includes('visitor')) return 'bg-rose-500/10 text-rose-500'
  if (e.includes('complaint')) return 'bg-amber-500/10 text-amber-500'
  if (e.includes('broadcast')) return 'bg-indigo-500/10 text-indigo-500'
  if (e.includes('emergency')) return 'bg-rose-600 text-white animate-pulse'
  return 'bg-slate-500/10 text-slate-500'
}

function formatTime(ts) {
  const d = new Date(ts)
  const diff = Date.now() - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function handleOutsideClick(e) {
  if (profileRef.value && !profileRef.value.contains(e.target)) showProfile.value = false
  if (roleSwitcherRef.value && !roleSwitcherRef.value.contains(e.target)) showRoleSwitcher.value = false
  if (notificationRef.value && !notificationRef.value.contains(e.target)) showNotifications.value = false
}
onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>
