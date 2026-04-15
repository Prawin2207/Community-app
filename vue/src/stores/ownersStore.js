/**
 * Owners Store — API-backed.
 * Uses ownersAPI from services/api.js for Catalyst Data Store calls.
 */
import { defineStore } from 'pinia'
import { ref, computed , watch } from 'vue'
import { ownersAPI } from '../services/api.js'
import { mockOwners } from '../data/mockData.js'

export const useOwnersStore = defineStore('owners', () => {
    const items = ref([])

    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem(`ch_mock_owners`, JSON.stringify(newVal));
    }, { deep: true });
    
    const isLoading = ref(false)
    const error = ref(null)

    // ── Computed helpers ─────────────────────────────────
    const totalOwners = computed(() => items.value.length)
    const activeOwners = computed(() => items.value.filter(o => o.status === 'active').length)

    // ── Actions ──────────────────────────────────────────
    async function fetchAll(params = {}) {
        isLoading.value = true
        error.value = null
        try {
            const result = await ownersAPI.list(params)
            const responseData = result.data
            const rawData = responseData.data || responseData
            
            // Map rows and parse JSON documents from description
            const serverItems = Array.isArray(rawData) ? rawData.map(r => {
                const item = r.Owners || r;
                let docs = [];
                try {
                    docs = item.description ? JSON.parse(item.description) : [];
                    if (!Array.isArray(docs)) docs = [];
                } catch (e) {
                    docs = [];
                }
                return { ...item, documents: docs };
            }) : [];

            if (serverItems.length === 0) {
                const local = localStorage.getItem(`ch_mock_owners`);
                items.value = local ? JSON.parse(local) : mockOwners;
            } else {
                items.value = serverItems;
            }
        } catch (err) {
            console.error('[ownersStore] API Error:', err.message || err)
            error.value = err.message || 'Failed to fetch owners'
            const local = localStorage.getItem(`ch_mock_owners`);
            items.value = local ? JSON.parse(local) : mockOwners;
        } finally {
            isLoading.value = false
        }
    }

    async function create(data) {
        error.value = null
        try {
            const result = await ownersAPI.create(data)
            let responseData = result.data
            if (responseData && responseData.data) responseData = responseData.data;

            let newOwner = responseData.owner || responseData
            
            // Parse docs for local state
            let docs = [];
            try {
                docs = newOwner.description ? JSON.parse(newOwner.description) : (data.documents || []);
            } catch (e) {
                docs = data.documents || [];
            }

            newOwner = { status: 'active', ownershipType: 'Sole', ...newOwner, documents: docs }
            items.value.unshift(newOwner)
            return { success: true }
        } catch (err) {
            console.error('[ownersStore] Create Error:', err)
            error.value = err.message || 'Failed to create owner'
            return { success: false, error: error.value }
        }
    }

    async function update(data) {
        error.value = null
        const id = data.ROWID || data.id;
        if (!id) return { success: false, error: 'No ID provided' };

        try {
            const result = await ownersAPI.update(id, data)
            let responseData = result.data
            if (responseData && responseData.data) responseData = responseData.data;

            let updated = responseData.Owners || responseData.owner || responseData
            
            // Parse docs for local state
            let docs = [];
            try {
                docs = updated.description ? JSON.parse(updated.description) : (data.documents || []);
            } catch (e) {
                docs = data.documents || [];
            }

            updated = { status: 'active', ownershipType: 'Sole', ...updated, documents: docs }
            const idx = items.value.findIndex(o => o.ROWID === id || o.id === id)
            if (idx !== -1) Object.assign(items.value[idx], updated)
            return { success: true }
        } catch (err) {
            console.error('[ownersStore] Update Error:', err)
            error.value = err.message || 'Failed to update owner'
            return { success: false, error: error.value }
        }
    }

    async function remove(id) {
        error.value = null
        try {
            await ownersAPI.remove(id)
            items.value = items.value.filter(o => o.ROWID !== id && o.id !== id)
            return { success: true }
        } catch (err) {
            console.error('[ownersStore] Remove Error:', err)
            error.value = err.message || 'Failed to remove owner'
            return { success: false, error: error.value }
        }
    }

    items.value = []

    return {
        items, isLoading, error,
        totalOwners, activeOwners,
        fetchAll, create, update, remove,
    }
})
