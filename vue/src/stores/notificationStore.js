import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { notificationsAPI } from '../services/api.js'

/**
 * notificationStore — manages in-app notification state.
 *
 * Backed by the persistent /notifications endpoint.
 * Also receives real-time pushes via realtimeStore EVENT_TYPES.NOTIFICATION_NEW.
 *
 * Usage:
 *   const notifications = useNotificationStore()
 *   await notifications.fetchUnreadCount()
 *   notifications.addToast({ title, body, type })
 */
export const useNotificationStore = defineStore('notification', () => {
    // ── Persistent notifications (from DB) ────────────────────────────────
    const notifications = ref([])
    const unreadCount   = ref(0)
    const isLoading     = ref(false)

    // ── Toast queue (ephemeral, in-memory only) ───────────────────────────
    const toasts = ref([])

    // LocalStorage Fallback Sync
    watch([notifications, unreadCount], ([newNotifs, newCount]) => {
        localStorage.setItem('ch_mock_notifications', JSON.stringify({ notifications: newNotifs, unreadCount: newCount }));
    }, { deep: true });

    const hasUnread  = computed(() => unreadCount.value > 0)
    const sortedList = computed(() =>
        [...notifications.value].sort((a, b) => {
            if (a.isRead === b.isRead) return new Date(b.createdAt) - new Date(a.createdAt)
            return a.isRead === 'false' ? -1 : 1
        })
    )

    // ── Actions ──────────────────────────────────────────────────────────

    async function fetchNotifications(params = {}) {
        isLoading.value = true
        try {
            const res          = await notificationsAPI.list(params)
            const raw = res.data.data || []
            notifications.value = raw.length > 0 ? raw : (JSON.parse(localStorage.getItem('ch_mock_notifications'))?.notifications || [])
        } catch (err) {
            console.error('[notificationStore] fetchNotifications:', err.message)
            notifications.value = JSON.parse(localStorage.getItem('ch_mock_notifications'))?.notifications || []
        } finally {
            isLoading.value = false
        }
    }

    async function fetchUnreadCount() {
        try {
            const res       = await notificationsAPI.unreadCount()
            unreadCount.value = res.data.count || JSON.parse(localStorage.getItem('ch_mock_notifications'))?.unreadCount || 0
        } catch (err) {
            console.error('[notificationStore] fetchUnreadCount:', err.message)
            unreadCount.value = JSON.parse(localStorage.getItem('ch_mock_notifications'))?.unreadCount || 0
        }
    }

    async function markRead(id) {
        try {
            await notificationsAPI.markRead(id)
            const notif = notifications.value.find(n => String(n.ROWID) === String(id))
            if (notif) {
                notif.isRead = 'true'
                if (unreadCount.value > 0) unreadCount.value--
            }
        } catch (err) {
            console.error('[notificationStore] markRead:', err.message)
        }
    }

    async function markAllRead() {
        try {
            await notificationsAPI.markAllRead()
            notifications.value.forEach(n => { n.isRead = 'true' })
            unreadCount.value = 0
        } catch (err) {
            console.error('[notificationStore] markAllRead:', err.message)
        }
    }

    /**
     * Called by realtimeStore listener when NOTIFICATION_NEW is received.
     * Adds the notification to the top of the list and increments unread count.
     */
    function onRealtimeNotification(data) {
        notifications.value.unshift({ ...data, isRead: 'false' })
        unreadCount.value++
        // Also show as a toast
        addToast({ title: data.title, body: data.body, type: data.type || 'info' })
    }

    // ── Toast System ──────────────────────────────────────────────────────

    let _toastId = 0
    /**
     * Show a toast notification (ephemeral).
     * @param {{ title, body, type, duration }} options
     *   type: 'success' | 'error' | 'warning' | 'info'
     *   duration: ms (default 4000)
     */
    function addToast({ title, body = '', type = 'info', duration = 4000 }) {
        const id = ++_toastId
        toasts.value.push({ id, title, body, type, duration })
        setTimeout(() => removeToast(id), duration)
        return id
    }

    function removeToast(id) {
        const idx = toasts.value.findIndex(t => t.id === id)
        if (idx !== -1) toasts.value.splice(idx, 1)
    }

    return {
        notifications, unreadCount, isLoading, toasts,
        hasUnread, sortedList,
        fetchNotifications, fetchUnreadCount,
        markRead, markAllRead,
        onRealtimeNotification,
        addToast, removeToast,
    }
})
