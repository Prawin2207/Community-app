import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    // Persist theme across sessions
    const saved = localStorage.getItem('theme')
    const isDark = ref(saved ? saved === 'dark' : true) // default: dark

    function toggle() {
        isDark.value = !isDark.value
    }

    // Apply theme attribute to <html> whenever it changes
    function applyTheme() {
        document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
        localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }

    watch(isDark, applyTheme, { immediate: true })

    return { isDark, toggle }
})
