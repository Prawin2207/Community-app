<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="page-title">My Visitors</h1>
      <button @click="showModal = true" class="btn-primary">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Pre-register Visitor
      </button>
    </div>

    <div class="space-y-3">
      <div v-if="data.isLoading" class="p-8 text-center text-slate-400">Loading visitors...</div>
      
      <div v-else-if="data.items.length === 0" class="card border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center text-slate-500 rounded-2xl">
        No visitors found
      </div>

      <template v-else>
        <div
          v-for="visitor in data.items"
          :key="visitor.ROWID || visitor.id"
          class="card hover:shadow-card-hover transition-shadow"
        >
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold flex-shrink-0">
              {{ visitor.name ? visitor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'V' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="text-sm font-bold text-slate-800">{{ visitor.name }}</p>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">{{ visitor.phone }} &bull; {{ visitor.purpose }}</p>
              <div class="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span v-if="visitor.CREATEDTIME">Date: {{ visitor.CREATEDTIME.split(' ')[0] || visitor.CREATEDTIME }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Pre-register Modal -->
    <ModalComponent v-model="showModal" title="Pre-register Visitor" size="md">
      <div class="space-y-4">
        <div>
          <label class="label">Visitor Name *</label>
          <input v-model="form.name" class="input" placeholder="Full name" />
        </div>
        <div>
          <label class="label">Phone Number *</label>
          <input v-model="form.phone" class="input" placeholder="+91 99999 00000" />
        </div>
        <div>
          <label class="label">Purpose of Visit</label>
          <select v-model="form.purpose" class="input">
            <option>Personal</option>
            <option>Delivery</option>
            <option>Work</option>
            <option>Service</option>
          </select>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button @click="showModal = false" class="btn-secondary">Cancel</button>
          <button @click="register" class="btn-primary">Register</button>
        </div>
      </template>
    </ModalComponent>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVisitorsStore } from '../../stores/visitorsStore'
import { useAuthStore } from '../../stores/authStore'
import ModalComponent from '../../components/ModalComponent.vue'

const data = useVisitorsStore()
const auth = useAuthStore()
const showModal = ref(false)
const form = ref({ name: '', phone: '', purpose: 'Personal' })

onMounted(() => {
  data.fetchAll()
})

async function register() {
  await data.logVisitor({
    ...form.value,
    residentId: auth.currentUser?.ROWID || auth.currentUser?.id || ''
  })
  form.value = { name: '', phone: '', purpose: 'Personal' }
  showModal.value = false
}
</script>
