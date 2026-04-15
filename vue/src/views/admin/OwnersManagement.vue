<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="page-title">Owners Management</h1>
        <p class="text-sm text-slate-500 mt-1">Total {{ data.items.length }} registered owners</p>
      </div>
      <button @click="openAddModal" class="btn-primary self-start">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Owner
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center flex-shrink-0"
          style="background: var(--accent-1);">
          <svg class="w-5 h-5 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-slate-500">Total Owners</p>
          <p class="text-xl font-bold text-slate-800">{{ data.totalOwners }}</p>
        </div>
      </div>
      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center flex-shrink-0"
          style="background: var(--bg-hover); border: 1px solid var(--accent-1);">
          <svg class="w-5 h-5 text-[var(--accent-1)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-slate-500">Active</p>
          <p class="text-xl font-bold text-emerald-600">{{ data.activeOwners }}</p>
        </div>
      </div>
      <div class="card p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
        <div class="w-10 h-10 flex items-center justify-center flex-shrink-0"
          style="background: var(--bg-hover); border: 1px solid #e63946;">
          <svg class="w-5 h-5 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-slate-500">Inactive</p>
          <p class="text-xl font-bold text-rose-500">{{ data.totalOwners - data.activeOwners }}</p>
        </div>
      </div>
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
        <select v-model="typeFilter" class="input sm:w-48">
          <option value="">All Types</option>
          <option value="Sole">Sole Owner</option>
          <option value="Joint">Joint Owner</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="data.isLoading" class="card p-10 flex items-center justify-center gap-3 text-slate-400">
      <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      Loading owners...
    </div>

    <!-- Table -->
    <div v-else class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Owner</th>
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Apartment</th>
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Ownership</th>
              <th class="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="owner in filteredOwners"
              :key="owner.ROWID || owner.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 flex items-center justify-center text-[#1a1a1a] text-sm font-bold flex-shrink-0"
                    style="background: var(--accent-1);">
                    {{ getInitials(owner.name) }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-800">{{ owner.name }}</p>
                    <p class="text-xs text-slate-400">{{ owner.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5 text-sm font-medium text-slate-700">{{ owner.apartment }}</td>
              <td class="px-4 py-3.5 text-sm text-slate-600 hidden sm:table-cell">{{ owner.phone }}</td>
              <td class="px-4 py-3.5"><StatusBadge :status="owner.status" /></td>
              <td class="px-4 py-3.5 text-sm text-slate-600 hidden md:table-cell">
                <span
                  :class="owner.ownershipType === 'Sole' ? 'bg-[var(--accent-1)] text-[#1a1a1a]' : 'bg-[var(--bg-elevated)] border border-[var(--border-glass)] text-[var(--text-primary)]'"
                  class="px-2 py-1 text-xs font-semibold">
                  {{ owner.ownershipType || 'Sole' }}
                </span>
              </td>
              <td class="px-4 py-3.5">
                <select
                  :value="owner.status"
                  @change="e => updateStatus(owner.ROWID || owner.id, e.target.value)"
                  class="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-1">
                  <!-- Documents Popover -->
                  <div v-if="owner.documents && owner.documents.length > 0" class="relative group/docs mr-2">
                    <button class="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="View Documents">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span class="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-indigo-500 text-[8px] text-white font-bold">
                        {{ owner.documents.length }}
                      </span>
                    </button>
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/docs:block z-20 w-48">
                      <div class="bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-1">
                        <p class="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">Attachments</p>
                        <a v-for="doc in owner.documents" :key="doc.fileId" :href="doc.url" target="_blank"
                          class="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors no-underline">
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
                    @click="openEditModal(owner)"
                    class="p-1.5 text-slate-400 hover:text-[var(--accent-1)] hover:bg-[var(--bg-hover)] transition-colors"
                    title="Edit"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteOwner(owner.ROWID || owner.id)"
                    class="p-1.5 text-slate-400 hover:text-[#e63946] hover:bg-[var(--bg-hover)] transition-colors"
                    title="Delete"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredOwners.length === 0">
              <td colspan="6" class="px-4 py-12 text-center">
                <div class="flex flex-col items-center gap-2 text-slate-400">
                  <svg class="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <p class="text-sm font-medium">No owners found</p>
                  <p class="text-xs">Add your first owner using the button above</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <ModalComponent v-model="showModal" :title="modalMode === 'edit' ? 'Edit Owner' : 'Add New Owner'" size="md">
      <template #default>
        <form @submit.prevent="save" id="ownerForm" class="space-y-4">
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
          <div>
            <label class="label">Email</label>
            <input v-model="form.email" type="email" class="input" placeholder="john@email.com" />
          </div>
          <div>
            <label class="label">Attached Documents (Sale Deed, ID Proof)</label>
            <MultiFileUpload v-model="form.documents" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Ownership Type</label>
              <select v-model="form.ownershipType" class="input">
                <option value="Sole">Sole Owner</option>
                <option value="Joint">Joint Owner</option>
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
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button @click="showModal = false" class="btn-secondary" type="button">Cancel</button>
          <button form="ownerForm" type="submit" class="btn-primary">
            {{ modalMode === 'edit' ? 'Update Owner' : 'Add Owner' }}
          </button>
        </div>
      </template>
    </ModalComponent>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOwnersStore } from '../../stores/ownersStore'
import StatusBadge from '../../components/StatusBadge.vue'
import ModalComponent from '../../components/ModalComponent.vue'
import MultiFileUpload from '../../components/MultiFileUpload.vue'

const data = useOwnersStore()
const search = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const showModal = ref(false)
const modalMode = ref('add')
const form = ref({ ROWID: null, name: '', apartment: '', phone: '', email: '', ownershipType: 'Sole', status: 'active', documents: [] })

onMounted(() => {
  data.fetchAll()
})

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2)
}

const filteredOwners = computed(() => data.items.filter(o => {
  const q = search.value.toLowerCase()
  return (
    (o.name?.toLowerCase().includes(q) || o.apartment?.toLowerCase().includes(q)) &&
    (!statusFilter.value || o.status === statusFilter.value) &&
    (!typeFilter.value || o.ownershipType === typeFilter.value)
  )
}))

function openAddModal() {
  modalMode.value = 'add'
  form.value = { ROWID: null, name: '', apartment: '', phone: '', email: '', ownershipType: 'Sole', status: 'active', documents: [] }
  showModal.value = true
}

function openEditModal(owner) {
  modalMode.value = 'edit'
  form.value = { ...owner, documents: owner.documents ? [...owner.documents] : [] }
  showModal.value = true
}

async function save() {
  if (!form.value.name || !form.value.apartment) return
  
  const payload = { ...form.value }
  
  if (modalMode.value === 'add') {
    delete payload.ROWID;
    await data.create(payload)
  } else {
    await data.update(payload)
  }
  showModal.value = false
}

async function updateStatus(id, newStatus) {
  await data.update({ ROWID: id, status: newStatus })
}

function deleteOwner(id) {
  if (confirm('Are you sure you want to delete this owner?')) {
    data.remove(id)
  }
}
</script>
