import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers } from '../data/mockData'

/**
 * authStore — Demo mode auth (no JWT, no backend).
 *
 * Login selects a mock user by ID and stores it in localStorage.
 * All authenticated state is derived from that stored user object.
 */
export const useAuthStore = defineStore('auth', () => {
    // ── State ──────────────────────────────────────────────────────────────
    const token           = ref(localStorage.getItem('ch_token') || null)
    const currentUser     = ref(JSON.parse(localStorage.getItem('ch_user') || 'null'))
    const isAuthenticated = ref(!!token.value)
    const isLoading       = ref(false)
    const error           = ref(null)

    // ── Computed ──────────────────────────────────────────────────────────
    const role        = computed(() => currentUser.value?.role ?? null)
    const communityId = computed(() => currentUser.value?.communityId ?? 'demo_community')
    const flatId      = computed(() => currentUser.value?.apartment ?? null)
    const userId      = computed(() => currentUser.value?.id ?? null)
    const userName    = computed(() => currentUser.value?.name ?? '')
    const userEmail   = computed(() => currentUser.value?.email ?? '')

    // Role helpers
    const isSuperAdmin      = computed(() => role.value === 'super_admin')
    const isCommunityAdmin  = computed(() => role.value === 'community_admin')
    const isAdmin           = computed(() => ['super_admin', 'community_admin'].includes(role.value))
    const isOwner           = computed(() => role.value === 'owner')
    const isTenant          = computed(() => role.value === 'tenant')
    const isResident        = computed(() => ['owner', 'tenant', 'family_member', 'resident'].includes(role.value))
    const isSecurity        = computed(() => role.value === 'security')
    const isTechnician      = computed(() => role.value === 'technician')
    const isAccountant      = computed(() => role.value === 'accountant')
    const isHRManager       = computed(() => role.value === 'hr_manager')
    const isCommitteeMember = computed(() => role.value === 'committee_member')
    const isDeliveryAgent   = computed(() => role.value === 'delivery_agent')

    // ── Actions ──────────────────────────────────────────────────────────

    /**
     * Demo login — select a mock user by ID, no network needed.
     */
    function login(mockUserId) {
        const user = mockUsers.find(u => u.id === mockUserId)
        if (!user) return
        const demoToken       = 'demo_' + user.id
        token.value           = demoToken
        currentUser.value     = user
        isAuthenticated.value = true
        localStorage.setItem('ch_token', demoToken)
        localStorage.setItem('ch_user', JSON.stringify(user))
    }

    /** Kept for API compatibility — picks user by email, no password check */
    async function loginWithCredentials(email) {
        const user = mockUsers.find(u => u.email === email) || mockUsers[0]
        login(user.id)
        return { success: true, user }
    }

    /** Logout — clear all local state */
    function logout() {
        token.value           = null
        currentUser.value     = null
        isAuthenticated.value = false
        localStorage.removeItem('ch_token')
        localStorage.removeItem('ch_user')
        window.location.href = '/#/login'
    }

    /** Restore session from localStorage on app start — no network, instant */
    function restoreSession() {
        const savedUser  = localStorage.getItem('ch_user')
        const savedToken = localStorage.getItem('ch_token')
        if (!savedUser || !savedToken) return
        currentUser.value     = JSON.parse(savedUser)
        token.value           = savedToken
        isAuthenticated.value = true
    }

    /** Update specific user fields (e.g. after profile edit) */
    function updateUser(fields) {
        if (!currentUser.value) return
        currentUser.value = { ...currentUser.value, ...fields }
        localStorage.setItem('ch_user', JSON.stringify(currentUser.value))
    }

    // ── Export ────────────────────────────────────────────────────────────
    return {
        token, currentUser, isAuthenticated, isLoading, error,
        role, communityId, flatId, userId, userName, userEmail,
        isAdmin, isSuperAdmin, isCommunityAdmin,
        isOwner, isTenant, isResident,
        isSecurity, isTechnician, isAccountant, isHRManager,
        isCommitteeMember, isDeliveryAgent,
        login, loginWithCredentials, logout, restoreSession, updateUser,
        switchRole: login, mockUsers
    }
})
