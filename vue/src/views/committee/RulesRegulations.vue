<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Rules & Regulations</h1>
        <p class="text-sm text-slate-500 mt-1">Community bylaws and society rules</p>
      </div>
      <button v-if="isAdmin" @click="showAddModal = true" class="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-colors">
        <Plus class="w-4 h-4" /> Add Rule
      </button>
    </div>

    <div class="space-y-3">
      <div v-if="governanceStore.loading" class="p-10 text-center animate-pulse text-slate-400">Loading regulations...</div>
      <div v-for="(rule, idx) in governanceStore.rules" :key="rule.ROWID" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <button @click="rule.open = !rule.open" class="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center">{{ idx + 1 }}</span>
            <h3 class="font-semibold text-slate-800">{{ rule.title }}</h3>
          </div>
          <ChevronDown class="w-4 h-4 text-slate-400 transition-transform" :class="rule.open ? 'rotate-180' : ''" />
        </button>
        <div v-if="rule.open" class="px-5 pb-5 space-y-2">
          <p class="text-sm text-slate-600 flex gap-2">
            <span class="text-primary-500 mt-0.5">•</span> {{ rule.items }}
          </p>
          <div v-if="isAdmin" class="pt-2 flex justify-end">
            <button @click="governanceStore.removeRule(rule.ROWID)" class="text-[10px] text-rose-500 font-bold uppercase hover:underline">Remove Rule</button>
          </div>
        </div>
      </div>
      <div v-if="governanceStore.rules.length === 0" class="p-10 text-center text-slate-400">No regulations found</div>
    </div>

    <!-- Add Rule Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="showAddModal = false"></div>
      <div class="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <h2 class="text-xl font-bold text-slate-800 mb-6 font-display">Add Society Regulation</h2>
        <div class="space-y-4">
          <div>
            <label class="label text-[10px]">Title</label>
            <input v-model="newRule.title" type="text" class="input" placeholder="Parking Guideline" />
          </div>
          <div>
            <label class="label text-[10px]">Rule Details</label>
            <textarea v-model="newRule.items" class="input h-24 resize-none" placeholder="Detailed rule statement..."></textarea>
          </div>
          <div class="flex gap-3 mt-2">
            <button @click="showAddModal = false" class="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">
              Cancel
            </button>
            <button @click="addRule" :disabled="isSubmitting" class="flex-[2] py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 transition-all">
              {{ isSubmitting ? 'Publishing...' : 'Publish Rule' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ChevronDown, Plus } from 'lucide-vue-next'
import { useGovernanceStore } from '../../stores/governanceStore'
import { useAuthStore } from '../../stores/authStore'
import { ROLES } from '../../data/mockData'

const governanceStore = useGovernanceStore()
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.role === ROLES.SUPER_ADMIN)
const showAddModal = ref(false)
const isSubmitting = ref(false)
const newRule = ref({ title: '', items: '' })

onMounted(() => governanceStore.fetchAll())

async function addRule() {
  if (!newRule.value.title || !newRule.value.items) return
  isSubmitting.value = true
  try {
    await governanceStore.addRule(newRule.value)
    showAddModal.value = false
    newRule.value = { title: '', items: '' }
  } catch (err) {
    alert('Failed to add rule: ' + (err.response?.data?.error || err.message))
  } finally {
    isSubmitting.value = false
  }
}
</script>
