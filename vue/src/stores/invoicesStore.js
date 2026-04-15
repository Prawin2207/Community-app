/**
 * Invoices Store — API-backed with mock data fallback.
 */
import { defineStore } from 'pinia'
import { ref, computed , watch } from 'vue'
import { invoicesAPI } from '../services/api.js'
import { mockInvoices } from '../data/mockData.js'

export const useInvoicesStore = defineStore('invoices', () => {
    const items = ref([])


    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem(`ch_mock_invoices`, JSON.stringify(newVal));
    }, { deep: true });
    const isLoading = ref(false)
    const error = ref(null)
    const isUsingMock = ref(false)

    // ── Computed ──────────────────────────────────────────
    const pendingDues = computed(() =>
        items.value
            .filter(i => i.status === 'pending' || i.status === 'overdue')
            .reduce((sum, i) => sum + i.amount, 0)
    )
    const paidInvoicesCount = computed(() => items.value.filter(i => i.status === 'paid').length)
    const overdueInvoicesCount = computed(() => items.value.filter(i => i.status === 'overdue').length)

    const financialStats = computed(() => {
        const paidItems = items.value.filter(i => i.status === 'paid');
        const pendingItems = items.value.filter(i => i.status === 'pending' || i.status === 'overdue');
        const totalPaid = paidItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
        const totalPending = pendingItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
        
        return {
            totalPaid,
            totalPending,
            countPaid: paidItems.length,
            countPending: pendingItems.length
        };
    })

    // ── Actions ──────────────────────────────────────────
    async function fetchAll(params = {}) {
        isLoading.value = true
        error.value = null
        try {
            const result = await invoicesAPI.list(params)
            const responseData = result.data;
            const rawData = responseData.data || responseData;
            const serverItems = Array.isArray(rawData) ? rawData.map(i => i.Invoices || i) : []
            items.value = serverItems.length > 0 ? serverItems : (JSON.parse(localStorage.getItem(`ch_mock_invoices`)) || mockInvoices)
            isUsingMock.value = serverItems.length === 0
        } catch (err) {
            console.error('[invoicesStore] API Error:', err.message || err)
            error.value = err.message || 'Failed to fetch invoices'
            isUsingMock.value = false
        
            items.value = JSON.parse(localStorage.getItem(`ch_mock_invoices`)) || mockInvoices;
        } finally {
            isLoading.value = false
        }
    }

    async function create(data) {
        try {
            const result = await invoicesAPI.create(data)
            const responseData = result.data.data || result.data;
            
            items.value.unshift(responseData)
            return { success: true }
        } catch (err) {
            console.error('[invoicesStore] Create Error:', err)
            error.value = err.message || 'Failed to create invoice'
            return { success: false, error: error.value }
        }
    }

    async function update(id, data) {
        if (!id) return { success: false, error: 'No ID provided' };
        try {
            const result = await invoicesAPI.update(id, data)
            let responseData = result.data;
            if (responseData && responseData.data) responseData = responseData.data;

            const idx = items.value.findIndex(i => i.ROWID === id || i.id === id)
            if (idx !== -1) {
                const updated = responseData.Invoices || responseData.invoice || responseData;
                items.value[idx] = { ...items.value[idx], ...updated };
            }
            return { success: true }
        } catch (err) {
            console.error('[invoicesStore] Update Error:', err)
            error.value = err.message || 'Failed to update invoice'
            return { success: false, error: error.value }
        }
    }

    async function payInvoice(id) {
        if (!id) return { success: false, error: 'No ID provided' };
        isLoading.value = true;
        try {
            await update(id, { status: 'paid' });
            return { success: true };
        } catch (err) {
            console.error('[invoicesStore] Payment Error:', err);
            return { success: false, error: err.message };
        } finally {
            isLoading.value = false;
        }
    }

    async function payAllPending() {
        isLoading.value = true;
        try {
            const pending = items.value.filter(i => i.status === 'pending' || i.status === 'overdue');
            await Promise.all(pending.map(i => update(i.ROWID || i.id, { status: 'paid' })));
            return { success: true };
        } catch (err) {
            console.error('[invoicesStore] PayAll Error:', err);
            return { success: false, error: err.message };
        } finally {
            isLoading.value = false;
        }
    }

    // Initialize without mock data
    items.value = []
    isUsingMock.value = false

    return {
        items, isLoading, error, isUsingMock,
        pendingDues, paidInvoicesCount, overdueInvoicesCount, financialStats,
        fetchAll, create, update, payInvoice, payAllPending,
    }
})
