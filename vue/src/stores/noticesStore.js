import { defineStore } from 'pinia'
import { ref, computed , watch } from 'vue'
import { noticesAPI } from '../services/api.js'
import { mockNotices } from '../data/mockData.js'
import { socket } from '../services/socket'

export const useNoticesStore = defineStore('notices', () => {
    const items = ref([])


    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem(`ch_mock_notices`, JSON.stringify(newVal));
    }, { deep: true });
    const isLoading = ref(false)
    const error = ref(null)
    const isUsingMock = ref(false)

    // ── Computed ──────────────────────────────────────────
    const pinnedNotices = computed(() => items.value.filter(n => n.pinned))

    // ── Actions ──────────────────────────────────────────
    async function fetchAll(params = {}) {
        isLoading.value = true
        error.value = null
        try {
            const result = await noticesAPI.list(params)
            const responseData = result.data;
            const rawData = responseData.data || responseData;
            const serverItems = Array.isArray(rawData) ? rawData.map(n => n.Notices || n) : []
            items.value = serverItems.length > 0 ? serverItems : (JSON.parse(localStorage.getItem(`ch_mock_notices`)) || mockNotices)
            isUsingMock.value = serverItems.length === 0
        } catch (err) {
            console.error('[noticesStore] API Error:', err.message || err)
            error.value = err.message || 'Failed to fetch notices'
            isUsingMock.value = false
        
            items.value = JSON.parse(localStorage.getItem(`ch_mock_notices`)) || mockNotices;
        } finally {
            isLoading.value = false
        }
    }

    async function create(data) {
        try {
            const result = await noticesAPI.create(data)
            let responseData = result.data;
            let notice = responseData.Notices || responseData.notice || responseData;
            items.value.unshift(notice)

            socket.send('notification:broadcast', {
                title: 'New Community Notice',
                message: notice.title
            })

            return { success: true }
        } catch (err) {
            console.error('[noticesStore] Create Error:', err)
            error.value = err.message || 'Failed to create notice'
            return { success: false, error: error.value }
        }
    }

    async function remove(id) {
        try {
            await noticesAPI.remove(id)
            items.value = items.value.filter(n => n.ROWID !== id && n.id !== id)
            return { success: true }
        } catch (err) {
            console.error('[noticesStore] Remove Error:', err)
            error.value = err.message || 'Failed to remove notice'
            return { success: false, error: error.value }
        }
    }

    // Initialize without mock data
    items.value = []
    isUsingMock.value = false

    return {
        items, isLoading, error, isUsingMock,
        pinnedNotices,
        fetchAll, create, remove,
    }
})
