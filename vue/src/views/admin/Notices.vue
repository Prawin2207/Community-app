<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="page-title">Community Notices</h1>
      <button @click="showModal = true" class="btn-primary">
        <Megaphone class="w-4 h-4" />
        New Notice
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div v-for="notice in data.items" :key="notice.ROWID || notice.id" class="card hover:shadow-card-hover transition-shadow relative">
        <div class="absolute top-4 right-4 flex items-center gap-2">
          <button v-if="notice.pinned" class="text-amber-500" title="Pinned">
            <Pin class="w-4 h-4" />
          </button>
          <button
            @click="deleteNotice(notice.ROWID || notice.id)"
            class="text-slate-300 hover:text-rose-500 transition-colors p-1"
            title="Delete Notice"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
            {{ categoryEmoji(notice.category) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="badge bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider">{{ notice.category }}</span>
              <span v-if="notice.priority === 'high'" class="badge bg-rose-50 text-rose-600 uppercase text-[10px] tracking-wider font-bold">High Priority</span>
            </div>
            <h3 class="font-bold text-slate-800 text-lg">{{ notice.title }}</h3>
            <p class="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{{ notice.content }}</p>
            <div class="flex items-center gap-4 mt-4 text-xs text-slate-400">
              <span class="flex items-center gap-1"><User class="w-3 h-3" /> {{ notice.author }}</span>
              <span class="flex items-center gap-1"><Calendar class="w-3 h-3" /> {{ notice.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Notice Modal -->
    <ModalComponent v-model="showModal" title="Publish New Notice" size="lg">
      <div class="space-y-4">
        <div>
          <label class="label">Title *</label>
          <input v-model="form.title" class="input" placeholder="Notice heading" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Category</label>
            <select v-model="form.category" class="input">
              <option>Announcement</option>
              <option>Meeting</option>
              <option>Maintenance</option>
              <option>Event</option>
              <option>Rules</option>
            </select>
          </div>
          <div>
            <label class="label">Priority</label>
            <select v-model="form.priority" class="input">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div>
          <label class="label">Content *</label>
          <textarea v-model="form.content" class="input h-32 resize-none" placeholder="Details of the notice..." />
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="form.pinned" id="pin" />
          <label for="pin" class="text-sm text-slate-600">Pin to top</label>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button @click="showModal = false" class="btn-secondary">Cancel</button>
          <button @click="publish" class="btn-primary">Publish</button>
        </div>
      </template>
    </ModalComponent>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNoticesStore } from '../../stores/noticesStore'
import { Megaphone, Pin, User, Calendar, Trash2 } from 'lucide-vue-next'
import ModalComponent from '../../components/ModalComponent.vue'

const data = useNoticesStore()
const showModal = ref(false)
const form = ref({ title: '', category: 'Announcement', priority: 'medium', content: '', pinned: false })

onMounted(() => {
  data.fetchAll()
})

async function publish() {
  if (!form.value.title || !form.value.content) return
  
  const payload = {
    ...form.value,
    date: new Date().toISOString().split('T')[0],
    author: 'Admin'
  }
  
  const res = await data.create(payload)
  if (res.success) {
    showModal.value = false
    form.value = { title: '', category: 'Announcement', priority: 'medium', content: '', pinned: false }
  }
}

function deleteNotice(id) {
  if (confirm('Are you sure you want to delete this notice?')) {
    data.remove(id)
  }
}

function categoryEmoji(cat) {
  const m = { Meeting: '📋', Maintenance: '🔧', Announcement: '📢', Rules: '📜', Event: '🎉' }
  return m[cat] || '📌'
}
</script>
