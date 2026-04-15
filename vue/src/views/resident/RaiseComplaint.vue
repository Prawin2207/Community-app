<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="page-title">Raise Complaint</h1>
      <p class="text-sm text-slate-500 mt-1">Report issues and track resolutions</p>
    </div>

    <!-- New Complaint Form -->
    <div class="card">
      <h3 class="section-title">New Complaint</h3>
      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="label">Complaint Title *</label>
          <input v-model="form.title" class="input" placeholder="Brief description of the issue" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Category</label>
            <select v-model="form.category" class="input">
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Noise</option>
              <option>Parking</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label class="label">Priority</label>
            <select v-model="form.priority" class="input">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <div>
          <label class="label">Description *</label>
          <textarea v-model="form.description" class="input h-28 resize-none" placeholder="Describe the issue in detail..." required />
        </div>
        <button type="submit" class="btn-primary">Submit Complaint</button>
        <p v-if="submitted" class="text-sm text-emerald-600 font-medium mt-2">✓ Complaint submitted successfully!</p>
      </form>
    </div>

    <!-- My Complaints -->
    <div>
      <h3 class="section-title">My Complaints</h3>
      <div v-if="myComplaints.length > 0" class="space-y-3">
        <div
          v-for="c in myComplaints"
          :key="c.ROWID || c.id"
          class="card"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <StatusBadge :status="c['priority-value'] || c.priority" />
                <span class="text-xs text-slate-400">ID: {{ c.ROWID || c.id }}</span>
              </div>
              <p class="text-sm font-bold text-slate-800">{{ c.title }}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ c.description }}</p>
              <p class="text-xs text-slate-400 mt-1">{{ c.CREATEDTIME ? c.CREATEDTIME.split(' ')[0] : '' }}</p>
            </div>
            <StatusBadge :status="c.status" class="flex-shrink-0" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="card flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h4 class="text-slate-800 font-medium">No complaints available</h4>
        <p class="text-slate-500 text-sm mt-1">If you have any issues, feel free to raise a new complaint above.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useComplaintsStore } from '../../stores/complaintsStore'
import { useAuthStore } from '../../stores/authStore'
import StatusBadge from '../../components/StatusBadge.vue'

const data = useComplaintsStore()
const auth = useAuthStore()
const submitted = ref(false)
const form = ref({ title: '', category: 'Plumbing', priority: 'medium', description: '' })

onMounted(() => {
  data.fetchAll()
})

const myComplaints = computed(() => {
    const userId = (auth.currentUser?.ROWID || auth.currentUser?.id || '').toString();
    return data.items.filter(c => String(c.residentId || '') === userId);
})

async function submit() {
  const payload = {
    ...form.value,
    priorityValue: form.value.priority, // Map frontend 'priority' to backend 'priorityValue'
    residentId: auth.currentUser?.ROWID || auth.currentUser?.id || ''
  }
  delete payload.priority;

  const res = await data.create(payload)
  if (res.success) {
    submitted.value = true
    form.value = { title: '', category: 'Plumbing', priority: 'medium', description: '' }
    setTimeout(() => submitted.value = false, 3000)
  }
}
</script>
