<template>
  <div class="relative rounded-2xl p-4 border transition-all duration-300 group overflow-hidden"
    :class="`stat-card-${color}`"
    style="backdrop-filter: blur(12px);">
    <!-- Subtle background glow -->
    <div class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      :style="{ background: `radial-gradient(circle at 20% 50%, ${glowColor}15, transparent 70%)` }"></div>

    <div class="relative flex items-center justify-between gap-3">
      <div class="flex-1 min-w-0">
        <p class="text-[10px] font-bold uppercase tracking-widest mb-1 text-[var(--text-muted)] truncate">{{ label }}</p>
        <p class="text-2xl font-black tracking-tight text-[var(--text-primary)] leading-none">{{ value }}</p>
        <p v-if="subtitle" class="text-[10px] mt-1 text-[var(--text-muted)] truncate">{{ subtitle }}</p>
      </div>
      <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        :style="{ background: `${glowColor}15`, border: `1px solid ${glowColor}33` }">
        <component :is="icon" class="w-4 h-4" :style="{ color: glowColor }" />
      </div>
    </div>

    <div v-if="trend !== undefined" class="relative mt-3 flex items-center gap-2">
      <span class="text-xs font-bold" :style="{ color: trend >= 0 ? '#34d399' : '#fb7185' }">
        {{ trend >= 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
      </span>
      <span class="text-xs text-[var(--text-muted)]">{{ trendLabel || 'vs last month' }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  subtitle: { type: String, default: null },
  icon: { type: Object, required: true },
  color: { type: String, default: 'indigo' },
  trend: { type: Number, default: undefined },
  trendLabel: { type: String, default: null },
})

const GLOW_COLORS = {
  indigo: '#818cf8', emerald: '#34d399', amber: '#fbbf24', rose: '#fb7185',
  violet: '#c084fc', teal: '#2dd4bf', cyan: '#22d3ee', orange: '#fb923c',
}
const glowColor = props.color in GLOW_COLORS ? GLOW_COLORS[props.color] : '#818cf8'
</script>
