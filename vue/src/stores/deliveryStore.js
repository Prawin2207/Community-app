import { defineStore } from 'pinia'
import { deliveriesAPI } from '../services/api'
import { mockDeliveries } from '../data/mockData'
import { socket } from '../services/socket'

export const useDeliveryStore = defineStore('delivery', {
  state: () => ({
    items: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const res = await deliveriesAPI.list()
        const raw = res.data?.data || res.data || []
        const serverItems = Array.isArray(raw) ? raw : []
        this.items = serverItems.length > 0 ? serverItems : (JSON.parse(localStorage.getItem('ch_mock_delivery')) || mockDeliveries)
      } catch (err) {
        this.error = err.message
        this.items = JSON.parse(localStorage.getItem('ch_mock_delivery')) || mockDeliveries
      } finally {
        this.loading = false
      }
    },

    _persist() {
      localStorage.setItem('ch_mock_delivery', JSON.stringify(this.items))
    },

    async logDelivery(data) {
      try {
        const res = await deliveriesAPI.create(data)
        const newItem = res.data?.data || res.data
        this.items.unshift(newItem)
        this._persist()

        // Notify resident via socket
        if (newItem.residentId) {
          socket.send('delivery:new', {
            residentId: newItem.residentId,
            courier: newItem.courier || newItem.Deliveriessupplier,
            packageType: newItem.packageType,
            timestamp: newItem.CREATEDTIME || new Date().toISOString()
          })
        }
        return newItem
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    async updateStatus(id, status) {
      try {
        const res = await deliveriesAPI.update(id, { status })
        const updated = res.data?.data || res.data
        const idx = this.items.findIndex(i => (i.ROWID || i.id) === id)
        if (idx !== -1) {
          this.items[idx] = { ...this.items[idx], ...updated }
          this._persist()
        }
      } catch (err) {
        this.error = err.message
        throw err
      }
    }
  }
})
