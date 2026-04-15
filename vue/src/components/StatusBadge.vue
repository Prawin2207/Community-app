<template>
  <span class="badge" :style="currentStyle">
    <span v-if="showDot" class="w-1.5 h-1.5 rounded-full mr-1.5" :style="{ background: dotColor }"></span>
    {{ displayLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
  label: { type: String, default: null },
})

const STYLES = {
  active:      { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.35)',  text: '#34d399', dot: '#34d399' },
  inactive:    { bg: 'var(--bg-glass-hover)', border: 'var(--border-glass)', text: 'var(--text-muted)', dot: 'var(--text-muted)' },
  pending:     { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.35)',  text: '#fbbf24', dot: '#fbbf24' },
  paid:        { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.35)',  text: '#34d399', dot: '#34d399' },
  overdue:     { bg: 'rgba(251,113,133,0.15)', border: 'rgba(251,113,133,0.35)', text: '#fb7185', dot: '#fb7185' },
  open:        { bg: 'rgba(251,113,133,0.15)', border: 'rgba(251,113,133,0.35)', text: '#fb7185', dot: '#fb7185' },
  in_progress: { bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.35)',  text: '#60a5fa', dot: '#60a5fa' },
  resolved:    { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.35)',  text: '#34d399', dot: '#34d399' },
  approved:    { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.35)',  text: '#34d399', dot: '#34d399' },
  rejected:    { bg: 'rgba(251,113,133,0.15)', border: 'rgba(251,113,133,0.35)', text: '#fb7185', dot: '#fb7185' },
  inside:      { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.35)',  text: '#34d399', dot: '#34d399' },
  outside:     { bg: 'var(--bg-glass)', border: 'var(--border-glass)', text: 'var(--text-muted)', dot: 'var(--text-muted)' },
  waiting:     { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.35)',  text: '#fbbf24', dot: '#fbbf24' },
  exited:      { bg: 'var(--bg-glass-hover)', border: 'var(--border-glass)', text: 'var(--text-muted)', dot: 'var(--text-muted)' },
  available:   { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.35)',  text: '#34d399', dot: '#34d399' },
  booked:      { bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.35)',  text: '#60a5fa', dot: '#60a5fa' },
  maintenance: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.35)',  text: '#fbbf24', dot: '#fbbf24' },
  completed:   { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.35)',  text: '#34d399', dot: '#34d399' },
  critical:    { bg: 'rgba(239,68,68,0.2)',   border: 'rgba(239,68,68,0.4)',    text: '#f87171', dot: '#f87171' },
  high:        { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.35)',  text: '#fb923c', dot: '#fb923c' },
  medium:      { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.35)',  text: '#fbbf24', dot: '#fbbf24' },
  low:         { bg: 'var(--bg-glass-hover)', border: 'var(--border-glass)', text: 'var(--text-muted)', dot: 'var(--text-muted)' },
}

const s = computed(() => STYLES[props.status] || STYLES.inactive)
const currentStyle = computed(() => ({
  background: s.value.bg,
  border: `1px solid ${s.value.border}`,
  color: s.value.text,
  borderRadius: '99px',
  padding: '2px 10px',
  fontSize: '11px',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
}))
const dotColor = computed(() => s.value.dot)
const showDot = computed(() => ['active','inside','available','paid','resolved','approved','completed'].includes(props.status))
const displayLabel = computed(() => props.label || (props.status || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
</script>
