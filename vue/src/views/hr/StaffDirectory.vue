<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Staff Directory</h1>
        <p class="text-sm text-slate-500 mt-1">{{ hrStore.staff.length }} staff members across all departments</p>
      </div>
      <button @click="showAddModal = true" class="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors">
        <UserPlus class="w-4 h-4" /> Add Staff
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div v-if="hrStore.loading" class="p-10 text-center animate-pulse text-slate-400">Loading staff directory...</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Department</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Shift</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Phone</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="s in hrStore.staff" :key="s.ROWID" class="hover:bg-slate-50 transition-colors">
            <td class="px-5 py-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-xs">
                  {{ s.name?.split(' ').map(n=>n[0]).join('') }}
                </div>
                <div>
                  <p class="font-medium text-slate-700">{{ s.name }}</p>
                  <p class="text-xs text-slate-400">{{ s.role }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3 text-slate-600">{{ s.dept }}</td>
            <td class="px-5 py-3 text-slate-500">{{ s.shift }}</td>
            <td class="px-5 py-3">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">{{ s.status }}</span>
            </td>
            <td class="px-5 py-3 text-slate-500 font-mono text-xs">{{ s.phone }}</td>
          </tr>
          <tr v-if="hrStore.staff.length === 0">
            <td colspan="5" class="p-10 text-center text-slate-400">No staff members found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Staff Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="showAddModal = false"></div>
      <div class="relative bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <h2 class="text-xl font-bold text-slate-800 mb-6 font-display">Add Staff Member</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="label text-[10px]">Full Name</label>
            <input v-model="newStaff.name" type="text" class="input" placeholder="Arjun Singh" />
          </div>
          <div>
            <label class="label text-[10px]">Role</label>
            <input v-model="newStaff.role" type="text" class="input" placeholder="Security Guard" />
          </div>
          <div>
            <label class="label text-[10px]">Department</label>
            <select v-model="newStaff.dept" class="input">
              <option>Security</option>
              <option>Maintenance</option>
              <option>Technician</option>
              <option>Housekeeping</option>
              <option>Administration</option>
            </select>
          </div>
          <div>
            <label class="label text-[10px]">Shift</label>
            <input v-model="newStaff.shift" type="text" class="input" placeholder="Morning (8-4)" />
          </div>
          <div>
            <label class="label text-[10px]">Phone Number</label>
            <input v-model="newStaff.phone" type="text" class="input" placeholder="+91..." />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showAddModal = false" class="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">
            Cancel
          </button>
          <button @click="addStaff" :disabled="isSubmitting" class="flex-[2] py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-200 transition-all">
            {{ isSubmitting ? 'Adding...' : 'Add staff' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { UserPlus } from 'lucide-vue-next'
import { useHrStore } from '../../stores/hrStore'

const hrStore = useHrStore()
const showAddModal = ref(false)
const isSubmitting = ref(false)
const newStaff = ref({ name: '', role: '', dept: 'Security', shift: '', phone: '' })

onMounted(() => hrStore.fetchAll())

async function addStaff() {
  if (!newStaff.value.name || !newStaff.value.role) return
  isSubmitting.value = true
  try {
    await hrStore.addStaff(newStaff.value)
    showAddModal.value = false
    newStaff.value = { name: '', role: '', dept: 'Security', shift: '', phone: '' }
  } catch (err) {
    alert('Failed to add staff: ' + (err.response?.data?.error || err.message))
  } finally {
    isSubmitting.value = false
  }
}
</script>
