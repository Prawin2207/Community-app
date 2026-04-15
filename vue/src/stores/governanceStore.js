import { defineStore } from 'pinia'
import { proposalsAPI, minutesAPI, rulesAPI } from '../services/api'
import { mockProposals, mockMinutes, mockRules } from '../data/mockData'
import { socket } from '../services/socket'

export const useGovernanceStore = defineStore('governance', {
  state: () => ({
    proposals: [],
    minutes: [],
    rules: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const [p, m, r] = await Promise.all([
          proposalsAPI.list(),
          minutesAPI.list(),
          rulesAPI.list()
        ])
        const pData = p.data?.data || p.data || []
        const mData = m.data?.data || m.data || []
        const rData = r.data?.data || r.data || []

        this.proposals = pData.length > 0 ? pData : (JSON.parse(localStorage.getItem('ch_mock_proposals')) || mockProposals)
        this.minutes = mData.length > 0 ? mData : (JSON.parse(localStorage.getItem('ch_mock_minutes')) || mockMinutes)
        this.rules = rData.length > 0 ? rData : (JSON.parse(localStorage.getItem('ch_mock_rules')) || mockRules)
      } catch (err) {
        this.error = err.message
        this.proposals = JSON.parse(localStorage.getItem('ch_mock_proposals')) || mockProposals
        this.minutes = JSON.parse(localStorage.getItem('ch_mock_minutes')) || mockMinutes
        this.rules = JSON.parse(localStorage.getItem('ch_mock_rules')) || mockRules
      } finally {
        this.loading = false
      }
    },

    _persist() {
      localStorage.setItem('ch_mock_proposals', JSON.stringify(this.proposals))
      localStorage.setItem('ch_mock_minutes', JSON.stringify(this.minutes))
      localStorage.setItem('ch_mock_rules', JSON.stringify(this.rules))
    },

    async createProposal(data) {
      const res = await proposalsAPI.create(data)
      const newItem = res.data?.data || res.data
      this.proposals.unshift(newItem)
      this._persist()
      
      socket.send('notification:broadcast', {
        title: 'New Proposal',
        message: `A new community proposal has been raised: ${newItem.title}`
      })
      
      return newItem
    },

    async voteProposal(id, payload) {
      const res = await proposalsAPI.update(id, payload)
      const updated = res.data?.data || res.data
      const idx = this.proposals.findIndex(i => (i.ROWID || i.id) === id)
      if (idx !== -1) {
        this.proposals[idx] = { ...this.proposals[idx], ...updated }
        this._persist()
      }
    },

    async createMinute(data) {
      const res = await minutesAPI.create(data)
      const newItem = res.data?.data || res.data
      this.minutes.unshift(newItem)
      this._persist()
      
      socket.send('notification:broadcast', {
        title: 'Meeting Minutes Uploaded',
        message: `New meeting minutes for "${newItem.title}" are now available.`
      })
      
      return newItem
    },

    async addRule(data) {
      const res = await rulesAPI.create(data)
      const newItem = res.data?.data || res.data
      this.rules.push(newItem)
      this._persist()
      
      socket.send('notification:broadcast', {
        title: 'New Rule Published',
        message: `A new community regulation has been added: ${newItem.title}`
      })
      
      return newItem
    },

    async removeRule(id) {
      await rulesAPI.remove(id)
      this.rules = this.rules.filter(i => (i.ROWID || i.id) !== id)
      this._persist()
    },

    async deleteMinute(id) {
      await minutesAPI.remove(id)
      this.minutes = this.minutes.filter(i => (i.ROWID || i.id) !== id)
      this._persist()
    }
  }
})
