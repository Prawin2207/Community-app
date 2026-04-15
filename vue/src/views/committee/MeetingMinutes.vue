<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Meeting Minutes</h1>
        <p class="text-sm text-slate-500 mt-1">Archive of RWA society meetings</p>
      </div>
      <button @click="showAddModal = true" class="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
        <Plus class="w-4 h-4" /> Add Minute
      </button>
    </div>

    <!-- Timeline -->
    <div class="relative space-y-8 before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-slate-100 pb-10">
      <div v-if="governanceStore.loading" class="pl-12 py-10 animate-pulse text-slate-400">
        Syncing archives...
      </div>
      <div v-else-if="governanceStore.minutes.length === 0" class="pl-12 py-10 text-slate-400 text-sm">
        No records found
      </div>
      <div v-for="minute in governanceStore.minutes" :key="minute.ROWID" class="relative pl-12 group">
        <div class="absolute left-3 w-2.5 h-2.5 rounded-full bg-violet-500 ring-4 ring-white shadow-sm z-10 transition-transform group-hover:scale-125"></div>
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:border-violet-100 hover:shadow-md">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-slate-800">{{ minute.title }}</h3>
            <span class="text-xs font-bold text-violet-600 px-2.5 py-1 bg-violet-50 rounded-lg">{{ minute.meetingdate }}</span>
          </div>
          <p class="text-sm text-slate-600 leading-relaxed mb-4">{{ minute.summary }}</p>
          <div class="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span class="flex items-center gap-1"><Users class="w-3.5 h-3.5" /> {{ minute.attendees }} Attendees</span>
            <span class="flex items-center gap-1"><Tag class="w-3.5 h-3.5" /> {{ minute.tags }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Minute Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="showAddModal = false"></div>
      <div class="relative bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <h2 class="text-xl font-bold text-slate-800 mb-6">Add Meeting Minute</h2>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="col-span-2">
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Title</label>
            <input v-model="newMinute.title" type="text" class="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-violet-500 transition-all" placeholder="Annual General Meeting" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Date</label>
            <input v-model="newMinute.meetingdate" type="date" class="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-violet-500 transition-all" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Attendees</label>
            <input v-model="newMinute.attendees" type="number" class="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-violet-500 transition-all" />
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Summary</label>
          <textarea v-model="newMinute.summary" class="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-violet-500 h-24 resize-none transition-all" placeholder="Main points discussed..."></textarea>
        </div>
        <div class="mb-6">
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tags</label>
          <input v-model="newMinute.tags" type="text" class="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-violet-500 transition-all" placeholder="Governance, Finance" />
        </div>
        <div class="flex gap-3">
          <button @click="showAddModal = false" class="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">
            Cancel
          </button>
          <button @click="createMinute" :disabled="isSubmitting" class="flex-[2] py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all">
            {{ isSubmitting ? 'Saving record...' : 'Save Minute' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Users, Tag } from 'lucide-vue-next'
import { useGovernanceStore } from '../../stores/governanceStore'

const governanceStore = useGovernanceStore()
const showAddModal = ref(false)
const isSubmitting = ref(false)
const newMinute = ref({ title: '', meetingdate: '', attendees: 0, summary: '', tags: '' })

onMounted(() => governanceStore.fetchAll())

async function createMinute() {
  if (!newMinute.value.title || !newMinute.value.meetingdate || !newMinute.value.summary) {
    alert('Please fill in title, date, and summary.')
    return
  }
  isSubmitting.value = true
  try {
    await governanceStore.createMinute(newMinute.value)
    showAddModal.value = false
    newMinute.value = { title: '', meetingdate: '', attendees: 0, summary: '', tags: '' }
  } catch (err) {
    alert('Failed to save minute: ' + (err.response?.data?.error || err.message))
  } finally {
    isSubmitting.value = false
  }
}
</script>
