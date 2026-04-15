/**
 * Flats Store — API-backed.
 * Manages flat registry with computed maintenance amounts.
 */
import { defineStore } from 'pinia'
import { ref, computed , watch } from 'vue'
import { flatsAPI } from '../services/api.js'
import { mockFlats } from '../data/mockData.js'

export const useFlatsStore = defineStore('flats', () => {
    const items = ref([])

    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem(`ch_mock_flats`, JSON.stringify(newVal));
    }, { deep: true });
    
    const isLoading = ref(false)
    const error = ref(null)

    // Computed
    const totalFlats = computed(() => items.value.length)
    const vacantFlats = computed(() => items.value.filter(f => f.status === 'vacant').length)
    const rentedFlats = computed(() => items.value.filter(f => f.status === 'rented').length)
    const ownerOccupied = computed(() => items.value.filter(f => f.status === 'owner_occupied').length)

    // ── Actions ──────────────────────────────────────────
    async function fetchAll(params = {}) {
        isLoading.value = true
        error.value = null
        try {
            const result = await flatsAPI.list(params)
            const raw = result.data?.data || result.data || []
            
            // Map rows and parse JSON documents from description
            const serverItems = Array.isArray(raw) ? raw.map(r => {
                const item = r.Flats || r;
                let docs = [];
                try {
                    docs = item.description ? JSON.parse(item.description) : [];
                    if (!Array.isArray(docs)) docs = [];
                } catch (e) {
                    docs = [];
                }
                
                return { 
                    ...item, 
                    sqft: item.area || '0', // Map area back to sqft for frontend
                    status: item.occupancyStatus || 'vacant', // Map occupancyStatus back to status
                    documents: docs 
                };
            }) : [];

            if (serverItems.length === 0) {
                const local = localStorage.getItem(`ch_mock_flats`);
                items.value = local ? JSON.parse(local) : mockFlats;
            } else {
                items.value = serverItems;
            }
        } catch (err) {
            console.error('[flatsStore] Fetch error:', err.message)
            error.value = err.message || 'Failed to fetch flats'
            const local = localStorage.getItem(`ch_mock_flats`);
            items.value = local ? JSON.parse(local) : mockFlats;
        } finally {
            isLoading.value = false
        }
    }

    async function create(data) {
        error.value = null
        try {
            const result = await flatsAPI.create(data)
            let row = result.data?.data || result.data
            row = row?.Flats || row
            
            // Parse docs for local state
            let docs = [];
            try {
                docs = row.description ? JSON.parse(row.description) : (data.documents || []);
            } catch (e) {
                docs = data.documents || [];
            }

            const newFlat = { 
                ...row, 
                sqft: row.area || data.sqft, 
                status: row.occupancyStatus || data.status || 'vacant',
                documents: docs 
            }
            items.value.push(newFlat)
            return { success: true, data: newFlat }
        } catch (err) {
            error.value = err.message || 'Failed to create flat'
            return { success: false, error: error.value }
        }
    }

    async function update(id, data) {
        error.value = null
        try {
            const result = await flatsAPI.update(id, data)
            let row = result.data?.data || result.data
            row = row?.Flats || row
            
            // Parse docs for local state
            let docs = [];
            try {
                docs = row.description ? JSON.parse(row.description) : (data.documents || []);
            } catch (e) {
                docs = data.documents || [];
            }

            const updatedFlat = { 
                ...row, 
                sqft: row.area || data.sqft, 
                status: row.occupancyStatus || data.status,
                documents: docs 
            }

            const idx = items.value.findIndex(f => f.ROWID === id || f.id === id)
            if (idx !== -1) Object.assign(items.value[idx], updatedFlat)
            return { success: true }
        } catch (err) {
            error.value = err.message || 'Failed to update flat'
            return { success: false, error: error.value }
        }
    }

    async function remove(id) {
        error.value = null
        try {
            await flatsAPI.remove(id)
            items.value = items.value.filter(f => f.ROWID !== id && f.id !== id)
            return { success: true }
        } catch (err) {
            error.value = err.message || 'Failed to remove flat'
            return { success: false, error: error.value }
        }
    }

    return {
        items, isLoading, error,
        totalFlats, vacantFlats, rentedFlats, ownerOccupied,
        fetchAll, create, update, remove,
    }
})
