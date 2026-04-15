<template>
  <div class="p-4 space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">My Flat Residents</h1>
        <p class="text-xs text-slate-500 mt-0.5">Manage tenants and family members for your flat</p>
      </div>
      <button @click="showForm = true" class="btn-primary text-sm flex items-center gap-2">
        <Plus class="w-4 h-4" /> Add Resident
      </button>
    </div>

    <!-- Active Residents -->
    <div v-if="activeResidents.length > 0" class="space-y-4">
      <div v-for="res in activeResidents" :key="res.id" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-extrabold text-slate-800 flex items-center gap-2"><User class="w-4 h-4 text-emerald-500" /> {{ res.type }}</h2>
          <span class="text-[10px] bg-emerald-100 text-emerald-700 font-bold uppercase px-2.5 py-1 rounded-lg">{{ res.status }}</span>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><p class="text-[10px] text-slate-400 font-bold uppercase">Name</p><p class="text-sm font-bold text-slate-800 mt-0.5">{{ res.name }}</p></div>
          <div><p class="text-[10px] text-slate-400 font-bold uppercase">Email</p><p class="text-sm text-slate-600 mt-0.5">{{ res.email || '—' }}</p></div>
          <div><p class="text-[10px] text-slate-400 font-bold uppercase">Phone</p><p class="text-sm text-slate-600 mt-0.5">{{ res.phone || '—' }}</p></div>
          <div><p class="text-[10px] text-slate-400 font-bold uppercase">Move-in Date</p><p class="text-sm text-slate-600 mt-0.5">{{ res.joinDate }}</p></div>
        </div>
        <button v-if="res.type === 'Tenant'" @click="confirmMoveOut(res)" class="mt-4 w-full py-2.5 rounded-xl text-rose-600 bg-rose-50 font-bold text-sm hover:bg-rose-100 transition-colors flex items-center justify-center gap-2">
          <LogOut class="w-4 h-4" /> Mark as Moved Out
        </button>
      </div>
    </div>
    <div v-else class="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center text-amber-700 text-sm font-medium">
      No active residents found for this flat. Click "Add Resident" to add one.
    </div>

    <!-- Past Tenants -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div class="p-4 border-b border-slate-50">
        <h2 class="font-extrabold text-slate-800 flex items-center gap-2"><History class="w-4 h-4 text-slate-400" /> Past Tenants</h2>
      </div>
      <div v-if="pastTenants.length === 0" class="p-8 text-center text-slate-400 text-sm">No past tenants.</div>
      <div v-else class="divide-y divide-slate-50">
        <div v-for="t in pastTenants" :key="t.ROWID" class="p-4 flex items-center gap-4">
          <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <User class="w-5 h-5 text-slate-400" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold text-slate-700">{{ t.name }}</p>
            <p class="text-xs text-slate-500">{{ t.joinDate }}</p>
          </div>
          <span class="text-[10px] bg-slate-100 text-slate-500 font-bold uppercase px-2 py-1 rounded-md">Moved Out</span>
        </div>
      </div>
    </div>

    <!-- Add Tenant Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-extrabold text-slate-800">Add New Tenant</h2>
            <button @click="showForm = false"><X class="w-5 h-5 text-slate-400" /></button>
          </div>
          <div class="space-y-3">
            <div><label class="label">Tenant Name *</label><input v-model="form.name" class="input" /></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="label">Email</label><input v-model="form.email" class="input" /></div>
              <div><label class="label">Phone</label><input v-model="form.phone" class="input" /></div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">ID Proof (Aadhar/PAN) *</label>
                <input v-model="form.documentProof" class="input" placeholder="Document Number" />
              </div>
              <div>
                <label class="label">Move-In Date *</label>
                <input v-model="form.joinDate" type="date" class="input" />
              </div>
            </div>
            <div>
              <label class="label">Attached Documents</label>
              <MultiFileUpload v-model="form.documents" />
            </div>
            <div>
              <label class="label">Resident Type</label>
              <select v-model="form.type" class="input">
                <option value="Tenant">Tenant</option>
                <option value="Owner">Owner</option>
                <option value="Family Member">Family Member</option>
              </select>
            </div>
          </div>
          <div v-if="formError" class="text-sm text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{{ formError }}</div>
          <div class="flex justify-end gap-3">
            <button @click="showForm = false" class="btn-secondary text-sm">Cancel</button>
            <button @click="submitForm" :disabled="submitting" class="btn-primary text-sm">{{ submitting ? 'Adding...' : 'Add Resident' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, User, LogOut, History, X } from 'lucide-vue-next'
import { useResidentsStore } from '../../stores/residentsStore'
import { useFlatsStore } from '../../stores/flatsStore'
import { flatHistoryAPI } from '../../services/api'
import MultiFileUpload from '../../components/MultiFileUpload.vue'

const residentsStore = useResidentsStore()
const flatsStore = useFlatsStore()

const showForm = ref(false)
const form = ref({ name: '', email: '', phone: '', joinDate: '', type: 'Tenant', documentProof: '', documents: [] })
const formError = ref('')
const submitting = ref(false)

const myFlat = computed(() => flatsStore.items[0])
const activeResidents = computed(() => residentsStore.items.filter(r => r.apartment === myFlat.value?.flatNumber && r.status === 'active'))
const pastTenants = computed(() => residentsStore.items.filter(r => r.apartment === myFlat.value?.flatNumber && r.status === 'inactive'))

onMounted(async () => {
  await flatsStore.fetchAll()
  if (myFlat.value) await residentsStore.fetchAll()
})

async function submitForm() {
  formError.value = ''
  if (!form.value.name || !form.value.joinDate || !form.value.documentProof) {
    formError.value = 'Name, move-in date, and ID proof are required.'
    return
  }
  submitting.value = true
  const res = await residentsStore.create({ ...form.value, apartment: myFlat.value.flatNumber, status: 'active', dues: 0 })
  if (res.success) {
    await flatHistoryAPI.create({ flatId: myFlat.value.ROWID, entityType: 'resident', entityName: form.value.name, eventType: 'move_in', eventDate: form.value.joinDate })
    showForm.value = false
    form.value = { name: '', email: '', phone: '', joinDate: '', type: 'Tenant', documentProof: '', documents: [] }
  } else formError.value = res.error || 'Failed to add resident.'
  submitting.value = false
}

async function confirmMoveOut(tenant) {
  if (!confirm(`Mark ${tenant.name} as moved out?`)) return
  const today = new Date().toISOString().split('T')[0]
  await residentsStore.update({ id: tenant.id, status: 'inactive' })
  await flatHistoryAPI.create({ flatId: myFlat.value.ROWID, entityType: 'resident', entityName: tenant.name, eventType: 'move_out', eventDate: today })
}
</script>
