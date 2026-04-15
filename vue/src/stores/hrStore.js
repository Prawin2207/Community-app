import { defineStore } from 'pinia'
import { staffAPI, payrollAPI } from '../services/api'
import { mockStaff, mockPayroll } from '../data/mockData'

export const useHrStore = defineStore('hr', {
  state: () => ({
    staff: [],
    payroll: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const [s, p] = await Promise.all([
          staffAPI.list(),
          payrollAPI.list()
        ])
        const sData = s.data?.data || s.data || []
        const pData = p.data?.data || p.data || []

        this.staff = sData.length > 0 ? sData : mockStaff
        this.payroll = pData.length > 0 ? pData : mockPayroll
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async addStaff(data) {
      const res = await staffAPI.create(data)
      const newItem = res.data?.data || res.data
      this.staff.push(newItem)
      return newItem
    },

    async updateStaff(id, data) {
      const res = await staffAPI.update(id, data)
      const updated = res.data?.data || res.data
      const idx = this.staff.findIndex(i => (i.ROWID || i.id) === id)
      if (idx !== -1) this.staff[idx] = { ...this.staff[idx], ...updated }
    },

    async deleteStaff(id) {
        await staffAPI.remove(id)
        this.staff = this.staff.filter(i => (i.ROWID || i.id) !== id)
    },

    async generatePayroll(data) {
      const res = await payrollAPI.create(data)
      const newItem = res.data?.data || res.data
      this.payroll.unshift(newItem)
      return newItem
    },

    async updatePayrollStatus(id, status) {
        const res = await payrollAPI.update(id, { status })
        const updated = res.data?.data || res.data
        const idx = this.payroll.findIndex(i => (i.ROWID || i.id) === id)
        if (idx !== -1) this.payroll[idx] = { ...this.payroll[idx], ...updated }
    }
  }
})
