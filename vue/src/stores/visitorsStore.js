import { defineStore } from 'pinia'
import { ref, computed , watch } from 'vue'
import { visitorsAPI } from '../services/api.js'
import { SyncService } from '../services/syncService.js'
import { mockVisitors } from '../data/mockData.js'
import { socket } from '../services/socket'

export const useVisitorsStore = defineStore('visitors', () => {
    const items = ref([])


    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem(`ch_mock_visitors`, JSON.stringify(newVal));
    }, { deep: true });
    const isLoading = ref(false)
    const error = ref(null)

    // ── Computed ──────────────────────────────────────────
    const totalVisitors = computed(() => items.value.length)

    // ── Actions ──────────────────────────────────────────
    async function fetchAll(params = {}) {
        isLoading.value = true
        error.value = null
        try {
            const result = await visitorsAPI.list(params)
            const responseData = result.data;
            const rawData = responseData.data || responseData.visitors || responseData;
            const serverItems = Array.isArray(rawData) ? rawData.map(v => v.Visitors || v) : [];
            
            // Merge with local pending items
            const pendingItems = SyncService.getPendingItems('Visitors');
            const mergedItems = [...pendingItems, ...serverItems];

            if (mergedItems.length === 0) {
              items.value = mockVisitors;
            } else {
              items.value = mergedItems;
            }
        } catch (err) {
            console.error('[visitorsStore] API Error:', err.message || err)
            error.value = err.message || 'Failed to fetch visitors'
            if (items.value.length === 0) {
              items.value = mockVisitors;
            }
        } finally {
            isLoading.value = false
        }
    }

    async function logVisitor(data) {
        error.value = null
        try {
            const result = await visitorsAPI.create(data)
            let visitor = responseData.visitor || responseData;

            // Handle fake success
            if (result.data?._fake) {
                visitor = { ...visitor, isPending: true, ROWID: `temp_${Date.now()}` };
            }

            items.value.unshift(visitor)
            
            // Trigger real-time notification to resident
            if (visitor.residentId && !result.data?._fake) {
                socket.send('visitor:new', {
                    residentId: visitor.residentId,
                    visitorName: visitor.name,
                    apartment: visitor.apartment || visitor.hostApartment,
                    purpose: visitor.purpose,
                    timestamp: visitor.CREATEDTIME || new Date().toISOString()
                })
            }

            return { success: true }
        } catch (err) {
            console.error('[visitorsStore] Log Error:', err)
            error.value = err.message || 'Failed to log visitor'
            return { success: false, error: error.value }
        }
    }

    async function updateStatus(id, status) {
        error.value = null
        try {
            const result = await visitorsAPI.update(id, { status })
            let updated = result.data?.data || result.data;
            const idx = items.value.findIndex(v => (v.ROWID || v.id) === id)
            if (idx !== -1) items.value[idx] = { ...items.value[idx], ...updated }
            return { success: true }
        } catch (err) {
            console.error('[visitorsStore] Update Error:', err)
            error.value = err.message || 'Failed to update status'
            return { success: false, error: error.value }
        }
    }

    async function remove(id) {
        error.value = null
        try {
            await visitorsAPI.remove(id)
            items.value = items.value.filter(v => (v.ROWID || v.id) !== id)
            return { success: true }
        } catch (err) {
            console.error('[visitorsStore] Remove Error:', err)
            error.value = err.message || 'Failed to remove visitor'
            return { success: false, error: error.value }
        }
    }

    // Initialize without mock data
    items.value = []

    return {
        items, isLoading, error,
        totalVisitors,
        fetchAll, logVisitor, updateStatus, remove
    }
})
