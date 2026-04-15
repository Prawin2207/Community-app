<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Voting Portal</h1>
      <p class="text-sm text-slate-500 mt-1">Cast and review votes on community proposals</p>
    </div>
    <div class="space-y-4">
      <div v-for="v in activeProposals" :key="v.ROWID" class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="flex items-start justify-between gap-4">
          <h3 class="font-semibold text-slate-800">{{ v.title }}</h3>
          <span class="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 bg-emerald-100 text-emerald-700">
            Voting Open
          </span>
        </div>
        <p class="text-sm text-slate-500 mt-2">{{ v.description }}</p>

        <div class="mt-4 grid grid-cols-2 gap-3" v-if="!hasVoted(v.ROWID)">
          <button @click="handleVote(v, 'for')" class="py-2 rounded-xl border-2 border-emerald-300 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition-colors">✓ Vote For</button>
          <button @click="handleVote(v, 'against')" class="py-2 rounded-xl border-2 border-rose-300 text-rose-700 font-semibold text-sm hover:bg-rose-50 transition-colors">✗ Vote Against</button>
        </div>
        <div v-if="hasVoted(v.ROWID)" class="mt-4 p-3 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
          <p class="text-sm font-medium">✓ You have cast your vote for this proposal</p>
        </div>

        <!-- Result Bar -->
        <div class="mt-4">
          <div class="flex justify-between text-xs text-slate-500 mb-1">
            <span>For: {{ v.votesFor || 0 }}</span><span>Against: {{ v.votesAgainst || 0 }}</span>
          </div>
          <div class="h-2 bg-rose-100 rounded-full overflow-hidden flex">
            <div class="h-full bg-emerald-500 transition-all duration-700" :style="{ width: (v.votesFor / ((v.votesFor || 0) + (v.votesAgainst || 0) || 1) * 100) + '%' }"></div>
          </div>
        </div>
      </div>
      <div v-if="activeProposals.length === 0" class="text-center py-20 text-slate-400">
        No active proposals for voting at this time.
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useGovernanceStore } from '../../stores/governanceStore'

const governanceStore = useGovernanceStore()

onMounted(() => governanceStore.fetchAll())

const activeProposals = computed(() => {
  return governanceStore.proposals.filter(p => p.status === 'voting_open')
})

function hasVoted(id) {
  const votedIds = JSON.parse(localStorage.getItem('community_voted_ids') || '[]')
  return votedIds.includes(id)
}

async function handleVote(prop, type) {
  if (hasVoted(prop.ROWID)) return
  
  const payload = {}
  if (type === 'for') payload.votesFor = (prop.votesFor || 0) + 1
  else payload.votesAgainst = (prop.votesAgainst || 0) + 1
  
  try {
    await governanceStore.voteProposal(prop.ROWID, payload)
    const votedIds = JSON.parse(localStorage.getItem('community_voted_ids') || '[]')
    votedIds.push(prop.ROWID)
    localStorage.setItem('community_voted_ids', JSON.stringify(votedIds))
  } catch (err) {
    alert('Failed to cast vote')
  }
}
</script>
