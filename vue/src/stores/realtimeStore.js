import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * realtimeStore — Stub for demo mode.
 *
 * All methods are no-ops. Realtime features are disabled
 * since the app runs in demo mode without a live backend.
 */

export const EVENT_TYPES = {
    EMERGENCY_ALERT:   'emergency:alert',
    VISITOR_ARRIVED:   'visitor:arrived',
    VISITOR_APPROVED:  'visitor:approved',
    DELIVERY_ARRIVED:  'delivery:arrived',
    DELIVERY_UPDATED:  'delivery:updated',
    NOTICE_PUBLISHED:  'notice:published',
    COMPLAINT_UPDATED: 'complaint:updated',
    MAINTENANCE_DUE:   'maintenance:reminder',
    BOOKING_UPDATED:   'booking:updated',
    POLL_CREATED:      'poll:created',
    ANNOUNCEMENT:      'community:announcement',
    NOTIFICATION_NEW:  'notification:new',
}

export const useRealtimeStore = defineStore('realtime', () => {
    const connected = ref(false)
    const error     = ref(null)
    const isConnected = computed(() => connected.value)

    // All methods are no-ops in demo mode
    const connect    = () => {}
    const disconnect = () => {}
    const on         = () => () => {}
    const once       = () => {}
    const emit       = () => {}

    return { connected, error, isConnected, connect, disconnect, on, once, emit }
})
