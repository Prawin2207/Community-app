<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Financial Reports</h1>
      <p class="text-sm text-slate-500 mt-1">Yearly and monthly financial summaries</p>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 class="font-semibold text-slate-700 mb-4">Monthly Collection Trend</h2>
        <div class="space-y-3">
          <div v-for="m in months" :key="m.label" class="flex items-center gap-3">
            <span class="text-xs text-slate-500 w-8">{{ m.label }}</span>
            <div class="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-teal-500 rounded-full" :style="{ width: m.pct + '%' }"></div>
            </div>
            <span class="text-xs font-semibold text-slate-700 w-20 text-right">₹{{ m.amount }}</span>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 class="font-semibold text-slate-700 mb-4">Expense Breakdown</h2>
        <div class="space-y-3">
          <div v-for="ex in expenses" :key="ex.label">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-slate-600">{{ ex.label }}</span>
              <span class="font-semibold text-slate-800">₹{{ ex.amount.toLocaleString() }}</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full">
              <div class="h-full rounded-full" :class="ex.color" :style="{ width: ex.pct + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const months = [
  { label: 'Aug', pct: 82, amount: '1.85L' },
  { label: 'Sep', pct: 90, amount: '2.00L' },
  { label: 'Oct', pct: 86, amount: '1.92L' },
  { label: 'Nov', pct: 78, amount: '1.78L' },
  { label: 'Dec', pct: 94, amount: '2.10L' },
  { label: 'Jan', pct: 88, amount: '1.98L' },
]
const expenses = [
  { label: 'Maintenance & Repairs', amount: 85000, pct: 68, color: 'bg-teal-500' },
  { label: 'Staff Salary', amount: 120000, pct: 80, color: 'bg-indigo-500' },
  { label: 'Utilities', amount: 42000, pct: 50, color: 'bg-violet-500' },
  { label: 'Security Services', amount: 36000, pct: 40, color: 'bg-rose-500' },
]
</script>
