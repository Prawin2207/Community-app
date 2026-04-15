<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-md" @click="$emit('update:modelValue', false)" />

        <!-- Modal -->
        <div :class="['modal-theme relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]', sizeClasses]">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-800">{{ title }}</h3>
            <button
              @click="$emit('update:modelValue', false)"
              class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="border-t border-slate-100 px-6 py-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'Dialog' },
  size: { type: String, default: 'md' }, // sm, md, lg, xl
})
defineEmits(['update:modelValue'])

const sizeClasses = computed(() => ({
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-lg',
  lg: 'w-full max-w-2xl',
  xl: 'w-full max-w-4xl',
})[props.size] || 'w-full max-w-lg')
</script>
