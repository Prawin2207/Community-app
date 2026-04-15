import { defineStore } from 'pinia'
import { ref , watch } from 'vue'
import { gatePassesAPI } from '../services/api.js'
import { mockGatePasses } from '../data/mockData.js'

export const useGatePassesStore = defineStore('gatePasses', () => {
    const items = ref([])


    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem(`ch_mock_gatePasses`, JSON.stringify(newVal));
    }, { deep: true });
    const isLoading = ref(false)
    const error = ref(null)

    async function fetchAll(params = {}) {
        isLoading.value = true
        error.value = null
        try {
            const result = await gatePassesAPI.list(params)
            const responseData = result.data.data || result.data
            const serverItems = Array.isArray(responseData) ? responseData.map(i => i.GatePasses || i) : []
            items.value = serverItems.length > 0 ? serverItems : (JSON.parse(localStorage.getItem(`ch_mock_gatePasses`)) || mockGatePasses)
        } catch (err) {
            console.error('API Error:', err)
            error.value = err.message
        
            items.value = JSON.parse(localStorage.getItem(`ch_mock_gatePasses`)) || mockGatePasses;
        } finally {
            isLoading.value = false
        }
    }

    async function create(data) {
        try {
            // Generate a random 6-digit code for the pass if not provided
            if (!data.passCode) {
                data.passCode = Math.floor(100000 + Math.random() * 900000).toString()
            }
            if (!data.status) data.status = 'Active'

            const result = await gatePassesAPI.create(data)
            const newItem = result.data.data || result.data
            items.value.push(newItem)
            return { success: true, data: newItem }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    async function update(id, updates) {
        try {
            await gatePassesAPI.update(id, updates)
            const idx = items.value.findIndex(i => i.ROWID === id || i.id === id)
            if (idx !== -1) {
                items.value[idx] = { ...items.value[idx], ...updates }
            }
            return { success: true }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    return {
        items, isLoading, error,
        fetchAll, create, update
    }
})
