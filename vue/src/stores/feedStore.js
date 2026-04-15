import { defineStore } from 'pinia'
import api from '../services/api'
import { mockCommunityFeed } from '../data/mockData'
import { socket } from '../services/socket'

export const useFeedStore = defineStore('feed', {
  state: () => ({
    items: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const res = await api.get('feed')
        const raw = res.data?.data || res.data || []
        this.items = raw.length > 0 ? raw : (JSON.parse(localStorage.getItem('ch_mock_feed')) || mockCommunityFeed)
      } catch (err) {
        this.error = err.message
        this.items = JSON.parse(localStorage.getItem('ch_mock_feed')) || mockCommunityFeed
      } finally {
        this.loading = false
      }
    },

    _persist() {
      localStorage.setItem('ch_mock_feed', JSON.stringify(this.items))
    },

    async post(data) {
      try {
        const res = await api.post('feed', data)
        const newItem = res.data?.data || res.data
        this.items.unshift(newItem)
        this._persist()

        socket.send('notification:broadcast', {
          title: 'New Feed Post',
          message: `${newItem.author || 'Someone'} shared a post: ${newItem.content?.slice(0, 30)}...`
        })

        return newItem
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    async likePost(id, newLikes) {
      try {
        const res = await api.patch(`feed/${id}`, { likes: newLikes })
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
