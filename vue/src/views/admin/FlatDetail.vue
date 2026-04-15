<template>
  <div class="p-4 space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <router-link to="/admin/flats" class="text-slate-400 hover:text-slate-700 transition-colors">
        <ArrowLeft class="w-5 h-5" />
      </router-link>
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Flat {{ flat?.flatNumber || '—' }}</h1>
        <p class="text-xs text-slate-500 mt-0.5">{{ flat?.block }} · Floor {{ flat?.floor }} · {{ flat?.bhk }} · {{ flat?.sqft }} sq.ft <span v-if="flat?.parkingSpots">· Parking: {{ flat?.parkingSpots }}</span></p>
      </div>
      <span :class="statusClass(flat?.status)" class="ml-auto text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wide">
        {{ (flat?.status || '').replace('_', ' ') }}
      </span>
    </div>

    <!-- Unit Basics (Configurable) -->
    <div v-if="settingsStore.parkingEnabled" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h2 class="font-extrabold text-slate-800 flex items-center gap-2 mb-3">
        <Key class="w-4 h-4 text-indigo-500" /> Unit Configuration
      </h2>
      <div>
        <label class="label">Allocated Parking Spots</label>
        <div class="flex items-center gap-2">
          <input v-model="flat.parkingSpots" class="input flex-1" placeholder="e.g. P-101, P-102" />
          <button @click="saveFlatBasics" class="btn-primary py-2 px-4 shadow-none">Update</button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Owner + Tenant -->
      <div class="lg:col-span-2 space-y-5">

        <!-- Current Owner Card -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-extrabold text-slate-800 flex items-center gap-2"><Crown class="w-4 h-4 text-amber-500" /> Owner Details</h2>
            <button @click="showOwnerForm = true" class="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
              {{ currentOwner ? 'Edit Owner' : 'Assign Owner' }}
            </button>
          </div>
          <div v-if="currentOwner" class="space-y-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <User class="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p class="font-bold text-slate-800 text-sm">{{ currentOwner.name }}</p>
                <p class="text-xs text-slate-500">{{ currentOwner.email }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 pt-2">
              <div class="text-xs text-slate-500"><span class="text-slate-400">Phone:</span> {{ currentOwner.phone || '—' }}</div>
              <div v-if="settingsStore.documentsEnabled" class="text-xs text-slate-500">
                <span class="text-slate-400">ID Proof:</span> {{ currentOwner.documentProof || currentOwner.panNumber || '—' }}
                <div v-if="currentOwner.documents?.length" class="mt-2 flex flex-wrap gap-2">
                  <a v-for="doc in currentOwner.documents" :key="doc.fileId" :href="filesAPI.downloadUrl(doc.fileId)" target="_blank" class="flex items-center gap-1.5 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] text-slate-600 transition-colors">
                    <FileText class="w-3 h-3" /> {{ doc.fileName }}
                  </a>
                </div>
              </div>
              <div class="col-span-2 text-xs text-slate-500"><span class="text-slate-400">Address:</span> {{ currentOwner.address || '—' }}</div>
            </div>
          </div>
          <div v-else class="text-sm text-slate-400 py-4 text-center">No owner assigned yet.</div>
        </div>

        <!-- Current Residents Card -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-extrabold text-slate-800 flex items-center gap-2"><Home class="w-4 h-4 text-indigo-500" /> Current Residents</h2>
            <button @click="showTenantForm = true" class="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">Add Resident</button>
          </div>
          <div v-if="activeResidents.length > 0" class="space-y-4">
            <div v-for="res in activeResidents" :key="res.id" class="border-b border-slate-50 pb-4 last:border-0 last:pb-0">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <User class="w-5 h-5 text-indigo-600" />
                </div>
                <div class="flex-1">
                  <p class="font-bold text-slate-800 text-sm flex items-center justify-between">
                    {{ res.name }}
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{{ res.type }}</span>
                  </p>
                  <p class="text-xs text-slate-500">{{ res.email }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 pt-2">
                <div class="text-xs text-slate-500"><span class="text-slate-400">Phone:</span> {{ res.phone || '—' }}</div>
                <div class="text-xs text-slate-500"><span class="text-slate-400">Move In:</span> {{ res.joinDate }}</div>
                <div v-if="settingsStore.parkingEnabled && (res.vehicleNo || res.parkingSpot)" class="col-span-2 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-2 py-1.5 rounded-lg w-fit mt-1">
                  <span class="text-slate-400 font-medium">Vehicle:</span> {{ res.vehicleNo || '—' }}
                  <span class="ml-1 px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]">{{ res.parkingSpot || 'No Spot' }}</span>
                </div>
                <div v-if="settingsStore.documentsEnabled" class="col-span-2 text-[10px] text-slate-400">
                  ID Verified: {{ res.documentProof || 'No document on file' }}
                  <div v-if="res.documents?.length" class="mt-2 flex flex-wrap gap-2">
                    <a v-for="doc in res.documents" :key="doc.fileId" :href="filesAPI.downloadUrl(doc.fileId)" target="_blank" class="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded text-[10px] text-indigo-600 transition-colors border border-indigo-100">
                      <FileText class="w-3 h-3" /> {{ doc.fileName }}
                    </a>
                  </div>
                </div>
              </div>
              <button @click="moveOutTenant(res)" class="mt-3 w-full py-2 rounded-lg text-rose-500 bg-rose-50 font-bold text-[11px] uppercase tracking-wide hover:bg-rose-100 transition-colors">
                Mark Moved Out
              </button>
            </div>
          </div>
          <div v-else class="text-sm text-slate-400 py-4 text-center">Flat has no active residents.</div>
        </div>

        <!-- Flat Maintenance Amount -->
        <div v-if="settingsStore.invoicingEnabled" class="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-5 text-white">
          <p class="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Monthly Maintenance</p>
          <p class="text-4xl font-black">₹{{ maintenanceAmount }}</p>
          <p class="text-xs opacity-70 mt-1">{{ flat?.sqft }} sq.ft × ₹{{ flat?.maintenanceRate }}/sqft</p>
        </div>
      </div>

      <!-- Right Column: History -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col h-fit max-h-[600px]">
        <h2 class="font-extrabold text-slate-800 flex items-center gap-2 mb-4"><ClipboardList class="w-4 h-4 text-slate-500" /> Flat History</h2>
        <div v-if="historyLoading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-14 bg-slate-50 rounded-xl animate-pulse"></div>
        </div>
        <div v-else-if="history.length === 0" class="text-sm text-slate-400 py-8 text-center">No history yet.</div>
        <div v-else class="space-y-3 overflow-y-auto flex-1 pr-1">
          <div v-for="h in history" :key="h.ROWID" class="flex gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
            <div :class="['w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0', h.entityType === 'owner' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600']">
              <Crown v-if="h.entityType === 'owner'" class="w-3.5 h-3.5" />
              <User v-else class="w-3.5 h-3.5" />
            </div>
            <div>
              <p class="text-xs font-bold text-slate-800">{{ h.entityName }}</p>
              <p class="text-[10px] text-slate-500 capitalize">{{ h.eventType?.replace('_', ' ') }} · {{ h.eventDate }}</p>
              <p v-if="h.notes" class="text-[10px] text-slate-400 italic mt-0.5">{{ h.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Owner Form Modal -->
    <Teleport to="body">
      <div v-if="showOwnerForm" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-extrabold text-slate-800">{{ currentOwner ? 'Edit Owner' : 'Assign Owner' }}</h2>
            <button @click="showOwnerForm = false"><X class="w-5 h-5 text-slate-400" /></button>
          </div>
          <div class="space-y-3">
            <div><label class="label">Owner Name *</label><input v-model="ownerForm.name" class="input" /></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="label">Email</label><input v-model="ownerForm.email" class="input" /></div>
              <div><label class="label">Phone</label><input v-model="ownerForm.phone" class="input" /></div>
            </div>
            <div v-if="settingsStore.documentsEnabled">
              <label class="label">PAN Number / ID Proof</label>
              <input v-model="ownerForm.documentProof" class="input" />
              <div class="mt-2">
                <label class="label text-[10px]">Attached Documents</label>
                <MultiFileUpload v-model="ownerForm.documents" />
              </div>
            </div>
            <div><label class="label">Permanent Address</label><textarea v-model="ownerForm.address" class="input h-16 resize-none"></textarea></div>
          </div>
          <div class="flex justify-end gap-3">
            <button @click="showOwnerForm = false" class="btn-secondary text-sm">Cancel</button>
            <button @click="submitOwner" :disabled="ownerSubmitting" class="btn-primary text-sm">
              {{ ownerSubmitting ? 'Saving...' : (currentOwner ? 'Update' : 'Assign Owner') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Tenant Form Modal -->
    <Teleport to="body">
      <div v-if="showTenantForm" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-extrabold text-slate-800">Add Tenant</h2>
            <button @click="showTenantForm = false"><X class="w-5 h-5 text-slate-400" /></button>
          </div>
          <div class="space-y-3">
            <div><label class="label">Tenant Name *</label><input v-model="tenantForm.name" class="input" /></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="label">Email</label><input v-model="tenantForm.email" class="input" /></div>
              <div><label class="label">Phone</label><input v-model="tenantForm.phone" class="input" /></div>
            </div>
            <div v-if="settingsStore.documentsEnabled">
              <label class="label">ID Proof (Aadhar/PAN)</label>
              <input v-model="tenantForm.documentProof" class="input" />
              <div class="mt-2">
                <label class="label text-[10px]">Attached Documents</label>
                <MultiFileUpload v-model="tenantForm.documents" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="label">Move-In Date *</label><input v-model="tenantForm.joinDate" type="date" class="input" /></div>
              <div>
                <label class="label">Resident Type</label>
                <select v-model="tenantForm.type" class="input">
                  <option value="Tenant">Tenant</option>
                  <option value="Family Member">Family Member</option>
                  <option value="Owner">Owner</option>
                </select>
              </div>
            </div>
          </div>
          <div v-if="tenantError" class="text-sm text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{{ tenantError }}</div>
          <div class="flex justify-end gap-3">
            <button @click="showTenantForm = false" class="btn-secondary text-sm">Cancel</button>
            <button @click="submitTenant" :disabled="tenantSubmitting" class="btn-primary text-sm">
              {{ tenantSubmitting ? 'Adding...' : 'Add Tenant' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Crown, User, Home, ClipboardList, X, Key, FileText } from 'lucide-vue-next'
import { useFlatsStore } from '../../stores/flatsStore'
import { useResidentsStore } from '../../stores/residentsStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { flatOwnersAPI, flatHistoryAPI, filesAPI } from '../../services/api'
import MultiFileUpload from '../../components/MultiFileUpload.vue'

const route = useRoute()
const flatsStore = useFlatsStore()
const residentsStore = useResidentsStore()
const settingsStore = useSettingsStore()

const flatId = computed(() => route.params.id)
const flat = computed(() => flatsStore.items.find(f => f.ROWID === flatId.value) || flatsStore.items[0])
const maintenanceAmount = computed(() => ((parseFloat(flat.value?.sqft) || 0) * (parseFloat(flat.value?.maintenanceRate) || 0)).toFixed(2))

const currentOwner = ref(null)
const history = ref([])
const historyLoading = ref(false)

const showOwnerForm = ref(false)
const ownerForm = ref({ name: '', email: '', phone: '', documentProof: '', address: '', documents: [] })
const ownerSubmitting = ref(false)

const showTenantForm = ref(false)
const tenantForm = ref({ name: '', email: '', phone: '', joinDate: '', type: 'Tenant', documentProof: '', documents: [] })
const tenantSubmitting = ref(false)
const tenantError = ref('')

const activeResidents = computed(() => residentsStore.items.filter(t => t.apartment === flat.value?.flatNumber && t.status === 'active'))

onMounted(async () => {
  if (!flatsStore.items.length) await flatsStore.fetchAll()
  await residentsStore.fetchAll()
  await loadOwner()
  await loadHistory()
})

async function loadOwner() {
  try {
    const res = await flatOwnersAPI.list({ flatId: flatId.value })
    const raw = res.data?.data || res.data || []
    const owners = Array.isArray(raw) ? raw.map(r => r.FlatOwners || r) : []
    currentOwner.value = owners.find(o => o.status === 'active') || owners[0] || null
    if (currentOwner.value) {
      let docs = []
      try { docs = JSON.parse(currentOwner.value.description || '[]') } catch { docs = [] }
      currentOwner.value.documents = docs
      ownerForm.value = { 
        name: currentOwner.value.name, 
        email: currentOwner.value.email || '', 
        phone: currentOwner.value.phone || '', 
        documentProof: currentOwner.value.documentProof || currentOwner.value.panNumber || '', 
        address: currentOwner.value.address || '',
        documents: docs
      }
    }
  } catch {}
}

async function loadHistory() {
  historyLoading.value = true
  try {
    const res = await flatHistoryAPI.list({ flatId: flatId.value })
    const raw = res.data?.data || res.data || []
    history.value = Array.isArray(raw) ? raw.map(r => r.FlatHistory || r) : []
  } catch {}
  historyLoading.value = false
}

async function submitOwner() {
  ownerSubmitting.value = true
  try {
    if (currentOwner.value) {
      await flatOwnersAPI.update(currentOwner.value.ROWID, { ...ownerForm.value, description: JSON.stringify(ownerForm.value.documents) })
    } else {
      await flatOwnersAPI.create({ ...ownerForm.value, flatId: flatId.value, description: JSON.stringify(ownerForm.value.documents) })
      await flatHistoryAPI.create({ flatId: flatId.value, entityType: 'owner', entityName: ownerForm.value.name, eventType: 'ownership_transfer', eventDate: new Date().toISOString().split('T')[0] })
    }
    await loadOwner()
    showOwnerForm.value = false
  } catch (err) { console.error(err) }
  ownerSubmitting.value = false
}

async function submitTenant() {
  tenantError.value = ''
  if (!tenantForm.value.name || !tenantForm.value.joinDate) {
    tenantError.value = 'Name and move-in date are required.'
    return
  }
  tenantSubmitting.value = true
  const res = await residentsStore.create({ ...tenantForm.value, apartment: flat.value?.flatNumber, status: 'active', dues: 0 })
  if (res.success) {
    await flatHistoryAPI.create({ flatId: flatId.value, entityType: 'resident', entityName: tenantForm.value.name, eventType: 'move_in', eventDate: tenantForm.value.joinDate })
    await loadHistory()
    showTenantForm.value = false
    tenantForm.value = { name: '', email: '', phone: '', joinDate: '', type: 'Tenant', documentProof: '' }
  } else {
    tenantError.value = res.error || 'Failed to add tenant.'
  }
  tenantSubmitting.value = false
}

async function moveOutTenant(resident) {
  if (!confirm(`Mark ${resident.name} as moved out?`)) return
  const today = new Date().toISOString().split('T')[0]
  await residentsStore.update({ id: resident.id, status: 'inactive' })
  await flatHistoryAPI.create({ flatId: flatId.value, entityType: 'resident', entityName: resident.name, eventType: 'move_out', eventDate: today })
  await loadHistory()
}

async function saveFlatBasics() {
  await flatsStore.update(flatId.value, { parkingSpots: flat.value.parkingSpots })
  alert('Unit configuration updated.')
}

function statusClass(s) {
  return { vacant: 'bg-slate-100 text-slate-600', owner_occupied: 'bg-emerald-100 text-emerald-700', rented: 'bg-indigo-100 text-indigo-700' }[s] || 'bg-slate-100 text-slate-500'
}
</script>
