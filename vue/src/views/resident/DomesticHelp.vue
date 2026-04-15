<template>
  <div class="p-4 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-black text-slate-800">Domestic Help</h1>
      <p class="text-sm text-slate-500 mt-1">Manage maids, drivers, cooks, and other daily staff.</p>
    </div>

    <!-- Stats & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex gap-4">
        <div class="bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100 flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <UserCheck class="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Total Registered</p>
            <p class="text-xl font-black text-indigo-900">{{ helps.length }}</p>
          </div>
        </div>
        <div class="bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 flex items-center gap-3">
          <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <LogIn class="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Currently Inside</p>
            <p class="text-xl font-black text-emerald-900">{{ insideCount }}</p>
          </div>
        </div>
      </div>
      <button @click="showRegisterForm = true" class="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow flex items-center gap-2">
        <Plus class="w-5 h-5" /> Add Staff
      </button>
    </div>

    <!-- Active List -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-slate-100">
        <h2 class="font-extrabold text-slate-800">Linked Staff Profiles</h2>
      </div>
      <div v-if="loading" class="p-8 text-center text-slate-400 text-sm font-medium animate-pulse">Loading...</div>
      <div v-else-if="helps.length === 0" class="p-12 text-center">
        <UserCheck class="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <h3 class="font-bold text-slate-500">No staff registered</h3>
        <p class="text-xs text-slate-400 mt-1">Add your daily help to easily monitor their entry and exit.</p>
      </div>
      <div v-else class="divide-y divide-slate-50">
        <div v-for="help in helps" :key="help.ROWID || help.id" class="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
              {{ (help.name || 'S')[0] }}
            </div>
            <div>
              <p class="font-bold text-slate-800">{{ help.name }}</p>
              <div class="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span class="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-semibold">{{ help.type }}</span>
                <span>·</span>
                <span>{{ help.phone || 'No phone' }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Current Status</p>
              <span :class="['px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5', help.status === 'Inside' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600']">
                <span :class="['w-1.5 h-1.5 rounded-full', help.status === 'Inside' ? 'bg-emerald-500' : 'bg-slate-400']"></span>
                {{ help.status || 'Outside' }}
              </span>
            </div>
            <button @click="removeHelp(help.ROWID)" class="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition" title="Remove Staff">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Registration Modal -->
    <div v-if="showRegisterForm" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 class="font-extrabold text-slate-800">Add Domestic Help</h2>
          <button @click="showRegisterForm = false" class="text-slate-400 hover:text-slate-600"><X class="w-5 h-5"/></button>
        </div>
        <form @submit.prevent="submitHelp" class="p-5 space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Full Name</label>
            <input v-model="form.name" type="text" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="e.g. Ramesh Kumar">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Role Type</label>
              <select v-model="form.type" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>Maid</option>
                <option>Cook</option>
                <option>Driver</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Phone</label>
              <input v-model="form.phone" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="10 Digits">
            </div>
          </div>
          <div class="pt-4 flex gap-3">
            <button type="button" @click="showRegisterForm = false" class="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">Cancel</button>
            <button type="submit" class="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Add Support' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { UserCheck, Plus, X, LogIn, Trash2 } from 'lucide-vue-next'
import { useDomesticHelpStore } from '../../stores/domesticHelpStore'
import { useAuthStore } from '../../stores/authStore'

const helpStore = useDomesticHelpStore()
const authStore = useAuthStore()

const loading = computed(() => helpStore.isLoading)
const helps = computed(() => helpStore.items)
const insideCount = computed(() => helps.value.filter(h => h.status === 'Inside').length)

const showRegisterForm = ref(false)
const submitting = ref(false)
const form = ref({ name: '', type: 'Maid', phone: '' })

onMounted(() => {
  // Pass resident flat context to backen
  const residentId = authStore.currentUser?.ROWID || authStore.currentUser?.id
  const flatId = authStore.currentUser?.flatId || residentId // using residentId as fallback flat association context for now
  helpStore.fetchAll({ flatId })
})

async function submitHelp() {
  submitting.value = true
  const flatId = authStore.currentUser?.flatId || (authStore.currentUser?.ROWID || authStore.currentUser?.id)
  
  await helpStore.create({
    name: form.value.name,
    type: form.value.type,
    phone: form.value.phone,
    flatId: flatId,
    status: 'Outside'
  })
  
  submitting.value = false
  showRegisterForm.value = false
  form.value = { name: '', type: 'Maid', phone: '' }
}

async function removeHelp(id) {
  if (confirm("Are you sure you want to remove this staff profile?")) {
    await helpStore.remove(id)
  }
}
</script>
