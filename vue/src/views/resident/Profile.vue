<template>
  <div class="p-6 space-y-6">
    <h1 class="page-title">My Profile</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Card -->
      <div class="card text-center self-start">
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-primary-200">
          {{ auth.currentUser?.name?.split(' ').map(n=>n[0]).join('') }}
        </div>
        <h2 class="text-lg font-bold text-slate-800">{{ auth.currentUser?.name }}</h2>
        <p class="text-sm text-slate-500 mt-0.5">{{ auth.currentUser?.apartment }}</p>
        <RoleBadge :role="auth.role" class="mt-2 mx-auto inline-flex" />
        <div class="mt-4 pt-4 border-t border-slate-100 space-y-2 text-left">
          <div class="flex items-center gap-2 text-sm text-slate-600">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {{ auth.currentUser?.phone }}
          </div>
          <div class="flex items-center gap-2 text-sm text-slate-600">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {{ auth.currentUser?.email }}
          </div>
        </div>
      </div>

      <!-- Edit Profile -->
      <div class="lg:col-span-2 card">
        <h3 class="section-title">Edit Profile</h3>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">First Name</label>
              <input class="input" :value="auth.currentUser?.name?.split(' ')[0]" />
            </div>
            <div>
              <label class="label">Last Name</label>
              <input class="input" :value="auth.currentUser?.name?.split(' ')[1]" />
            </div>
          </div>
          <div>
            <label class="label">Email</label>
            <input class="input" type="email" :value="auth.currentUser?.email" />
          </div>
          <div>
            <label class="label">Phone</label>
            <input class="input" type="tel" :value="auth.currentUser?.phone" />
          </div>
          <div>
            <label class="label">Emergency Contact</label>
            <input class="input" placeholder="+91 XXXXX XXXXX" />
          </div>
          <button class="btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/authStore'
import RoleBadge from '../../components/RoleBadge.vue'
const auth = useAuthStore()
</script>
