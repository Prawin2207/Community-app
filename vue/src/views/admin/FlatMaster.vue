<template>
  <div class="p-4 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Flat Master</h1>
        <p class="text-xs text-slate-500 mt-0.5">Manage flat registry, ownership and squarefootage</p>
      </div>
      <button @click="showForm = true" class="btn-primary flex items-center gap-2 text-sm">
        <Plus class="w-4 h-4" /> Add Flat
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div v-for="s in stats" :key="s.label" class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">{{ s.label }}</p>
        <p class="text-2xl font-black text-slate-900 mt-1">{{ s.value }}</p>
      </div>
    </div>

    <!-- Flat List -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-slate-50 flex items-center gap-3">
        <Search class="w-4 h-4 text-slate-400" />
        <input v-model="search" placeholder="Search flat number, block..." class="flex-1 text-sm outline-none text-slate-700" />
        <select v-model="filterStatus" class="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600">
          <option value="">All Status</option>
          <option value="vacant">Vacant</option>
          <option value="owner_occupied">Owner Occupied</option>
          <option value="rented">Rented</option>
        </select>
      </div>

      <div v-if="flatsStore.isLoading" class="p-8 text-center text-slate-400 text-sm">Loading flats...</div>
      <div v-else-if="filteredFlats.length === 0" class="p-12 text-center text-slate-400">
        <Building class="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p class="font-medium text-sm">No flats found</p>
      </div>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
          <tr>
            <th class="text-left p-3 pl-4">Flat</th>
            <th class="text-left p-3">Block / Floor</th>
            <th class="text-left p-3">BHK / Sq.ft</th>
            <th v-if="settingsStore.parkingEnabled" class="text-left p-3">Parking</th>
            <th class="text-right p-3">Maintenance</th>
            <th class="text-left p-3">Status</th>
            <th class="text-right p-3 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="flat in filteredFlats" :key="flat.ROWID" class="hover:bg-slate-50/50 transition-colors">
            <td class="p-3 pl-4 font-bold text-slate-800">{{ flat.flatNumber }}</td>
            <td class="p-3 text-slate-600">{{ flat.block }} / Floor {{ flat.floor }}</td>
            <td class="p-3 text-slate-600">{{ flat.bhk }} · {{ flat.sqft }} sq.ft</td>
            <td v-if="settingsStore.parkingEnabled" class="p-3 text-slate-600">{{ flat.parkingSpots || '—' }}</td>
            <td class="p-3 text-right font-semibold text-indigo-600">₹{{ getFlatMaintenance(flat) }}</td>
            <td class="p-3">
              <span :class="statusClass(flat.status)" class="text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wide">
                {{ flat.status?.replace('_', ' ') }}
              </span>
            </td>
            <td class="p-3 pr-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <!-- Documents Popover -->
                <div v-if="flat.documents && flat.documents.length > 0" class="relative group/docs mr-2">
                  <button class="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="View Documents">
                    <FileText class="w-4 h-4" />
                    <span class="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-indigo-500 text-[8px] text-white font-bold">
                      {{ flat.documents.length }}
                    </span>
                  </button>
                  <div class="absolute bottom-full right-0 mb-2 hidden group-hover/docs:block z-20 w-48">
                    <div class="bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-1">
                      <p class="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">Property Docs</p>
                      <a v-for="doc in flat.documents" :key="doc.fileId" :href="doc.url" target="_blank"
                        class="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors no-underline">
                        <FileText class="w-3.5 h-3.5 text-slate-400" />
                        <span class="text-xs text-slate-600 truncate flex-1">{{ doc.fileName || 'Doc' }}</span>
                      </a>
                    </div>
                  </div>
                </div>

                <router-link :to="`/admin/flats/${flat.ROWID}`"
                  class="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1">
                  <Eye class="w-3.5 h-3.5" /> View
                </router-link>
                <button @click="editFlat(flat)" class="text-slate-500 hover:text-slate-700">
                  <Pencil class="w-3.5 h-3.5" />
                </button>
                <button @click="deleteFlat(flat.ROWID)" class="text-rose-400 hover:text-rose-600">
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Flat Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-extrabold text-slate-800">{{ editingFlat ? 'Edit Flat' : 'Add New Flat' }}</h2>
            <button @click="closeForm" class="text-slate-400 hover:text-slate-600"><X class="w-5 h-5" /></button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Flat Number *</label>
              <input v-model="form.flatNumber" class="input" placeholder="e.g. A-101" />
            </div>
            <div>
              <label class="label">Block</label>
              <input v-model="form.block" class="input" placeholder="A / B / C" />
            </div>
            <div>
              <label class="label">Floor</label>
              <input v-model="form.floor" type="number" class="input" placeholder="1" />
            </div>
            <div>
              <label class="label">BHK</label>
              <select v-model="form.bhk" class="input">
                <option v-for="b in ['1BHK','2BHK','3BHK','4BHK','Studio']" :key="b" :value="b">{{ b }}</option>
              </select>
            </div>
            <div>
              <label class="label">Sq. Feet *</label>
              <input v-model="form.sqft" type="number" class="input" placeholder="850" />
            </div>
            <div>
              <label class="label">Maintenance Rate (₹/sqft)</label>
              <input v-model="form.maintenanceRate" type="number" class="input" placeholder="2.5" />
            </div>
            <div v-if="settingsStore.parkingEnabled">
              <label class="label">Parking Spots</label>
              <input v-model="form.parkingSpots" class="input" placeholder="e.g. P-101, P-102" />
            </div>
            <div>
              <label class="label">Status</label>
              <select v-model="form.status" class="input">
                <option value="vacant">Vacant</option>
                <option value="owner_occupied">Owner Occupied</option>
                <option value="rented">Rented</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="label">Property Documents (Floor Plan, Deeds)</label>
              <MultiFileUpload v-model="form.documents" />
            </div>
            <div class="col-span-2 mt-2 pt-4 border-t border-slate-100 relative">
              <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Owner Details (Optional)</h3>
              
              <div class="relative group">
                <label class="label">Search or Add Owner Name</label>
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    v-model="form.ownerName" 
                    @focus="showOwnerLookup = true"
                    class="input pl-10" 
                    placeholder="Search master owners or type new..." 
                  />
                </div>
                
                <!-- Lookup Results Dropdown -->
                <div v-if="showOwnerLookup && filteredMasterOwners.length > 0" 
                  class="absolute z-[60] left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden max-h-48 overflow-y-auto">
                  <div 
                    v-for="owner in filteredMasterOwners" 
                    :key="owner.ROWID"
                    @click="selectMasterOwner(owner)"
                    class="p-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <p class="text-sm font-bold text-slate-800">{{ owner.name }}</p>
                    <p class="text-[10px] text-slate-500">{{ owner.email }} · {{ owner.phone }}</p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label class="label">Owner Email</label>
                  <input v-model="form.ownerEmail" class="input" placeholder="email@example.com" />
                </div>
                <div>
                  <label class="label">Owner Phone</label>
                  <input v-model="form.ownerPhone" class="input" placeholder="+91 ..." />
                </div>
              </div>
            </div>
          </div>
          <div v-if="formError" class="text-sm text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{{ formError }}</div>
          <div class="flex justify-end gap-3 pt-2">
            <button @click="closeForm" class="btn-secondary text-sm">Cancel</button>
            <button @click="submitForm" :disabled="isSubmitting" class="btn-primary text-sm">
              {{ isSubmitting ? 'Saving...' : (editingFlat ? 'Update Flat' : 'Create Flat') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useFlatsStore } from '../../stores/flatsStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useOwnersStore } from '../../stores/ownersStore'
import { flatOwnersAPI, flatHistoryAPI } from '../../services/api'
import { Building, Plus, Search, Eye, Pencil, Trash2, X, FileText } from 'lucide-vue-next'
import MultiFileUpload from '../../components/MultiFileUpload.vue'

const flatsStore = useFlatsStore()
const settingsStore = useSettingsStore()
const ownersStore = useOwnersStore()
const search = ref('')
const filterStatus = ref('')
const showForm = ref(false)
const showOwnerLookup = ref(false)
const editingFlat = ref(null)
const isSubmitting = ref(false)
const formError = ref('')

const form = ref({ 
  flatNumber: '', 
  block: '', 
  floor: '', 
  bhk: '2BHK', 
  sqft: '', 
  maintenanceRate: '', 
  parkingSpots: '', 
  status: 'vacant',
  ownerName: '',
  ownerEmail: '',
  ownerPhone: '',
  documents: []
})

onMounted(() => {
  flatsStore.fetchAll()
  ownersStore.fetchAll()
})

const stats = computed(() => [
  { label: 'Total Flats', value: flatsStore.totalFlats },
  { label: 'Vacant', value: flatsStore.vacantFlats },
  { label: 'Rented', value: flatsStore.rentedFlats },
  { label: 'Owner Occupied', value: flatsStore.ownerOccupied },
])

const computedMaintenance = computed(() => {
  const s = parseFloat(form.value.sqft) || 0
  const r = parseFloat(form.value.maintenanceRate) || 0
  return (s * r).toFixed(2)
})

const filteredFlats = computed(() =>
  flatsStore.items.filter(f => {
    const matchSearch = !search.value || f.flatNumber?.toLowerCase().includes(search.value.toLowerCase()) || f.block?.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !filterStatus.value || f.status === filterStatus.value
    return matchSearch && matchStatus
  })
)

const filteredMasterOwners = computed(() => {
  if (!form.value.ownerName || form.value.ownerName.length < 2) return []
  return ownersStore.items.filter(o => 
    o.name?.toLowerCase().includes(form.value.ownerName.toLowerCase())
  ).slice(0, 5)
})

function selectMasterOwner(owner) {
  form.value.ownerName = owner.name
  form.value.ownerEmail = owner.email || ''
  form.value.ownerPhone = owner.phone || ''
  showOwnerLookup.value = false
}

// Close lookup when clicking outside (simple version)
watch(showForm, (val) => {
  if (!val) showOwnerLookup.value = false
})

function getFlatMaintenance(flat) {
  return ((parseFloat(flat.sqft) || 0) * (parseFloat(flat.maintenanceRate) || 0)).toFixed(2)
}

function statusClass(s) {
  return {
    vacant: 'bg-slate-100 text-slate-600',
    owner_occupied: 'bg-emerald-100 text-emerald-700',
    rented: 'bg-indigo-100 text-indigo-700',
  }[s] || 'bg-slate-100 text-slate-500'
}

function editFlat(flat) {
  editingFlat.value = flat
  form.value = { 
    flatNumber: flat.flatNumber, 
    block: flat.block || '', 
    floor: flat.floor || '', 
    bhk: flat.bhk || '2BHK', 
    sqft: flat.sqft || '', 
    maintenanceRate: flat.maintenanceRate || '', 
    parkingSpots: flat.parkingSpots || '', 
    status: flat.status || 'vacant',
    documents: flat.documents ? [...flat.documents] : [] 
  }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingFlat.value = null
  formError.value = ''
  form.value = { 
    flatNumber: '', 
    block: '', 
    floor: '', 
    bhk: '2BHK', 
    sqft: '', 
    maintenanceRate: '', 
    parkingSpots: '', 
    status: 'vacant',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    documents: []
  }
}

async function submitForm() {
  formError.value = ''
  if (!form.value.flatNumber || !form.value.sqft) {
    formError.value = 'Flat number and sq. feet are required.'
    return
  }
  isSubmitting.value = true
  
  const payload = { 
    ...form.value, 
    sqft: parseFloat(form.value.sqft), 
    maintenanceRate: parseFloat(form.value.maintenanceRate) || 0, 
    floor: parseInt(form.value.floor) || 0 
  }

  // If adding a flat and owner name is provided, we'll set status to owner_occupied if it was vacant
  if (!editingFlat.value && form.value.ownerName && payload.status === 'vacant') {
    payload.status = 'owner_occupied'
  }

  const res = editingFlat.value
    ? await flatsStore.update(editingFlat.value.ROWID || editingFlat.value.id, payload)
    : await flatsStore.create(payload)
  
  if (res.success) {
    const flatId = editingFlat.value ? (editingFlat.value.ROWID || editingFlat.value.id) : res.data?.ROWID
    
    // Handle Owner Creation for NEW flats
    if (!editingFlat.value && form.value.ownerName && flatId) {
      try {
        await flatOwnersAPI.create({
          flatId: flatId,
          name: form.value.ownerName,
          email: form.value.ownerEmail,
          phone: form.value.ownerPhone,
          status: 'active'
        })

        await flatHistoryAPI.create({
          flatId: flatId,
          entityType: 'owner',
          entityName: form.value.ownerName,
          eventType: 'ownership_transfer',
          eventDate: new Date().toISOString().split('T')[0],
          notes: 'Added during flat creation'
        })
      } catch (err) {
        console.error('Failed to create owner:', err)
        // We don't block the flat creation if owner fails, but maybe show a warning?
      }
    }
    
    closeForm()
  } else {
    formError.value = res.error || 'Operation failed.'
  }
  isSubmitting.value = false
}

async function deleteFlat(id) {
  if (!confirm('Delete this flat? This cannot be undone.')) return
  await flatsStore.remove(id)
}
</script>
