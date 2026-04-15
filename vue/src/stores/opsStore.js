import { defineStore } from 'pinia'
import { tasksAPI, inventoryAPI } from '../services/api'
import { mockMaintenanceTasks, mockInventory } from '../data/mockData'

export const useOpsStore = defineStore('ops', {
  state: () => ({
    tasks: [],
    inventory: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const [t, i] = await Promise.all([
          tasksAPI.list(),
          inventoryAPI.list()
        ])
        const taskData = t.data?.data || t.data || []
        const invData = i.data?.data || i.data || []

        this.tasks = taskData.length > 0 ? taskData : (JSON.parse(localStorage.getItem('ch_mock_tasks')) || mockMaintenanceTasks)
        this.inventory = invData.length > 0 ? invData : (JSON.parse(localStorage.getItem('ch_mock_inventory')) || mockInventory)
      } catch (err) {
        this.error = err.message
        this.tasks = JSON.parse(localStorage.getItem('ch_mock_tasks')) || mockMaintenanceTasks
        this.inventory = JSON.parse(localStorage.getItem('ch_mock_inventory')) || mockInventory
      } finally {
        this.loading = false
      }
    },

    _persist() {
      localStorage.setItem('ch_mock_tasks', JSON.stringify(this.tasks))
      localStorage.setItem('ch_mock_inventory', JSON.stringify(this.inventory))
    },

    async createTask(data) {
      const res = await tasksAPI.create(data)
      const newItem = res.data?.data || res.data
      this.tasks.unshift(newItem)
      this._persist()
      return newItem
    },

    async updateTask(id, data) {
      const res = await tasksAPI.update(id, data)
      const updated = res.data?.data || res.data
      const idx = this.tasks.findIndex(i => (i.ROWID || i.id) === id)
      if (idx !== -1) {
        this.tasks[idx] = { ...this.tasks[idx], ...updated }
        this._persist()
      }
    },

    async addInventory(data) {
      const res = await inventoryAPI.create(data)
      const newItem = res.data?.data || res.data
      this.inventory.push(newItem)
      this._persist()
      return newItem
    },

    async updateInventory(id, data) {
      const res = await inventoryAPI.update(id, data)
      const updated = res.data?.data || res.data
      const idx = this.inventory.findIndex(i => (i.ROWID || i.id) === id)
      if (idx !== -1) {
        this.inventory[idx] = { ...this.inventory[idx], ...updated }
        this._persist()
      }
    }
  }
})
