<template>
  <div class="flex h-screen overflow-hidden" style="background: var(--bg-base);">
    <!-- Mobile Overlay -->
    <div v-if="mobileOpen" @click="mobileOpen = false" class="fixed inset-0 bg-[#0f172a]/40 z-40 md:hidden backdrop-blur-sm transition-opacity"></div>
    
    <!-- Sidebar Container -->
    <div :class="[
      'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 outline-none',
      mobileOpen ? 'translate-x-0' : '-translate-x-full'
    ]">
      <AppSidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    </div>
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <AppHeader @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed" @toggle-mobile="mobileOpen = !mobileOpen" />
      <main class="flex-1 overflow-y-auto pb-nav md:pb-6"><RouterView /></main>
    </div>
    <AppBottomNav />
  </div>
</template>
<script setup>
import { ref } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'
import AppHeader from '../components/AppHeader.vue'
import AppBottomNav from '../components/AppBottomNav.vue'
const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)
</script>
