<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Budget Planning</h1>
      <p class="text-sm text-slate-500 mt-1">FY 2024 — Budget vs Actuals</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
            <th class="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Budgeted</th>
            <th class="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Actual Spent</th>
            <th class="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Variance</th>
            <th class="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-if="budgetItems.length === 0">
            <td colspan="5">
              <div class="py-16 text-center flex flex-col items-center justify-center bg-slate-50/30">
                <p class="text-sm font-medium text-slate-400">No data available</p>
              </div>
            </td>
          </tr>
          <tr v-else v-for="item in budgetItems" :key="item.category" class="hover:bg-slate-50 transition-colors">
            <td class="px-5 py-3 font-medium text-slate-700">{{ item.category }}</td>
            <td class="px-5 py-3 text-right text-slate-600">₹{{ item.budgeted.toLocaleString() }}</td>
            <td class="px-5 py-3 text-right text-slate-800 font-semibold">₹{{ item.actual.toLocaleString() }}</td>
            <td class="px-5 py-3 text-right font-semibold" :class="item.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'">
              {{ item.variance >= 0 ? '+' : '' }}₹{{ item.variance.toLocaleString() }}
            </td>
            <td class="px-5 py-3">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="item.variance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                {{ item.variance >= 0 ? 'Under Budget' : 'Over Budget' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const budgetItems = [
  { category: 'Maintenance & Repairs', budgeted: 100000, actual: 85000, variance: 15000 },
  { category: 'Staff Salary', budgeted: 110000, actual: 120000, variance: -10000 },
  { category: 'Utilities (Electric / Water)', budgeted: 50000, actual: 42000, variance: 8000 },
  { category: 'Security Services', budgeted: 40000, actual: 36000, variance: 4000 },
  { category: 'Society Events', budgeted: 30000, actual: 38500, variance: -8500 },
  { category: 'Landscaping & Garden', budgeted: 15000, actual: 12000, variance: 3000 },
]
</script>
