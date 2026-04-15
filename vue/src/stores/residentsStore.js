/**
 * Residents Store — API-backed with mock data fallback.
 * Uses residentsAPI from services/api.js for real Catalyst Data Store calls.
 */
import { defineStore } from 'pinia'
import { ref, computed , watch } from 'vue'
import { residentsAPI } from '../services/api.js'
import { SyncService } from '../services/syncService.js'
import { mockResidents } from '../data/mockData.js'

export const useResidentsStore = defineStore('residents', () => {
    const items = ref([])

    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem(`ch_mock_residents`, JSON.stringify(newVal));
    }, { deep: true });
    
    const isLoading = ref(false)
    const error = ref(null)
    const isUsingMock = ref(false)

    // ── Computed helpers ─────────────────────────────────
    const totalResidents = computed(() => items.value.length)
    const activeResidents = computed(() => items.value.filter(r => r.status === 'active').length)
    const pendingResidents = computed(() => items.value.filter(r => r.status === 'pending').length)

    // ── Actions ──────────────────────────────────────────
    async function fetchAll(params = {}) {
        isLoading.value = true
        error.value = null
        try {
            const result = await residentsAPI.list(params)
            const responseData = result.data; 
            const rawData = responseData.data || responseData;
            
            // Map rows and parse JSON documents from description
            const serverItems = Array.isArray(rawData) ? rawData.map(r => {
                const item = r.Residents || r;
                let docs = [];
                try {
                    docs = item.description ? JSON.parse(item.description) : [];
                    if (!Array.isArray(docs)) docs = [];
                } catch (e) {
                    docs = [];
                }
                return { ...item, documents: docs };
            }) : [];
            
            // Merge with local pending items
            const pendingItems = SyncService.getPendingItems('Residents');
            const mergedItems = [...pendingItems, ...serverItems];
            
            if (mergedItems.length === 0) {
                items.value = mockResidents;
                isUsingMock.value = true;
            } else {
                items.value = mergedItems;
                isUsingMock.value = false;
            }
        } catch (err) {
            console.error('[residentsStore] API Error:', err.message || err)
            error.value = err.message || 'Failed to fetch residents'
            if (items.value.length === 0) {
              items.value = mockResidents;
              isUsingMock.value = true;
            }
        } finally {
            isLoading.value = false
        }
    }

    async function create(data) {
        error.value = null
        try {
            const result = await residentsAPI.create(data)
            let responseData = result.data;
            if (responseData && responseData.data) responseData = responseData.data;
            
            let newResident = responseData.resident || responseData;

            if (result.data?._fake) {
                newResident = { ...newResident, isPending: true, ROWID: `temp_${Date.now()}` }
            }

            // Parse docs for local state
            let docs = [];
            try {
                docs = newResident.description ? JSON.parse(newResident.description) : (data.documents || []);
            } catch (e) {
                docs = data.documents || [];
            }

            newResident = { status: 'active', type: 'Owner', dues: 0, ...newResident, documents: docs }
            items.value.unshift(newResident)
            return { success: true, isPending: !!result.data?._fake }
        } catch (err) {
            console.error('[residentsStore] Create Error:', err)
            error.value = err.message || 'Failed to create resident'
            return { success: false, error: error.value }
        }
    }

    async function update(data) {
        error.value = null
        const id = data.ROWID || data.id;
        if (!id) return { success: false, error: 'No ID provided' };

        try {
            const result = await residentsAPI.update(id, data)
            let responseData = result.data;
            if (responseData && responseData.data) responseData = responseData.data;

            let updated = responseData.resident || responseData;

            if (result.data?._fake) {
                updated = { ...updated, isPending: true }
            }

            // Parse docs for local state
            let docs = [];
            try {
                docs = updated.description ? JSON.parse(updated.description) : (data.documents || []);
            } catch (e) {
                docs = data.documents || [];
            }

            updated = { status: 'active', type: 'Owner', dues: 0, ...updated, documents: docs }

            const idx = items.value.findIndex(r => r.ROWID === id || r.id === id);
            if (idx !== -1) Object.assign(items.value[idx], updated);
            return { success: true, isPending: !!result.data?._fake }
        } catch (err) {
            console.error('[residentsStore] Update Error:', err)
            error.value = err.message || 'Failed to update resident'
            return { success: false, error: error.value }
        }
    }

    async function remove(id) {
        error.value = null
        try {
            await residentsAPI.remove(id)
            items.value = items.value.filter(r => r.ROWID !== id && r.id !== id)
            return { success: true }
        } catch (err) {
            console.error('[residentsStore] Remove Error:', err)
            error.value = err.message || 'Failed to remove resident'
            return { success: false, error: error.value }
        }
    }

    // Initialize without mock data
    items.value = []
    isUsingMock.value = false

    return {
        items, isLoading, error, isUsingMock,
        totalResidents, activeResidents, pendingResidents,
        fetchAll, create, update, remove,
    }
})
