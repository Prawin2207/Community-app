<template>
  <ToastContainer />
  <RouterView />
</template>

<script setup>
import { onMounted } from 'vue'
import ToastContainer from './components/ToastContainer.vue'
import { useThemeStore } from './stores/themeStore'
import { useAuthStore } from './stores/authStore'
import { useSettingsStore } from './stores/settingsStore'
import { SyncService } from './services/syncService'

const theme    = useThemeStore()
const auth     = useAuthStore()
const settings = useSettingsStore()

onMounted(() => {
  // Restore demo session from localStorage (no network call)
  auth.restoreSession()
  // Load feature toggles
  settings.fetchSettings()
  // Trigger initial sync processing
  SyncService.processQueue()
})
</script>
