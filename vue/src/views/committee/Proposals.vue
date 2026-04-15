<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Community Proposals</h1>
        <p class="text-sm text-slate-500 mt-1">Voting and governance portal</p>
      </div>
      <button @click="showAddModal = true" class="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
        <Plus class="w-4 h-4" /> New Proposal
      </button>
    </div>

    <!-- Active Proposals -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-if="governanceStore.loading" class="col-span-full py-10 text-center animate-pulse text-slate-400">
        Loading proposals...
      </div>
      <div v-else-if="governanceStore.proposals.length === 0" class="col-span-full py-10 text-center text-slate-400">
        No proposals found
      </div>
      <div v-for="prop in governanceStore.proposals" :key="prop.ROWID" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80 hover:border-cyan-200 transition-all group">
        <div class="flex items-start justify-between mb-4">
          <div class="p-2.5 rounded-xl bg-cyan-50 text-cyan-600">
            <Gavel class="w-5 h-5" />
          </div>
          <span :class="['text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md', statusClass(prop.status)]">
            {{ prop.status.replace('_', ' ') }}
          </span>
        </div>
        <h3 class="font-bold text-slate-800 mb-2 group-hover:text-cyan-700 transition-colors">{{ prop.title }}</h3>
        <p class="text-sm text-slate-500 line-clamp-2 mb-6">{{ prop.description }}</p>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-emerald-600">{{ prop.votesFor || 0 }} For</span>
            <span class="text-rose-600">{{ prop.votesAgainst || 0 }} Against</span>
          </div>
          <div class="h-1.5 bg-slate-50 rounded-full overflow-hidden flex">
            <div class="h-full bg-emerald-400 transition-all duration-500" :style="{ width: calculateProgress(prop, 'for') + '%' }"></div>
            <div class="h-full bg-rose-400 transition-all duration-500" :style="{ width: calculateProgress(prop, 'against') + '%' }"></div>
          </div>
        </div>

        <div class="flex gap-2 mt-6" v-if="prop.status === 'voting_open'">
          <button @click="handleVote(prop, 'for')" class="flex-1 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors">Vote For</button>
          <button @click="handleVote(prop, 'against')" class="flex-1 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors">Vote Against</button>
        </div>

        <div class="flex gap-2 mt-4 pt-4 border-t border-slate-50" v-if="auth.isAdmin">
          <button v-if="prop.status === 'voting_open'" @click="updateStatus(prop, 'approved')" class="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 uppercase tracking-widest">Approve</button>
          <button v-if="prop.status === 'voting_open'" @click="updateStatus(prop, 'rejected')" class="text-[10px] font-bold text-rose-600 hover:text-rose-800 uppercase tracking-widest ml-auto">Reject</button>
        </div>
      </div>
    </div>

    <!-- New Proposal Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="showAddModal = false"></div>
      <div class="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <h2 class="text-xl font-bold text-slate-800 mb-6">Create New Proposal</h2>
        <div class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Title</label>
            <input v-model="newProp.title" type="text" class="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-cyan-500 transition-all" placeholder="e.g., CCTV in B Block" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
            <textarea v-model="newProp.description" class="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-cyan-500 h-24 resize-none transition-all" placeholder="Detailed plan..."></textarea>
          </div>
          <div class="flex gap-3">
            <button @click="showAddModal = false" class="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">
              Cancel
            </button>
            <button @click="createProposal" :disabled="isSubmitting" class="flex-[2] py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-lg shadow-cyan-200 transition-all flex items-center justify-center gap-2">
              <Plus v-if="!isSubmitting" class="w-4 h-4" />
              {{ isSubmitting ? 'Launching...' : 'Launch Proposal' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Gavel } from 'lucide-vue-next'
import { useGovernanceStore } from '../../stores/governanceStore'
import { useAuthStore } from '../../stores/authStore'

const governanceStore = useGovernanceStore()
const auth = useAuthStore()
const showAddModal = ref(false)
const isSubmitting = ref(false)
const newProp = ref({ title: '', description: '' })

onMounted(() => governanceStore.fetchAll())

function statusClass(status) {
  return {
    voting_open: 'bg-emerald-50 text-emerald-600',
    under_review: 'bg-amber-50 text-amber-600',
    approved: 'bg-indigo-50 text-indigo-600',
    rejected: 'bg-rose-50 text-rose-600'
  }[status] || 'bg-slate-50 text-slate-600'
}

function calculateProgress(prop, type) {
  const total = (prop.votesFor || 0) + (prop.votesAgainst || 0)
  if (total === 0) return 0
  return type === 'for' ? (prop.votesFor / total * 100) : (prop.votesAgainst / total * 100)
}

async function createProposal() {
  if (!newProp.value.title || !newProp.value.description) return
  isSubmitting.value = true
  try {
    await governanceStore.createProposal({
      ...newProp.value,
      author: auth.currentUser?.name || 'Admin',
      status: 'voting_open',
      votesFor: 0,
      votesAgainst: 0
    })
    showAddModal.value = false
    newProp.value = { title: '', description: '' }
  } catch (err) {
    const msg = err.response?.data?.details || err.response?.data?.error || err.message
    alert('Failed to create proposal: ' + msg)
  } finally {
    isSubmitting.value = false
  }
}

async function handleVote(prop, type) {
  const payload = {}
  if (type === 'for') payload.votesFor = (prop.votesFor || 0) + 1
  else payload.votesAgainst = (prop.votesAgainst || 0) + 1
  
  try {
    await governanceStore.voteProposal(prop.ROWID, payload)
  } catch (err) {
    alert('Failed to cast vote')
  }
}

async function updateStatus(prop, status) {
  try {
    await governanceStore.voteProposal(prop.ROWID, { status })
  } catch (err) {
    alert('Failed to update status')
  }
}
</script>
