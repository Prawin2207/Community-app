import { defineStore } from 'pinia'
import { ref , watch } from 'vue'
import { domesticHelpAPI } from '../services/api.js'
import { mockDomesticHelp } from '../data/mockData.js'

export const useDomesticHelpStore = defineStore('domesticHelp', () => {
    const items = ref([])


    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem(`ch_mock_domesticHelp`, JSON.stringify(newVal));
    }, { deep: true });
    const isLoading = ref(false)
    const error = ref(null)

    async function fetchAll(params = {}) {
        isLoading.value = true
        error.value = null
        try {
            const result = await domesticHelpAPI.list(params)
            const responseData = result.data.data || result.data
            const serverItems = Array.isArray(responseData) ? responseData.map(i => i.DomesticHelp || i) : []
            items.value = serverItems.length > 0 ? serverItems : (JSON.parse(localStorage.getItem(`ch_mock_domesticHelp`)) || mockDomesticHelp)
        } catch (err) {
            console.error('API Error:', err)
            error.value = err.message
        
            items.value = JSON.parse(localStorage.getItem(`ch_mock_domesticHelp`)) || mockDomesticHelp;
        } finally {
            isLoading.value = false
        }
    }

    async function create(data) {
        try {
            const result = await domesticHelpAPI.create(data)
            const newItem = result.data.data || result.data
            items.value.push(newItem)
            return { success: true, data: newItem }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    async function update(id, updates) {
        try {
            await domesticHelpAPI.update(id, updates)
            const idx = items.value.findIndex(i => i.ROWID === id || i.id === id)
            if (idx !== -1) {
                items.value[idx] = { ...items.value[idx], ...updates }
            }
            return { success: true }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    async function remove(id) {
        try {
            await domesticHelpAPI.remove(id)
            items.value = items.value.filter(i => i.ROWID !== id && i.id !== id)
            return { success: true }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    return {
        items, isLoading, error,
        fetchAll, create, update, remove
    }
})
