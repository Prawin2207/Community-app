import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * settingsStore — Demo mode settings.
 *
 * Feature flags are stored in localStorage only.
 * No backend API calls are made.
 */
export const useSettingsStore = defineStore('settings', () => {
    const stored = JSON.parse(localStorage.getItem('ch_settings') || '{}')

    const parkingEnabled = ref(stored.parkingEnabled !== false)
    const rulesEnabled = ref(stored.rulesEnabled !== false)
    const complaintsEnabled = ref(stored.complaintsEnabled !== false)
    const documentsEnabled = ref(stored.documentsEnabled !== false)
    const invoicingEnabled = ref(stored.invoicingEnabled !== false)
    
    const isLoading = ref(false)

    function fetchSettings() {
        // No-op in demo mode — settings come from localStorage
    }

    function updateSetting(key, value) {
        if (key === 'parkingEnabled') parkingEnabled.value = value
        if (key === 'rulesEnabled') rulesEnabled.value = value
        if (key === 'complaintsEnabled') complaintsEnabled.value = value
        if (key === 'documentsEnabled') documentsEnabled.value = value
        if (key === 'invoicingEnabled') invoicingEnabled.value = value
        
        const stored = JSON.parse(localStorage.getItem('ch_settings') || '{}')
        localStorage.setItem('ch_settings', JSON.stringify({ ...stored, [key]: value }))
    }


    return {
        parkingEnabled,
        rulesEnabled,
        complaintsEnabled,
        documentsEnabled,
        invoicingEnabled,
        isLoading,
        fetchSettings,
        updateSetting,
    }
})
