/**
 * Authentication service wrapping Catalyst User Management API calls.
 * Manages token storage and current user state in localStorage.
 */
import { authAPI } from './api.js'

const TOKEN_KEY = 'ch_token'
const USER_KEY = 'ch_user'

export const authService = {
    /**
     * Sign in with email + password via Catalyst User Management.
     * Stores the JWT and user object in localStorage.
     * @returns {{ token, user }}
     */
    async login(email, password) {
        const result = await authAPI.login({ email, password })
        if (result.token) {
            localStorage.setItem(TOKEN_KEY, result.token)
            localStorage.setItem(USER_KEY, JSON.stringify(result.user))
        }
        return result
    },

    /**
     * Sign out: call API to invalidate server session, clear storage.
     */
    async logout() {
        if (this.isLoggedIn()) {
            try { await authAPI.logout() } catch { /* best-effort */ }
        }
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
    },

    /**
     * Restore session from localStorage (called on app startup).
     * Returns null if no valid session.
     */
    getStoredUser() {
        try {
            const raw = localStorage.getItem(USER_KEY)
            return raw ? JSON.parse(raw) : null
        } catch {
            return null
        }
    },

    getToken() {
        return localStorage.getItem(TOKEN_KEY)
    },

    isLoggedIn() {
        return !!this.getToken()
    },

    /**
     * Verify the current token is still valid against the server.
     */
    async verifySession() {
        if (!this.isLoggedIn()) return null
        try {
            const result = await authAPI.me()
            return result.user
        } catch {
            this.logout()
            return null
        }
    },
}

export default authService
