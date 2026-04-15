<template>
  <div class="p-6 space-y-6">
    <h1 class="page-title">Community Feed</h1>

    <!-- Post Input -->
    <div class="card">
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {{ auth.currentUser?.name?.split(' ').map(n=>n[0]).join('') || 'A' }}
        </div>
        <div class="flex-1">
          <textarea v-model="postContent" class="input resize-none h-20" placeholder="Share something with the community..." />
          <div class="flex items-center justify-between mt-3">
            <select v-model="postCategory" class="input w-36 text-xs">
              <option>Announcement</option>
              <option>Lost & Found</option>
              <option>Recommendation</option>
              <option>Event</option>
              <option>For Sale</option>
            </select>
            <button @click="handlePost" :disabled="!postContent.trim() || isPosting" class="btn-primary text-xs py-1.5">
              {{ isPosting ? 'Posting...' : 'Post' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Feed -->
    <div class="space-y-4">
      <div v-if="feedStore.loading" class="text-center py-10">
        <p class="text-slate-400 animate-pulse">Establishing uplink...</p>
      </div>
      <div v-else-if="feedStore.items.length === 0" class="card text-center py-10">
        <p class="text-sm text-slate-400">The community is quiet... post something!</p>
      </div>
      <div
        v-for="item in feedStore.items"
        :key="item.ROWID || item.id"
        class="card hover:shadow-card-hover transition-shadow"
      >
        <div class="flex items-start gap-3 mb-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 text-sm font-bold flex-shrink-0">
            {{ item.author?.split(' ').map(n=>n[0]).join('') || '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm font-bold text-slate-800">{{ item.author }}</p>
              <span class="text-xs text-slate-400">{{ item.apartment }}</span>
              <span :class="['badge', categoryColor(item.category)]">{{ item.category }}</span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">{{ new Date(item.CREATEDTIME).toLocaleString('en-IN') }}</p>
          </div>
        </div>
        <p class="text-sm text-slate-700 leading-relaxed">{{ item.content }}</p>
        <div class="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
          <button @click="toggleLike(item)" :class="[
              'flex items-center gap-1.5 text-xs transition-colors',
              likedPosts.has(item.ROWID || item.id) ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-rose-500'
            ]">
            <Heart :class="['w-4 h-4', likedPosts.has(item.ROWID || item.id) ? 'fill-current' : '']" />
            {{ item.likes || 0 }}
          </button>
          <button class="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary-500 transition-colors">
            <MessageCircle class="w-4 h-4" />
            {{ item.comments || 0 }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFeedStore } from '../../stores/feedStore'
import { useAuthStore } from '../../stores/authStore'
import { Heart, MessageCircle } from 'lucide-vue-next'

const feedStore = useFeedStore()
const auth = useAuthStore()
const postContent = ref('')
const postCategory = ref('Announcement')
const isPosting = ref(false)
const likedPosts = ref(new Set())

onMounted(() => feedStore.fetchAll())

async function toggleLike(item) {
  const id = item.ROWID || item.id
  const isLiked = likedPosts.value.has(id)
  
  if (isLiked) {
    likedPosts.value.delete(id)
    item.likes = Math.max(0, (item.likes || 1) - 1)
  } else {
    likedPosts.value.add(id)
    item.likes = (item.likes || 0) + 1
  }
  
  try {
    await feedStore.likePost(id, item.likes)
  } catch (err) {
    // Rollback
    if (isLiked) {
      likedPosts.value.add(id)
      item.likes = (item.likes || 0) + 1
    } else {
      likedPosts.value.delete(id)
      item.likes = Math.max(0, (item.likes || 1) - 1)
    }
  }
}

function categoryColor(cat) {
  const map = {
    'Lost & Found': 'bg-amber-50 text-amber-700',
    Recommendation: 'bg-emerald-50 text-emerald-700',
    Event: 'bg-violet-50 text-violet-700',
    'For Sale': 'bg-blue-50 text-blue-700',
    Announcement: 'bg-primary-50 text-primary-700',
  }
  return map[cat] || 'bg-slate-100 text-slate-500'
}

async function handlePost() {
  if (!postContent.value.trim()) return
  isPosting.value = true
  try {
    await new Promise(r => setTimeout(r, 600)) // Artificial processing delay
    await feedStore.post({
      author: auth.currentUser?.name || 'Resident',
      apartment: auth.currentUser?.apartment || 'N/A',
      content: postContent.value,
      category: postCategory.value,
      residentId: auth.currentUser?.ROWID
    })
    postContent.value = ''
  } catch (err) {
    alert('Failed to post: ' + err.message)
  } finally {
    isPosting.value = false
  }
}
</script>
