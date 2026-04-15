/**
 * Maintenance Notifications Store — API-backed.
 * Manages maintenance notifications and rent reminder records.
 */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { maintenanceNotifAPI } from '../services/api.js'

export const useMaintenanceNotifStore = defineStore('maintenanceNotif', () => {
    const items = ref([])
    const isLoading = ref(false)
    const error = ref(null)

    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem('ch_mock_maint_notif', JSON.stringify(newVal));
    }, { deep: true });

    async function fetchAll(params = {}) {
        isLoading.value = true
        error.value = null
        try {
            const result = await maintenanceNotifAPI.list(params)
            const raw = result.data?.data || result.data || []
            const serverItems = Array.isArray(raw) ? raw.map(r => r.MaintenanceNotifications || r) : []
            items.value = serverItems.length > 0 ? serverItems : (JSON.parse(localStorage.getItem('ch_mock_maint_notif')) || [])
        } catch (err) {
            console.error('[maintenanceNotifStore] Fetch error:', err.message)
            error.value = err.message || 'Failed to fetch notifications'
            items.value = JSON.parse(localStorage.getItem('ch_mock_maint_notif')) || []
        } finally {
            isLoading.value = false
        }
    }

    async function sendNotification(payload) {
        error.value = null
        try {
            const result = await maintenanceNotifAPI.send(payload)
            let row = result.data?.data || result.data
            row = row?.MaintenanceNotifications || row
            items.value.unshift({ ...row, status: 'sent' })
            return { success: true, data: row }
        } catch (err) {
            error.value = err.message || 'Failed to send notification'
            return { success: false, error: error.value }
        }
    }

    async function sendRentReminder(payload) {
        error.value = null
        try {
            const result = await maintenanceNotifAPI.sendRentReminder(payload)
            return { success: true, data: result.data?.data || result.data }
        } catch (err) {
            error.value = err.message || 'Failed to send rent reminder'
            return { success: false, error: error.value }
        }
    }

    return {
        items, isLoading, error,
        fetchAll, sendNotification, sendRentReminder,
    }
})
