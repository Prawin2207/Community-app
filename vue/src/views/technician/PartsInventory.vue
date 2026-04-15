<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Parts Inventory</h1>
        <p class="text-sm text-slate-500 mt-1">Track spare parts and supplies in stock</p>
      </div>
      <button @click="showAddModal = true" class="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors">
        <Plus class="w-4 h-4" /> Add Part
      </button>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div v-if="opsStore.loading" class="p-10 text-center animate-pulse text-slate-400">Syncing inventory...</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Part Name</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
            <th class="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Qty in Stock</th>
            <th class="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Min Required</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="part in opsStore.inventory" :key="part.ROWID" class="hover:bg-slate-50 transition-colors">
            <td class="px-5 py-3 font-medium text-slate-700">{{ part.name }}</td>
            <td class="px-5 py-3 text-slate-500">{{ part.category }}</td>
            <td class="px-5 py-3 text-right font-semibold" :class="part.quantity <= part.minStock ? 'text-rose-600' : 'text-slate-800'">{{ part.quantity }}</td>
            <td class="px-5 py-3 text-right text-slate-400">{{ part.minStock }}</td>
            <td class="px-5 py-3">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="part.quantity <= part.minStock ? 'bg-rose-100 text-rose-700' : part.quantity <= part.minStock * 2 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">
                {{ part.quantity <= part.minStock ? 'Low Stock' : part.quantity <= part.minStock * 2 ? 'Moderate' : 'Sufficient' }}
              </span>
            </td>
          </tr>
          <tr v-if="opsStore.inventory.length === 0">
            <td colspan="5" class="p-10 text-center text-slate-400">Inventory is empty</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Part Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="showAddModal = false"></div>
      <div class="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <h2 class="text-xl font-bold text-slate-800 mb-6 font-display">Add Inventory Item</h2>
        <div class="space-y-4">
          <div>
            <label class="label text-[10px]">Part Name</label>
            <input v-model="newPart.partName" type="text" class="input" placeholder="LED Bulb (15W)" />
          </div>
          <div>
            <label class="label text-[10px]">Category</label>
            <select v-model="newPart.category" class="input">
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Mechanical</option>
              <option>Carpentry</option>
              <option>Other</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label text-[10px]">Initial Quantity</label>
              <input v-model="newPart.quantity" type="number" class="input" />
            </div>
            <div>
              <label class="label text-[10px]">Min Stock Level</label>
              <input v-model="newPart.minStock" type="number" class="input" />
            </div>
          </div>
          <div class="flex gap-3 mt-2">
            <button @click="showAddModal = false" class="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">
              Cancel
            </button>
            <button @click="addPart" :disabled="isSubmitting" class="flex-[2] py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-all">
              {{ isSubmitting ? 'Adding...' : 'Add to Inventory' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useOpsStore } from '../../stores/opsStore'

const opsStore = useOpsStore()
const showAddModal = ref(false)
const isSubmitting = ref(false)
const newPart = ref({ partName: '', category: 'Electrical', quantity: 0, minStock: 5 })

onMounted(() => opsStore.fetchAllInventory())

async function addPart() {
  if (!newPart.value.partName) return
  isSubmitting.value = true
  try {
    await opsStore.addInventory(newPart.value)
    showAddModal.value = false
    newPart.value = { partName: '', category: 'Electrical', quantity: 0, minStock: 5 }
  } catch (err) {
    alert('Failed to add part: ' + (err.response?.data?.error || err.message))
  } finally {
    isSubmitting.value = false
  }
}
</script>
