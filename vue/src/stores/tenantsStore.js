/**
 * Tenants Store — API-backed.
 * Manages tenants linked to flat and owner.
 */
import { defineStore } from 'pinia'
import { ref, computed , watch } from 'vue'
import { tenantsAPI } from '../services/api.js'
import { mockTenants } from '../data/mockData.js'

export const useTenantsStore = defineStore('tenants', () => {
    const items = ref([])


    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem(`ch_mock_tenants`, JSON.stringify(newVal));
    }, { deep: true });
    const isLoading = ref(false)
    const error = ref(null)

    const activeTenants = computed(() => items.value.filter(t => t.status === 'active'))
    const movedOutTenants = computed(() => items.value.filter(t => t.status === 'moved_out'))

    async function fetchAll(params = {}) {
        isLoading.value = true
        error.value = null
        try {
            const result = await tenantsAPI.list(params)
            const raw = result.data?.data || result.data || []
            const serverItems = Array.isArray(raw) ? raw.map(r => r.Tenants || r) : []
            items.value = serverItems.length > 0 ? serverItems : (JSON.parse(localStorage.getItem(`ch_mock_tenants`)) || mockTenants)
        } catch (err) {
            console.error('[tenantsStore] Fetch error:', err.message)
            error.value = err.message || 'Failed to fetch tenants'
        
            items.value = JSON.parse(localStorage.getItem(`ch_mock_tenants`)) || mockTenants;
        } finally {
            isLoading.value = false
        }
    }

    async function fetchByFlat(flatId) {
        return fetchAll({ flatId })
    }

    async function fetchByOwner(ownerId) {
        return fetchAll({ ownerId })
    }

    async function create(data) {
        error.value = null
        try {
            const result = await tenantsAPI.create(data)
            let row = result.data?.data || result.data
            row = row?.Tenants || row
            items.value.push({ status: 'active', ...row })
            return { success: true, data: row }
        } catch (err) {
            error.value = err.message || 'Failed to create tenant'
            return { success: false, error: error.value }
        }
    }

    async function update(id, data) {
        error.value = null
        try {
            const result = await tenantsAPI.update(id, data)
            let row = result.data?.data || result.data
            row = row?.Tenants || row
            const idx = items.value.findIndex(t => t.ROWID === id || t.id === id)
            if (idx !== -1) Object.assign(items.value[idx], row)
            return { success: true }
        } catch (err) {
            error.value = err.message || 'Failed to update tenant'
            return { success: false, error: error.value }
        }
    }

    async function moveOut(id, flatId, moveOutDate) {
        return update(id, { status: 'moved_out', moveOutDate, flatId })
    }

    return {
        items, isLoading, error,
        activeTenants, movedOutTenants,
        fetchAll, fetchByFlat, fetchByOwner, create, update, moveOut,
    }
})
