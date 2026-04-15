import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { bookingsAPI } from '../services/api'
import { mockBookingRequests } from '../data/mockData'

export const useBookingsStore = defineStore('bookings', () => {
    const items = ref([])
    const isLoading = ref(false)
    const error = ref(null)

    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem('ch_mock_bookings', JSON.stringify(newVal));
    }, { deep: true });

    async function fetchAll() {
        isLoading.value = true
        error.value = null
        try {
            const result = await bookingsAPI.list()
            const responseData = result.data;
            const rawData = responseData.data || responseData;
            const serverItems = Array.isArray(rawData) ? rawData.map(b => b.Bookings || b) : []
            items.value = serverItems.length > 0 ? serverItems : (JSON.parse(localStorage.getItem('ch_mock_bookings')) || mockBookingRequests)
        } catch (err) {
            console.error('[bookingsStore] API Error:', err)
            error.value = err.message || 'Failed to fetch bookings'
            items.value = JSON.parse(localStorage.getItem('ch_mock_bookings')) || mockBookingRequests
        } finally {
            isLoading.value = false
        }
    }

    async function create(data) {
        try {
            const res = await bookingsAPI.create(data)
            const newItem = res.data?.data || res.data
            items.value.unshift(newItem)
            return { success: true, data: newItem }
        } catch (err) {
            console.error('[bookingsStore] Create Error:', err)
            return { success: false, error: err.message }
        }
    }

    async function update(id, data) {
        try {
            const res = await bookingsAPI.update(id, data)
            const updated = res.data?.data || res.data
            const idx = items.value.findIndex(b => (b.ROWID || b.id) === id)
            if (idx !== -1) {
                items.value[idx] = { ...items.value[idx], ...updated }
            }
            return { success: true }
        } catch (err) {
            console.error('[bookingsStore] Update Error:', err)
            return { success: false, error: err.message }
        }
    }

    async function approveBooking(id) {
        return update(id, { status: 'confirmed' })
    }

    async function rejectBooking(id) {
        return update(id, { status: 'cancelled' })
    }

    return {
        items, isLoading, error,
        fetchAll, create, update, approveBooking, rejectBooking
    }
})
