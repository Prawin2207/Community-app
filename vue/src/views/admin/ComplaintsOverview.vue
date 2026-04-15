<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="page-title">Complaints Overview</h1>
        <p class="text-sm text-slate-500 mt-1">Track and resolve resident complaints</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total" :value="data.items.length" :icon="MessageSquare" color="indigo" />
      <StatCard label="Open" :value="data.openComplaints" :icon="AlertCircle" color="rose" />
      <StatCard label="In Progress" :value="data.items.filter(c=>c.status==='in_progress').length" :icon="Clock" color="amber" />
      <StatCard label="Resolved" :value="data.resolvedComplaints" :icon="CheckCircle" color="emerald" />
    </div>

    <!-- Charts + List -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 space-y-3">
        <div class="flex items-center gap-3">
          <input v-model="search" type="text" placeholder="Search complaints..." class="input flex-1" />
          <select v-model="statusFilter" class="input w-40">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div class="space-y-3">
          <div
            v-for="c in filteredComplaints"
            :key="c.ROWID || c.id"
            class="card hover:shadow-card-hover transition-shadow"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <StatusBadge :status="c['priority-value'] || c.priority" />
                  <span class="text-xs text-slate-400">ID: {{ c.ROWID || c.id }}</span>
                  <span class="text-xs text-slate-400">{{ c.CREATEDTIME ? c.CREATEDTIME.split(' ')[0] : '' }}</span>
                </div>
                <p class="text-sm font-bold text-slate-800">{{ c.title }}</p>
                <p class="text-xs text-slate-500 mt-0.5">Host ID: {{ c.residentId || 'Unknown' }} &bull; {{ c.category }}</p>
                <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ c.description }}</p>
              </div>
              <div class="flex flex-col items-end gap-2 flex-shrink-0">
                <StatusBadge :status="c.status" />
                <div class="flex items-center gap-2">
                  <select
                    :value="c.status"
                    @change="e => updateComplaintStatus(c.ROWID || c.id, e.target.value)"
                    class="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <select
                    :value="c.assignedTo || ''"
                    @change="e => assignTechnician(c.ROWID || c.id, e.target.value)"
                    class="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Assign Tech</option>
                    <option v-for="tech in technicians" :key="tech.ROWID" :value="tech.ROWID">{{ tech.name }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div v-if="filteredComplaints.length === 0" class="card text-center py-10 text-slate-400 text-sm">
            No complaints found
          </div>
        </div>
      </div>

      <ChartCard title="By Category" type="doughnut" :data="chartData.complaintsByCategory" height="h-64"
        :options="{ plugins: { legend: { position: 'right' } }, scales: {} }" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useComplaintsStore } from '../../stores/complaintsStore'
import { useHrStore } from '../../stores/hrStore'
import { chartData } from '../../data/mockData'
import StatCard from '../../components/StatCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import ChartCard from '../../components/ChartCard.vue'
import { MessageSquare, AlertCircle, Clock, CheckCircle } from 'lucide-vue-next'

const data = useComplaintsStore()
const hrStore = useHrStore()
const search = ref('')
const statusFilter = ref('')

onMounted(() => {
  data.fetchAll()
  hrStore.fetchAll()
})

const technicians = computed(() => {
  return hrStore.staff.filter(s => s.role === 'TECHNICIAN' || s.dept === 'Maintenance' || s.dept === 'Technical')
})

const filteredComplaints = computed(() => data.items.filter(c => {
  const q = search.value.toLowerCase()
  return ((c.title || '').toLowerCase().includes(q) || (c.residentId || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q)) &&
         (!statusFilter.value || c.status === statusFilter.value)
}))

function updateComplaintStatus(id, newStatus) {
  data.updateStatus({ ROWID: id, status: newStatus })
}

function assignTechnician(id, techId) {
  if (!techId) return
  data.assignComplaint(id, techId)
}
</script>
