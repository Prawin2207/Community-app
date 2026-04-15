import { defineStore } from 'pinia'
import { ref, computed , watch } from 'vue'
import { complaintsAPI } from '../services/api.js'
import { SyncService } from '../services/syncService.js'
import { mockComplaints } from '../data/mockData.js'
import { socket } from '../services/socket'

export const useComplaintsStore = defineStore('complaints', () => {
    const items = ref([])


    // LocalStorage Fallback Sync
    watch(items, (newVal) => {
        localStorage.setItem(`ch_mock_complaints`, JSON.stringify(newVal));
    }, { deep: true });
    const isLoading = ref(false)
    const error = ref(null)

    // ── Computed ──────────────────────────────────────────
    const openComplaints = computed(() => items.value.filter(c => c.status === 'open' || c.status === 'in_progress').length)
    const resolvedComplaints = computed(() => items.value.filter(c => c.status === 'resolved').length)

    // ── Actions ──────────────────────────────────────────
    async function fetchAll(params = {}) {
        isLoading.value = true
        error.value = null
        try {
            const result = await complaintsAPI.list(params)
            const responseData = result.data;
            const rawData = responseData.data || responseData;
            const serverItems = Array.isArray(rawData) ? rawData.map(c => c.Complaints || c) : [];

            // Merge with local pending items
            const pendingItems = SyncService.getPendingItems('Complaints');
            const mergedItems = [...pendingItems, ...serverItems];

            if (mergedItems.length === 0) {
              items.value = mockComplaints;
            } else {
              items.value = mergedItems;
            }
        } catch (err) {
            console.error('[complaintsStore] API Error:', err.message || err)
            error.value = err.message || 'Failed to fetch complaints'
            if (items.value.length === 0) {
              items.value = mockComplaints;
            }
        } finally {
            isLoading.value = false
        }
    }

    async function create(data) {
        error.value = null
        try {
            const result = await complaintsAPI.create(data)
            let responseData = result.data;
            if (responseData && responseData.data) responseData = responseData.data;
            
            let newComplaint = responseData.complaint || responseData;
            
            // Handle fake success
            if (result.data?._fake) {
                newComplaint = { ...newComplaint, isPending: true, ROWID: `temp_${Date.now()}` };
            }
            
            items.value.unshift(newComplaint)
            
            // 🔔 Real-time workflow: notify Technicians & Admin when a complaint is raised
            socket.send('complaint:new', {
                id: newComplaint.ROWID || newComplaint.id,
                title: newComplaint.title,
                category: newComplaint.category,
                priority: newComplaint.priority,
                apartment: newComplaint.apartment,
                reportedBy: newComplaint.reportedBy,
                timestamp: newComplaint.CREATEDTIME || new Date().toISOString()
            })
            
            // Also send as admin notification
            socket.send('notification:broadcast', {
                title: `New Complaint: ${newComplaint.priority?.toUpperCase() || 'MEDIUM'} Priority`,
                message: `${newComplaint.title} — ${newComplaint.apartment || 'Unknown Unit'}`
            })
            
            return { success: true }
        } catch (err) {
            console.error('[complaintsStore] Create Error:', err)
            error.value = err.message || 'Failed to create complaint'
            return { success: false, error: error.value }
        }
    }

    async function assignComplaint(id, technicianId, technicianName) {
        error.value = null
        try {
            const result = await complaintsAPI.update(id, { status: 'in_progress', assignedTo: technicianId })
            let responseData = result.data;
            if (responseData && responseData.data) responseData = responseData.data;
            const idx = items.value.findIndex(c => c.ROWID === id || c.id === id)
            if (idx !== -1) {
                const complaint = items.value[idx]
                items.value[idx] = { ...complaint, status: 'in_progress', assignedTo: technicianId }
                
                // Sync with Ops Store: Create/Update the linked Task
                const opsStore = useOpsStore()
                await opsStore.createTask({
                    title: `Repair: ${complaint.title}`,
                    description: `[COMPLAINT_ID:${id}] Resident Reported: ${complaint.description}`,
                    facility: complaint.category || 'Resident Home',
                    priority: complaint.priority || 'medium',
                    assignedTo: technicianId,
                    status: 'in_progress'
                })

                // Notify assigned technician
                socket.send('task:assigned', {
                    technicianId,
                    complaintId: id,
                    title: items.value[idx].title,
                    category: items.value[idx].category,
                    priority: items.value[idx].priority,
                    apartment: items.value[idx].apartment
                })
                // Notify resident their complaint is being worked on  
                socket.send('complaint:update', {
                    residentId: items.value[idx].residentId,
                    complaintId: id,
                    title: items.value[idx].title,
                    status: 'in_progress',
                    updatedBy: technicianName || 'Admin'
                })
            }
            return { success: true }
        } catch (err) {
            error.value = err.message
            return { success: false, error: error.value }
        }
    }

    async function updateStatus(data) {
        error.value = null
        const id = data.ROWID || data.id;
        const status = data.status;
        if (!id || !status) return { success: false, error: 'ID and Status required' };

        try {
            const result = await complaintsAPI.update(id, { status })
            let responseData = result.data;
            if (responseData && responseData.data) responseData = responseData.data;

            const idx = items.value.findIndex(c => c.ROWID === id || c.id === id)
            if (idx !== -1) {
                const updated = responseData.Complaints || responseData.complaint || responseData;
                items.value[idx] = { ...items.value[idx], ...updated, status }; 
                
                // Notify resident about status change
                socket.send('complaint:update', {
                    residentId: items.value[idx].residentId,
                    complaintId: id,
                    title: items.value[idx].title,
                    status: status,
                    updatedBy: 'Admin'
                })
            }
            return { success: true }
        } catch (err) {
            console.error('[complaintsStore] Update Error:', err)
            error.value = err.message || 'Failed to update complaint status'
            return { success: false, error: error.value }
        }
    }

    // Initialize without mock data
    items.value = []

    return {
        items, isLoading, error,
        openComplaints, resolvedComplaints,
        fetchAll, create, updateStatus, assignComplaint,
    }
})
