import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
    mockResidents,
    mockInvoices,
    mockComplaints,
    mockFacilities,
    mockVisitors,
    mockNotices,
    mockBookingRequests,
    mockMaintenanceTasks,
    mockCommunityFeed,
} from '../data/mockData'

export const useMockDataStore = defineStore('mockData', () => {
    const residents = ref([...mockResidents])
    const invoices = ref([...mockInvoices])
    const complaints = ref([...mockComplaints])
    const facilities = ref([...mockFacilities])
    const visitors = ref([...mockVisitors])
    const notices = ref([...mockNotices])
    const bookingRequests = ref([...mockBookingRequests])
    const maintenanceTasks = ref([...mockMaintenanceTasks])
    const communityFeed = ref([...mockCommunityFeed])

    // --- Residents ---
    function addResident(resident) {
        const newResident = { ...resident, id: Date.now() }
        residents.value.push(newResident)
    }

    function updateResident(id, data) {
        const idx = residents.value.findIndex(r => r.id === id)
        if (idx !== -1) residents.value[idx] = { ...residents.value[idx], ...data }
    }

    function deleteResident(id) {
        residents.value = residents.value.filter(r => r.id !== id)
    }

    // --- Complaints ---
    function addComplaint(complaint) {
        const newComplaint = { ...complaint, id: `CMP-${String(complaints.value.length + 1).padStart(3, '0')}`, date: new Date().toISOString().split('T')[0], status: 'open' }
        complaints.value.unshift(newComplaint)
    }

    function updateComplaintStatus(id, status) {
        const idx = complaints.value.findIndex(c => c.id === id)
        if (idx !== -1) complaints.value[idx].status = status
    }

    // --- Visitors ---
    function addVisitor(visitor) {
        const newVisitor = { ...visitor, id: Date.now(), status: 'waiting', entryTime: null, exitTime: null, date: new Date().toISOString().split('T')[0] }
        visitors.value.unshift(newVisitor)
    }

    function approveVisitor(id) {
        const idx = visitors.value.findIndex(v => v.id === id)
        if (idx !== -1) {
            visitors.value[idx].status = 'inside'
            visitors.value[idx].entryTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
    }

    function rejectVisitor(id) {
        const idx = visitors.value.findIndex(v => v.id === id)
        if (idx !== -1) visitors.value[idx].status = 'rejected'
    }

    function exitVisitor(id) {
        const idx = visitors.value.findIndex(v => v.id === id)
        if (idx !== -1) {
            visitors.value[idx].status = 'exited'
            visitors.value[idx].exitTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
    }

    // --- Booking Requests ---
    function approveBooking(id) {
        const idx = bookingRequests.value.findIndex(b => b.id === id)
        if (idx !== -1) bookingRequests.value[idx].status = 'approved'
    }

    function rejectBooking(id) {
        const idx = bookingRequests.value.findIndex(b => b.id === id)
        if (idx !== -1) bookingRequests.value[idx].status = 'rejected'
    }

    function addBookingRequest(booking) {
        const newBooking = { ...booking, id: Date.now(), status: 'pending', requestDate: new Date().toISOString().split('T')[0] }
        bookingRequests.value.unshift(newBooking)
    }

    // --- Maintenance ---
    function updateMaintenanceStatus(id, status) {
        const idx = maintenanceTasks.value.findIndex(t => t.id === id)
        if (idx !== -1) maintenanceTasks.value[idx].status = status
    }

    // --- Notices ---
    function addNotice(notice) {
        const newNotice = { ...notice, id: Date.now(), date: new Date().toISOString().split('T')[0] }
        notices.value.unshift(newNotice)
    }

    // --- Stats ---
    const stats = {
        get totalResidents() { return residents.value.length },
        get pendingDues() { return invoices.value.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0) },
        get openComplaints() { return complaints.value.filter(c => c.status === 'open' || c.status === 'in_progress').length },
        get visitorsToday() { return visitors.value.filter(v => v.date === new Date().toISOString().split('T')[0] || true).length },
        get pendingBookings() { return bookingRequests.value.filter(b => b.status === 'pending').length },
    }

    return {
        residents, invoices, complaints, facilities, visitors, notices,
        bookingRequests, maintenanceTasks, communityFeed, stats,
        addResident, updateResident, deleteResident,
        addComplaint, updateComplaintStatus,
        addVisitor, approveVisitor, rejectVisitor, exitVisitor,
        approveBooking, rejectBooking, addBookingRequest,
        updateMaintenanceStatus,
        addNotice,
    }
})
