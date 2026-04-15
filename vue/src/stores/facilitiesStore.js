import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { facilitiesAPI } from '../services/api'
import { mockFacilities } from '../data/mockData'

export const useFacilitiesStore = defineStore('facilities', () => {
    const items = ref([])
    const isLoading = ref(false)
    const error = ref(null)

    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem('ch_mock_facilities', JSON.stringify(newVal));
    }, { deep: true });

    async function fetchAll() {
        isLoading.value = true
        error.value = null
        try {
            const result = await facilitiesAPI.list()
            const responseData = result.data;
            const rawData = responseData.data || responseData;
            const serverItems = Array.isArray(rawData) ? rawData.map(f => f.Facilities || f) : []
            items.value = serverItems.length > 0 ? serverItems : (JSON.parse(localStorage.getItem('ch_mock_facilities')) || mockFacilities)
        } catch (err) {
            console.error('[facilitiesStore] API Error:', err)
            error.value = err.message || 'Failed to fetch facilities'
            items.value = JSON.parse(localStorage.getItem('ch_mock_facilities')) || mockFacilities
        } finally {
            isLoading.value = false
        }
    }

    async function create(data) {
        try {
            const res = await facilitiesAPI.create(data)
            const newItem = res.data?.data || res.data
            items.value.push(newItem)
            return { success: true, data: newItem }
        } catch (err) {
            console.error('[facilitiesStore] Create Error:', err)
            return { success: false, error: err.message }
        }
    }

    async function update(id, data) {
        try {
            const res = await facilitiesAPI.update(id, data)
            const updated = res.data?.data || res.data
            const idx = items.value.findIndex(f => (f.ROWID || f.id) === id)
            if (idx !== -1) {
                items.value[idx] = { ...items.value[idx], ...updated }
            }
            return { success: true }
        } catch (err) {
            console.error('[facilitiesStore] Update Error:', err)
            return { success: false, error: err.message }
        }
    }

    return {
        items, isLoading, error,
        fetchAll, create, update
    }
})
