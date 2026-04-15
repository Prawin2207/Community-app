<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="open = !open"
      class="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span v-if="unread > 0" class="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
    </button>
    <Transition name="fade">
      <div v-if="open" class="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50">
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <p class="text-sm font-bold text-slate-800">Notifications</p>
          <span class="badge bg-rose-50 text-rose-700">{{ unread }} new</span>
        </div>
        <div class="max-h-80 overflow-y-auto divide-y divide-slate-50">
          <div
            v-for="n in notifications"
            :key="n.id"
            :class="['px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer', !n.read ? 'bg-primary-50/40' : '']"
          >
            <div class="flex items-start gap-3">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm', n.iconBg]">
                {{ n.icon }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-800 truncate">{{ n.title }}</p>
                <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">{{ n.message }}</p>
                <p class="text-[10px] text-slate-400 mt-1">{{ n.time }}</p>
              </div>
              <div v-if="!n.read" class="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
            </div>
          </div>
        </div>
        <div class="px-4 py-2.5 border-t border-slate-100">
          <button class="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Mark all as read
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const open = ref(false)
const dropdownRef = ref(null)
const unread = ref(3)

const notifications = ref([
  { id: 1, title: 'New Complaint', message: 'Priya Sharma raised a complaint about water leakage in B-204', icon: '🔧', iconBg: 'bg-rose-100', time: '2 min ago', read: false },
  { id: 2, title: 'Payment Received', message: 'Amit Verma paid maintenance dues of ₹2,500', icon: '💰', iconBg: 'bg-emerald-100', time: '1 hr ago', read: false },
  { id: 3, title: 'Booking Request', message: 'Sunita Rao requested Badminton Court for Feb 3', icon: '📅', iconBg: 'bg-blue-100', time: '3 hrs ago', read: false },
  { id: 4, title: 'Visitor Entry', message: 'Vijay Reddy entered the community at 10:30 AM', icon: '👤', iconBg: 'bg-amber-100', time: 'Yesterday', read: true },
  { id: 5, title: 'Notice Published', message: 'Annual General Meeting notice has been published', icon: '📢', iconBg: 'bg-violet-100', time: 'Yesterday', read: true },
])

function handleOutsideClick(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>
