import { defineStore } from 'pinia'
import { ref , watch } from 'vue'
import { maintenanceAPI } from '../services/api'
import { mockMaintenanceTasks } from '../data/mockData'

export const useMaintenanceStore = defineStore('maintenance', () => {
    const items = ref([])

    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem('ch_mock_maintenance', JSON.stringify(newVal));
    }, { deep: true });
    const isLoading = ref(false)
    const error = ref(null)

    async function fetchAll() {
        isLoading.value = true
        error.value = null
        try {
            const result = await maintenanceAPI.list()
            const responseData = result.data;
            const rawData = responseData.data || responseData;
            const serverItems = Array.isArray(rawData) ? rawData.map(t => t.MaintenanceTasks || t) : []
            items.value = serverItems.length > 0 ? serverItems : (JSON.parse(localStorage.getItem('ch_mock_maintenance')) || mockMaintenanceTasks)
        } catch (err) {
            console.error('[maintenanceStore] API Error:', err)
            error.value = err.message || 'Failed to fetch tasks'
        
            items.value = JSON.parse(localStorage.getItem('ch_mock_maintenance')) || mockMaintenanceTasks;
        } finally {
            isLoading.value = false
        }
    }

    async function create(data) {
        try {
            const res = await maintenanceAPI.create(data)
            const newItem = res.data?.data || res.data
            items.value.unshift(newItem)
            return { success: true, data: newItem }
        } catch (err) {
            console.error('[maintenanceStore] Create Error:', err)
            return { success: false, error: err.message }
        }
    }

    async function update(id, data) {
        try {
            const res = await maintenanceAPI.update(id, data)
            const updated = res.data?.data || res.data
            const idx = items.value.findIndex(t => (t.ROWID || t.id) === id)
            if (idx !== -1) {
                items.value[idx] = { ...items.value[idx], ...updated }
            }
            return { success: true }
        } catch (err) {
            console.error('[maintenanceStore] Update Error:', err)
            return { success: false, error: err.message }
        }
    }

    return {
        items, isLoading, error,
        fetchAll, create, update
    }
})
