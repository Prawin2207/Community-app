/**
 * syncService.js — Manages the offline outbox and background synchronization.
 */
import baseApi from './baseApi'

const OUTBOX_KEY = 'ch_outbox'

export const SyncService = {
  /**
   * Add a request to the outbox
   */
  queueRequest(method, url, data, entityType) {
    const outbox = this.getOutbox()
    const task = {
      id: Date.now().toString(),
      method: method.toUpperCase(),
      url,
      data,
      entityType,
      timestamp: new Date().toISOString()
    }
    outbox.push(task)
    this.saveOutbox(outbox)
    console.log(`[Sync] Queued ${method} ${url} for ${entityType}`)
    return task
  },

  /**
   * Get all pending items for a specific entity type
   */
  getPendingItems(entityType) {
    return this.getOutbox()
      .filter(task => task.entityType === entityType && task.method === 'POST')
      .map(task => ({
        ...task.data,
        isPending: true,
        tempId: task.id,
        ROWID: `temp_${task.id}` // Placeholder ID for UI
      }))
  },

  /**
   * Process the outbox queue
   */
  async processQueue() {
    const outbox = this.getOutbox()
    if (outbox.length === 0) return

    console.log(`[Sync] Processing ${outbox.length} pending tasks...`)
    
    // Process one by one to avoid race conditions
    const remaining = []
    for (const task of outbox) {
      try {
        await this.executeTask(task)
        console.log(`[Sync] Completed task ${task.id}`)
      } catch (err) {
        console.error(`[Sync] Task ${task.id} failed again:`, err.message)
        remaining.push(task) // Keep in queue if it fails again (not 4xx errors usually)
        // If it was a 4xx error, we might want to discard it or notify user, 
        // but for now we'll keep retrying if it's a network issue.
      }
    }

    this.saveOutbox(remaining)
  },

  /**
   * Execute a single background task
   */
  async executeTask(task) {
    const { method, url, data } = task
    switch (method) {
      case 'POST':   return baseApi.post(url, data)
      case 'PATCH':  return baseApi.patch(url, data)
      case 'PUT':    return baseApi.put(url, data)
      case 'DELETE': return baseApi.delete(url)
      default: throw new Error(`Unsupported method: ${method}`)
    }
  },

  // ── Internal Helpers ────────────────────────────────────────────────────────
  getOutbox() {
    try {
      return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]')
    } catch {
      return []
    }
  },

  saveOutbox(outbox) {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox))
  }
}

// Automatically start processing if online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Sync] Back online, triggering sync...')
    SyncService.processQueue()
  })

  // Periodic check every 2 minutes
  setInterval(() => SyncService.processQueue(), 120000)
}

export default SyncService
