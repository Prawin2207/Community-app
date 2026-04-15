<template>
  <div class="p-4 space-y-6 min-h-screen bg-slate-50/50">
    <!-- Header Section with soft glow -->
    <div class="relative">
      <div class="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
      <div class="relative flex justify-between items-end">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Delivery Hub</h1>
          <p class="text-xs text-slate-500 font-medium mt-0.5">Live gate activity oversight</p>
        </div>
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-100">
          <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span class="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Live System</span>
        </div>
      </div>
    </div>

    <!-- Stats Cards with Premium Glassmorphism -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="s in dashboardStats" :key="s.label" 
        class="group relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        <div class="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
        <div class="relative flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50" :class="s.iconBg">
            <component :is="s.icon" class="w-5 h-5" :class="s.iconColor" />
          </div>
          <div>
            <div class="flex items-baseline gap-1">
              <p class="text-2xl font-black text-slate-900">{{ s.value }}</p>
              <div v-if="s.trend" class="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 ml-1">
                <ArrowUpRight class="w-2.5 h-2.5" /> {{ s.trend }}%
              </div>
            </div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ s.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity & Quick Log Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- Recent activity feed -->
      <div class="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-[400px]">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-extrabold text-slate-800 tracking-tight">Recent Activity</h2>
          <button class="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors">View All</button>
        </div>
        
        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
          <div v-if="deliveryStore.loading" class="space-y-3">
            <div v-for="i in 4" :key="i" class="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
          </div>
          <div v-else-if="recentActivity.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 pb-10">
            <Package class="w-10 h-10 mb-2 opacity-20" />
            <p class="text-xs font-medium">No activity logged yet</p>
          </div>
          <div v-else v-for="entry in recentActivity" :key="entry.ROWID" 
            class="group flex items-center gap-3 p-3 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-all cursor-default">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" :class="typeBg(entry.type)">
              <Package class="w-5 h-5" :class="typeColor(entry.type)" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-slate-800 truncate">{{ entry.Deliveriessupplier }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded-md">{{ entry.apartment }}</span>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{{ new Date(entry.CREATEDTIME).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
              </div>
            </div>
            <div class="flex-shrink-0">
              <span class="text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest" :class="statusClass(entry.status)">
                {{ entry.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Delivery Log Card -->
      <div class="lg:col-span-2 relative overflow-hidden bg-indigo-600 rounded-2xl p-6 shadow-lg shadow-indigo-100 text-white flex flex-col justify-between h-[400px]">
        <div class="absolute -bottom-20 -right-20 w-48 h-48 bg-white/10 blur-3xl rounded-full"></div>
        <div class="relative">
          <div class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
            <Zap class="w-5 h-5 text-white" />
          </div>
          <h2 class="text-xl font-black leading-tight mb-2">Log New Entry</h2>
          <p class="text-indigo-100 text-xs font-medium mb-6 opacity-80 leading-relaxed">Quick entry for incoming packages, food, and groceries at the main gate.</p>
        </div>
        <div class="relative">
          <router-link to="/delivery/active" 
            class="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-black text-xs shadow-md hover:bg-slate-50 transition-all group">
            Open Registry
            <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Package, PackageCheck, Truck, ArrowUpRight, ArrowRight, Zap } from 'lucide-vue-next'
import { useDeliveryStore } from '../../stores/deliveryStore'

const deliveryStore = useDeliveryStore()

onMounted(() => {
  deliveryStore.fetchAll()
})

const dashboardStats = computed(() => {
  const active = deliveryStore.items.filter(d => d.status !== 'delivered').length
  const deliveredToday = deliveryStore.items.filter(d => {
    const isDelivered = d.status === 'delivered'
    const isToday = new Date(d.CREATEDTIME).toDateString() === new Date().toDateString()
    return isDelivered && isToday
  }).length
  
  return [
    { label: 'Active Deliveries', value: active, icon: Package, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
    { label: 'Delivered Today', value: deliveredToday, icon: PackageCheck, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { label: 'Total Logs', value: deliveryStore.items.length, icon: Truck, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  ]
})

const recentActivity = computed(() => {
  return deliveryStore.items.slice(0, 5)
})

function typeBg(t) {
  const type = (t || '').toLowerCase()
  if (type.includes('food')) return 'bg-orange-100'
  if (type.includes('package')) return 'bg-indigo-100'
  return 'bg-violet-100'
}

function typeColor(t) {
  const type = (t || '').toLowerCase()
  if (type.includes('food')) return 'text-orange-600'
  if (type.includes('package')) return 'text-indigo-600'
  return 'text-violet-600'
}

function statusClass(s) {
  return {
    'awaiting_pickup': 'bg-amber-100 text-amber-700',
    'in_lobby': 'bg-indigo-100 text-indigo-700',
    'notified': 'bg-cyan-100 text-cyan-700',
    'delivered': 'bg-emerald-100 text-emerald-700',
  }[s] || 'bg-slate-100 text-slate-600'
}
</script>
