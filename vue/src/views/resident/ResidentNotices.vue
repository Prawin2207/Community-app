<template>
  <div class="p-6 space-y-4">
    <h1 class="page-title">Notices</h1>
    <div class="space-y-4">
      <div v-for="notice in data.items" :key="notice.ROWID || notice.id" class="card hover:shadow-card-hover transition-shadow cursor-pointer">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl flex-shrink-0">
            {{ categoryEmoji(notice.category) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span v-if="notice.pinned" class="badge bg-amber-50 text-amber-700">📌 Pinned</span>
              <span class="badge bg-slate-100 text-slate-600">{{ notice.category }}</span>
            </div>
            <h3 class="font-bold text-slate-800">{{ notice.title }}</h3>
            <p class="text-sm text-slate-600 mt-1 line-clamp-3">{{ notice.content }}</p>
            <div class="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span>{{ notice.author }}</span>
              <span>&bull; {{ notice.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useNoticesStore } from '../../stores/noticesStore'

const data = useNoticesStore()

onMounted(() => {
  data.fetchAll()
})

function categoryEmoji(cat) {
  const m = { Meeting: '📋', Maintenance: '🔧', Announcement: '📢', Rules: '📜', Event: '🎉' }
  return m[cat] || '📌'
}
</script>
