<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8"
    style="background-color: var(--bg-base);">

    <!-- Animated background orbs -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
        style="background: radial-gradient(circle, #6366f1, transparent); top: -5%; left: 20%;" />
      <div class="absolute w-72 h-72 rounded-full blur-3xl opacity-15 animate-pulse"
        style="background: radial-gradient(circle, #8b5cf6, transparent); bottom: 10%; right: 10%; animation-delay: 1s;" />
    </div>

    <div class="w-full max-w-lg relative z-10">

      <!-- Logo -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
          style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
          <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 class="text-2xl font-black" style="color: var(--text-primary);">
          Create Account
        </h1>
        <p class="text-sm mt-1" style="color: var(--text-muted);">
          Join CommunityHub Pro
        </p>
      </div>

      <!-- Signup Card -->
      <div class="glass rounded-3xl p-6 space-y-4">

        <!-- Error -->
        <div v-if="error" class="flex items-start gap-3 p-3 rounded-xl text-sm"
          style="background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.3); color: #fb7185;">
          <span>⚠️</span> <span>{{ error }}</span>
        </div>

        <!-- Success -->
        <div v-if="success" class="flex items-start gap-3 p-3 rounded-xl text-sm"
          style="background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.3); color: #34d399;">
          <span>✅</span> <span>Account created! Redirecting…</span>
        </div>

        <!-- Name row -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--text-muted);">First Name</label>
            <input v-model="form.firstName" type="text" placeholder="Rajan" class="input w-full"
              style="background: var(--bg-elevated); border: 1px solid var(--border-glass); color: var(--text-primary); border-radius: 12px; padding: 10px 14px; outline: none;" />
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--text-muted);">Last Name</label>
            <input v-model="form.lastName" type="text" placeholder="Mehta" class="input w-full"
              style="background: var(--bg-elevated); border: 1px solid var(--border-glass); color: var(--text-primary); border-radius: 12px; padding: 10px 14px; outline: none;" />
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--text-muted);">Email Address</label>
          <input v-model="form.email" type="email" placeholder="you@example.com" class="input w-full"
            style="background: var(--bg-elevated); border: 1px solid var(--border-glass); color: var(--text-primary); border-radius: 12px; padding: 10px 14px; outline: none;" />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--text-muted);">Password <span style="color: var(--text-muted); font-weight: normal;">(min 8 chars)</span></label>
          <div class="relative">
            <input v-model="form.password" :type="showPwd ? 'text' : 'password'" placeholder="••••••••" class="input w-full pr-10"
              style="background: var(--bg-elevated); border: 1px solid var(--border-glass); color: var(--text-primary); border-radius: 12px; padding: 10px 14px; outline: none;" />
            <button type="button" @click="showPwd = !showPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style="color: var(--text-muted);">
              {{ showPwd ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <!-- Role + Apartment row -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--text-muted);">Role</label>
            <select v-model="form.role" class="input w-full"
              style="background: var(--bg-elevated); border: 1px solid var(--border-glass); color: var(--text-primary); border-radius: 12px; padding: 10px 14px; outline: none;">
              <option v-for="r in roles" :key="r.value" :value="r.value">{{ r.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--text-muted);">Apartment <span style="color: var(--text-muted); font-weight:normal;">(optional)</span></label>
            <input v-model="form.apartment" type="text" placeholder="A-101"
              style="background: var(--bg-elevated); border: 1px solid var(--border-glass); color: var(--text-primary); border-radius: 12px; padding: 10px 14px; outline: none; width: 100%;" />
          </div>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--text-muted);">Phone <span style="color: var(--text-muted); font-weight:normal;">(optional)</span></label>
          <input v-model="form.phone" type="tel" placeholder="+91 98765 43210"
            style="background: var(--bg-elevated); border: 1px solid var(--border-glass); color: var(--text-primary); border-radius: 12px; padding: 10px 14px; outline: none; width: 100%;" />
        </div>

        <!-- Submit -->
        <button @click="handleSignup" :disabled="loading"
          class="w-full py-3 rounded-xl font-bold text-white transition-all duration-300 mt-2"
          :style="{ background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', cursor: loading ? 'not-allowed' : 'pointer' }">
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Creating account…
          </span>
          <span v-else>Create Account →</span>
        </button>

        <!-- Login link -->
        <p class="text-center text-sm" style="color: var(--text-muted);">
          Already have an account?
          <RouterLink to="/login" class="font-semibold" style="color: #818cf8;">Sign in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { authAPI } from '../../services/api.js'
import { socket } from '../../services/socket.js'

const router = useRouter()
const auth = useAuthStore()

const form = ref({ firstName: '', lastName: '', email: '', password: '', role: 'resident', apartment: '', phone: '' })
const loading = ref(false)
const error = ref('')
const success = ref(false)
const showPwd = ref(false)

const roles = [
  { value: 'resident',         label: '🏠 Resident' },
  { value: 'super_admin',      label: '👑 Super Admin' },
  { value: 'security',         label: '🛡️ Security Guard' },
  { value: 'facility_manager', label: '🔧 Facility Manager' },
  { value: 'accountant',       label: '💰 Accountant' },
  { value: 'hr_manager',       label: '👥 HR Manager' },
  { value: 'committee_member', label: '📋 Committee Member' },
  { value: 'technician',       label: '⚙️ Technician' },
  { value: 'delivery_agent',   label: '📦 Delivery Agent' },
]

async function handleSignup() {
  error.value = ''
  const { firstName, lastName, email, password } = form.value
  if (!firstName || !lastName || !email || !password) {
    error.value = 'Please fill in all required fields.'
    return
  }
  if (password.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }

  loading.value = true
  try {
    const result = await authAPI.signup(form.value)
    // Store session
    localStorage.setItem('ch_token', result.token)
    localStorage.setItem('ch_user', JSON.stringify(result.user))
    auth.currentUser = result.user
    auth.isAuthenticated = true
    success.value = true
    // Connect socket
    socket.connect(result.user.userId)
    // Redirect to correct dashboard
    setTimeout(() => router.push(getRolePath(result.user.role)), 1200)
  } catch (err) {
    error.value = err.error || 'Signup failed. Please try again.'
  } finally {
    loading.value = false
  }
}

function getRolePath(role) {
  const map = {
    super_admin:      '/admin/dashboard',
    resident:         '/resident/dashboard',
    security:         '/security/dashboard',
    facility_manager: '/facility/dashboard',
    accountant:       '/accountant/dashboard',
    hr_manager:       '/hr/dashboard',
    committee_member: '/committee/dashboard',
    technician:       '/technician/dashboard',
    delivery_agent:   '/delivery/dashboard',
  }
  return map[role] || '/login'
}
</script>
