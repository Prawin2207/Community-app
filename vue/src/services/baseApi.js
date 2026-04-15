/**
 * baseApi.js — The core Axios instance configuration.
 * Separated to avoid circular dependencies with SyncService.
 */
import axios from 'axios'

// ── Base URL ──────────────────────────────────────────────────────────────────
let BASE_URL = (process.env.VUE_APP_API_BASE && process.env.VUE_APP_API_BASE.trim() !== '')
    ? process.env.VUE_APP_API_BASE.trim()
    : '/server/communityAPI'

if (BASE_URL.endsWith('/')) BASE_URL = BASE_URL.slice(0, -1)

export { BASE_URL }

const baseApi = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
    headers: { 'Content-Type': 'application/json' },
})

// ── Request Interceptor — inject auth + community headers ─────────────────────
baseApi.interceptors.request.use((config) => {
    const token       = localStorage.getItem('ch_token')
    const communityId = JSON.parse(localStorage.getItem('ch_user') || '{}')?.communityId

    if (token)       config.headers['Authorization']  = `Bearer ${token}`
    if (communityId) config.headers['X-Community-ID'] = communityId

    return config
}, (error) => Promise.reject(error))

// ── Response Interceptor — handle 401 globally ────────────────────────────────
baseApi.interceptors.response.use(
    (response) => response,
    (error) => {
        const token = localStorage.getItem('ch_token')
        const isDemo = token && token.startsWith('demo_')

        // Only redirect on 401 if it's a real token (not a demo session)
        if (error.response?.status === 401 && !isDemo) {
            localStorage.removeItem('ch_token')
            localStorage.removeItem('ch_user')
            window.location.href = '/#/login'
        }
        return Promise.reject(error)
    }
)

export default baseApi
