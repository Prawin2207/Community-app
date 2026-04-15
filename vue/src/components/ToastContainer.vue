<template>
  <Teleport to="body">
    <div class="toast-container" role="region" aria-label="Notifications">
      <TransitionGroup name="toast" tag="div" class="toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          role="alert"
          @click="removeToast(toast.id)"
        >
          <span class="toast__icon">{{ icons[toast.type] || '💬' }}</span>
          <div class="toast__content">
            <p v-if="toast.title" class="toast__title">{{ toast.title }}</p>
            <p v-if="toast.body"  class="toast__body">{{ toast.body }}</p>
          </div>
          <button class="toast__close" aria-label="Dismiss" @click.stop="removeToast(toast.id)">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useNotificationStore } from '../stores/notificationStore'
import { storeToRefs } from 'pinia'

const notifications = useNotificationStore()
const { toasts }    = storeToRefs(notifications)
const { removeToast } = notifications

const icons = {
  success: '✅',
  error:   '🚨',
  warning: '⚠️',
  info:    'ℹ️',
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 280px;
  max-width: 420px;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
  background: #1e2030;
  color: #e2e8f0;
  pointer-events: all;
  cursor: pointer;
  backdrop-filter: blur(8px);
  border-left: 4px solid transparent;
}

.toast--success { border-color: #22c55e; background: #14271e; }
.toast--error   { border-color: #ef4444; background: #2a1414; }
.toast--warning { border-color: #f59e0b; background: #2a2014; }
.toast--info    { border-color: #3b82f6; background: #141e2a; }

.toast__icon {
  font-size: 1.3rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__title {
  font-weight: 600;
  font-size: 0.88rem;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast__body {
  font-size: 0.8rem;
  opacity: 0.75;
  margin: 0;
  line-height: 1.4;
}

.toast__close {
  background: transparent;
  border: none;
  color: inherit;
  opacity: 0.5;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 2px;
  transition: opacity 0.2s;
}
.toast__close:hover { opacity: 1; }

/* Transitions */
.toast-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from  { opacity: 0; transform: translateX(60px) scale(0.9); }
.toast-leave-to    { opacity: 0; transform: translateX(60px) scale(0.95); }
</style>
