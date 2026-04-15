<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="page-title">Residents Management</h1>
        <p class="text-sm text-slate-500 mt-1">Total {{ data.items.length }} registered residents</p>
      </div>
      <button @click="openAddModal" class="btn-primary self-start">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Resident
      </button>
    </div>

    <!-- Filters -->
    <div class="card p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input v-model="search" type="text" placeholder="Search by name, apartment..." class="input pl-10" />
        </div>
        <select v-model="statusFilter" class="input sm:w-40">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
        <select v-model="typeFilter" class="input sm:w-40">
          <option value="">All Types</option>
          <option value="Owner">Owner</option>
          <option value="Tenant">Tenant</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Resident</th>
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Apartment</th>
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Type</th>
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Dues</th>
              <th class="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="resident in filteredResidents"
              :key="resident.ROWID || resident.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-[var(--accent-1)] flex items-center justify-center text-[#1a1a1a] text-sm font-bold flex-shrink-0">
                    {{ resident.name.split(' ').map(n => n[0]).join('') }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-800">{{ resident.name }}</p>
                    <p class="text-xs text-slate-400">{{ resident.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5 text-sm font-medium text-slate-700">{{ resident.apartment }}</td>
              <td class="px-4 py-3.5 text-sm text-slate-600 hidden sm:table-cell">
                <p>{{ resident.phone }}</p>
                <div v-if="settingsStore.parkingEnabled && (resident.vehicleNo || resident.parkingSpot)" class="flex flex-col mt-1 gap-1">
                  <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded w-fit inline-flex whitespace-nowrap">🚗 {{ resident.vehicleNo || 'No vehicle' }}</span>
                  <span v-if="resident.parkingSpot" class="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded w-fit inline-flex whitespace-nowrap">🅿️ {{ resident.parkingSpot }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5"><StatusBadge :status="resident.status" /></td>
              <td class="px-4 py-3.5 text-sm text-slate-600 hidden md:table-cell">
                <span :class="resident.type === 'Owner' ? 'bg-[var(--accent-1)] text-[#1a1a1a]' : 'bg-[var(--bg-elevated)] border border-[var(--border-glass)] text-[var(--text-primary)]'" class="px-2 py-1 text-xs font-semibold">
                  {{ resident.type }}
                </span>
              </td>
              <td class="px-4 py-3.5">
                <span :class="['text-sm font-semibold', resident.dues > 0 ? 'text-[#e63946]' : 'text-[var(--text-primary)]']">
                  {{ resident.dues > 0 ? `₹${resident.dues.toLocaleString()}` : 'Clear' }}
                </span>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-1">
                  <!-- Documents Popover/List -->
                  <div v-if="resident.documents && resident.documents.length > 0" class="relative group/docs mr-2">
                    <button class="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="View Documents">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span class="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-indigo-500 text-[8px] text-white font-bold">
                        {{ resident.documents.length }}
                      </span>
                    </button>
                    <!-- Tooltip/List on Hover -->
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/docs:block z-20 w-48">
                      <div class="bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-1">
                        <p class="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">Attachments</p>
                        <a 
                          v-for="doc in resident.documents" 
                          :key="doc.fileId"
                          :href="doc.url" 
                          target="_blank"
                          class="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors no-underline"
                        >
                          <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span class="text-xs text-slate-600 truncate flex-1">{{ doc.fileName || 'Document' }}</span>
                        </a>
                      </div>
                      <div class="w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45 mx-auto -mt-1"></div>
                    </div>
                  </div>

                  <button
                    @click="openEditModal(resident)"
                    class="p-1.5 text-slate-400 hover:text-[var(--accent-1)] hover:bg-[var(--bg-hover)] transition-colors"
                    title="Edit"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteResident(resident.ROWID || resident.id)"
                    class="p-1.5 text-slate-400 hover:text-[#e63946] hover:bg-[var(--bg-hover)] transition-colors"
                    title="Delete"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredResidents.length === 0">
              <td colspan="7" class="px-4 py-10 text-center text-sm text-slate-400">No residents found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Resident Modal -->
    <ModalComponent v-model="showModal" :title="modalMode === 'edit' ? 'Edit Resident' : 'Add New Resident'" size="md">
      <template #default>
        <form @submit.prevent="save" id="residentForm" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Full Name *</label>
              <input v-model="form.name" type="text" class="input" placeholder="John Doe" required />
            </div>
            <div>
              <label class="label">Apartment No. *</label>
              <input v-model="form.apartment" type="text" class="input" placeholder="A-101" required />
            </div>
          </div>
          <div>
            <label class="label">Phone Number *</label>
            <input v-model="form.phone" type="tel" class="input" placeholder="+91 98765 43210" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Email</label>
              <input v-model="form.email" type="email" class="input" placeholder="john@email.com" />
            </div>
            <div>
              <label class="label">ID Proof (Aadhar/PAN)</label>
              <input v-model="form.documentProof" type="text" class="input" placeholder="Document Number" required />
            </div>
          </div>
          <div v-if="settingsStore.documentsEnabled">
            <label class="label">Attached Documents</label>
            <MultiFileUpload v-model="form.documents" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Type</label>
              <select v-model="form.type" class="input">
                <option>Owner</option>
                <option>Tenant</option>
              </select>
            </div>
            <div>
              <label class="label">Status</label>
              <select v-model="form.status" class="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <div v-if="settingsStore.parkingEnabled" class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Vehicle No.</label>
              <input v-model="form.vehicleNo" type="text" class="input" placeholder="KA 03 AB 1234" />
            </div>
            <div>
              <label class="label">Vehicle Make</label>
              <input v-model="form.vehicleMake" type="text" class="input" placeholder="Honda City" />
            </div>
            <div class="col-span-2">
              <label class="label">Allocated Parking Spot</label>
              <input v-model="form.parkingSpot" type="text" class="input" placeholder="P-101" />
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button @click="showModal = false" class="btn-secondary" type="button">Cancel</button>
          <button form="residentForm" type="submit" class="btn-primary">
            {{ modalMode === 'edit' ? 'Update' : 'Add Resident' }}
          </button>
        </div>
      </template>
    </ModalComponent>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useResidentsStore } from '../../stores/residentsStore'
import { useSettingsStore } from '../../stores/settingsStore'
import StatusBadge from '../../components/StatusBadge.vue'
import ModalComponent from '../../components/ModalComponent.vue'
import MultiFileUpload from '../../components/MultiFileUpload.vue'

const data = useResidentsStore()
const settingsStore = useSettingsStore()
const search = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const showModal = ref(false)
const modalMode = ref('add') // 'add' or 'edit'
const form = ref({ ROWID: null, name: '', apartment: '', phone: '', email: '', type: 'Owner', status: 'active', vehicleNo: '', vehicleMake: '', parkingSpot: '', documentProof: '', documents: [] })

onMounted(() => {
  data.fetchAll()
})

const filteredResidents = computed(() => data.items.filter(r => {
  const q = search.value.toLowerCase()
  return (
    (r.name?.toLowerCase().includes(q) || r.apartment?.toLowerCase().includes(q)) &&
    (!statusFilter.value || r.status === statusFilter.value) &&
    (!typeFilter.value || r.type === typeFilter.value)
  )
}))

function openAddModal() {
  modalMode.value = 'add'
  form.value = { ROWID: null, name: '', apartment: '', phone: '', email: '', type: 'Owner', status: 'active', vehicleNo: '', vehicleMake: '', parkingSpot: '', documentProof: '', documents: [] }
  showModal.value = true
}

function openEditModal(resident) {
  modalMode.value = 'edit'
  let existingDocs = []
  try {
    existingDocs = resident.description ? JSON.parse(resident.description) : []
    if (!Array.isArray(existingDocs)) existingDocs = []
  } catch (e) {
    existingDocs = []
  }
  form.value = { ...resident, documents: existingDocs }
  showModal.value = true
}

async function save() {
  if (!form.value.name || !form.value.apartment) return

  // Sending ALL fields to ensure they are stored in Catalyst
  const payload = {
    ...form.value
  }

  if (modalMode.value === 'add') {
    delete payload.ROWID; // Don't send empty ROWID for new records
    await data.create(payload)
  } else {
    await data.update(payload)
  }
  showModal.value = false
}

function deleteResident(id) {
  if(confirm('Are you sure you want to delete this resident?')) {
    data.remove(id)
  }
}
</script>
