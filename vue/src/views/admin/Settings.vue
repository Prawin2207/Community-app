<template>
  <div class="p-6 space-y-6">
    <h1 class="page-title">Settings</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sidebar navigation -->
      <div class="card self-start">
        <nav class="space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['sidebar-link w-full', activeTab === tab.id ? 'sidebar-link-active' : 'sidebar-link-inactive']"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="lg:col-span-2 space-y-4">
        <div class="card" v-if="activeTab === 'general'">
          <h3 class="section-title">Community Information</h3>
          <div class="space-y-4">
            <div>
              <label class="label">Community Name</label>
              <input class="input" value="Prestige Green Valley" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">City</label>
                <input class="input" value="Bengaluru" />
              </div>
              <div>
                <label class="label">Pincode</label>
                <input class="input" value="560001" />
              </div>
            </div>
            <div>
              <label class="label">Address</label>
              <textarea class="input h-20 resize-none">Sarjapur Road, Bengaluru, Karnataka</textarea>
            </div>
            <button class="btn-primary">Save Changes</button>
          </div>

          <div class="mt-8 pt-6 border-t border-slate-100">
            <h3 class="section-title">System Features</h3>
            <div class="space-y-3">
              <div v-for="feat in systemFeatures" :key="feat.key" class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p class="text-sm font-bold text-slate-800">{{ feat.label }}</p>
                  <p class="text-[11px] text-slate-500">{{ feat.desc }}</p>
                </div>
                <button 
                  @click="settingsStore.updateSetting(feat.key, !settingsStore[feat.key])"
                  :class="['w-12 h-6 rounded-full transition-all relative overflow-hidden', settingsStore[feat.key] ? 'bg-emerald-500 shadow-md shadow-emerald-100' : 'bg-slate-200']"
                >
                  <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all', settingsStore[feat.key] ? 'translate-x-7' : 'translate-x-1']" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card" v-if="activeTab === 'dues'">
          <h3 class="section-title">Dues Configuration</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Monthly Maintenance (₹)</label>
                <input class="input" type="number" value="2500" />
              </div>
              <div>
                <label class="label">Parking Fee (₹)</label>
                <input class="input" type="number" value="1000" />
              </div>
            </div>
            <div>
              <label class="label">Due Date</label>
              <select class="input">
                <option>1st of every month</option>
                <option>5th of every month</option>
                <option>10th of every month</option>
              </select>
            </div>
            <button class="btn-primary">Save Configuration</button>
          </div>
        </div>

        <div class="card" v-if="activeTab === 'notifications'">
          <h3 class="section-title">Notification Preferences</h3>
          <div class="space-y-3">
            <label
              v-for="notif in notifications"
              :key="notif.id"
              class="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div>
                <p class="text-sm font-medium text-slate-700">{{ notif.label }}</p>
                <p class="text-xs text-slate-400">{{ notif.desc }}</p>
              </div>
              <div
                @click="notif.enabled = !notif.enabled"
                :class="['w-10 h-5.5 rounded-full transition-colors relative cursor-pointer', notif.enabled ? 'bg-primary-600' : 'bg-slate-200']"
                style="height: 1.375rem;"
              >
                <div :class="['absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', notif.enabled ? 'translate-x-5' : 'translate-x-0.5']" />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Building2, CreditCard, Bell } from 'lucide-vue-next'
import { useSettingsStore } from '../../stores/settingsStore'

const settingsStore = useSettingsStore()
const activeTab = ref('general')

onMounted(() => {
  settingsStore.fetchSettings()
})

const tabs = computed(() => {
  const t = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]
  if (settingsStore.invoicingEnabled) {
    t.splice(1, 0, { id: 'dues', label: 'Dues Config', icon: CreditCard })
  }
  return t
})

const systemFeatures = [
  { key: 'parkingEnabled', label: 'Parking Tracking', desc: 'Track vehicle details and allocated parking spots' },
  { key: 'rulesEnabled', label: 'Rules & Regulations', desc: 'Global community guidelines module' },
  { key: 'complaintsEnabled', label: 'Complaint Management', desc: 'Allow residents to raise and track complaints' },
  { key: 'documentsEnabled', label: 'Document Collection', desc: 'Collect ID proof and documents from residents' },
  { key: 'invoicingEnabled', label: 'Invoicing & Dues', desc: 'Generate maintenance invoices and track payments' },
]

const notifications = ref([
  { id: 1, label: 'Due Reminders', desc: 'Send reminder before due date', enabled: true },
  { id: 2, label: 'Complaint Updates', desc: 'Notify on status change', enabled: true },
  { id: 3, label: 'Visitor Alerts', desc: 'Alert on visitor entry', enabled: false },
])
</script>
