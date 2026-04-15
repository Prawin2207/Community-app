/**
 * api.js — Centralized Axios instance for all CommunityHub Pro API calls.
 */
import baseApi, { BASE_URL } from './baseApi'
import { SyncService } from './syncService'

// Alias for convenience within this file
const api = baseApi

// ── Failover Wrapper ──────────────────────────────────────────────────────────
const wrapWithFailover = (method, url, dataFn, entityType) => async (...args) => {
    try {
        const data = typeof dataFn === 'function' ? dataFn(...args) : args[0];
        const finalUrl = typeof url === 'function' ? url(...args) : url;
        
        return await api[method.toLowerCase()](finalUrl, data);
    } catch (error) {
        // Only queue if it's a network error or 5xx
        if (!error.response || error.response.status >= 500) {
            const data = typeof dataFn === 'function' ? dataFn(...args) : args[0];
            const finalUrl = typeof url === 'function' ? url(...args) : url;
            
            if (SyncService && SyncService.queueRequest) {
                SyncService.queueRequest(method, finalUrl, data, entityType);
            }
            
            // Return a "fake" success response so stores can continue
            return { data: { data: data, _fake: true } };
        }
        throw error;
    }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
    login:  (body) => api.post('/auth/login', body),
    signup: (body) => api.post('/auth/signup', body),
    logout: ()     => api.post('/auth/logout'),
    me:     ()     => api.get('/auth/me'),
}

// ── Communities (Super Admin) ─────────────────────────────────────────────────
export const communitiesAPI = {
    list:   ()         => api.get('/communities'),
    get:    (id)       => api.get(`/communities/${id}`),
    create: wrapWithFailover('POST',  '/communities', (d) => d, 'Communities'),
    update: wrapWithFailover('PATCH', (id, d) => `/communities/${id}`, (id, d) => d, 'Communities'),
    remove: (id)       => api.delete(`/communities/${id}`),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
    list:   (params)   => api.get('/users', { params }),
    get:    (id)       => api.get(`/users/${id}`),
    create: wrapWithFailover('POST',  '/users', (d) => d, 'Users'),
    update: wrapWithFailover('PATCH', (id, d) => `/users/${id}`, (id, d) => d, 'Users'),
    remove: (id)       => api.delete(`/users/${id}`),
}

// ── Files ─────────────────────────────────────────────────────────────────────
export const filesAPI = {
    upload: (formData) => api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    downloadUrl: (id) => `${BASE_URL}/files/download/${id}`
}

// ── Residents & Owners ───────────────────────────────────────────────────────
export const residentsAPI = {
    list:   (params)   => api.get('/residents', { params }),
    create: wrapWithFailover('POST',  '/residents', (d) => d, 'Residents'),
    update: wrapWithFailover('PATCH', (id) => `/residents/${id}`, (id, d) => d, 'Residents'),
    remove: (id)       => api.delete(`/residents/${id}`),
}

export const ownersAPI = {
    list:   (params)   => api.get('/owners', { params }),
    create: wrapWithFailover('POST',  '/owners', (d) => d, 'Owners'),
    update: wrapWithFailover('PATCH', (id) => `/owners/${id}`, (id, d) => d, 'Owners'),
    remove: (id)       => api.delete(`/owners/${id}`),
}

// ── Rest of APIs ──────────────────────────────────────────────────────────────
export const flatsAPI = {
    list:   (params)   => api.get('/flats', { params }),
    get:    (id)       => api.get(`/flats/${id}`),
    create: wrapWithFailover('POST',  '/flats', (d) => d, 'Flats'),
    update: wrapWithFailover('PATCH', (id) => `/flats/${id}`, (id, d) => d, 'Flats'),
}

export const flatOwnersAPI = {
    list:   (params)   => api.get('/flat-owners', { params }),
    get:    (id)       => api.get(`/flat-owners/${id}`),
    create: wrapWithFailover('POST',  '/flat-owners', (d) => d, 'FlatOwners'),
    update: wrapWithFailover('PATCH', (id) => `/flat-owners/${id}`, (id, d) => d, 'FlatOwners'),
}

export const tenantsAPI = {
    list:   (params)   => api.get('/tenants', { params }),
    get:    (id)       => api.get(`/tenants/${id}`),
    create: wrapWithFailover('POST',  '/tenants', (d) => d, 'Tenancies'),
    update: wrapWithFailover('PATCH', (id) => `/tenants/${id}`, (id, d) => d, 'Tenancies'),
}

export const noticesAPI = {
    list:   (params)   => api.get('/notices', { params }),
    create: wrapWithFailover('POST',  '/notices', (d) => d, 'Notices'),
}

export const complaintsAPI = {
    list:   (params)   => api.get('/complaints', { params }),
    create: wrapWithFailover('POST',  '/complaints', (d) => d, 'Complaints'),
    update: wrapWithFailover('PATCH', (id) => `/complaints/${id}`, (id, d) => d, 'Complaints'),
}

export const invoicesAPI = {
    list:   (params)   => api.get('/invoices', { params }),
    create: wrapWithFailover('POST',  '/invoices', (d) => d, 'Invoices'),
}

export const visitorsAPI = {
    list:     (params) => api.get('/visitors', { params }),
    create:   wrapWithFailover('POST',  '/visitors', (d) => d, 'Visitors'),
    update:   wrapWithFailover('PATCH', (id) => `/visitors/${id}`, (id, d) => d, 'Visitors'),
}

export const flatHistoryAPI = {
    list:   (params) => api.get('/flat-history', { params }),
    create: wrapWithFailover('POST', '/flat-history', (d) => d, 'FlatHistory'),
}

// ── Governance & Staff (Restored) ─────────────────────────────────────────────
export const staffAPI = {
    list:   (params) => api.get('/staff', { params }),
    create: wrapWithFailover('POST',  '/staff', (d) => d, 'Staff'),
    update: wrapWithFailover('PATCH', (id, d) => `/staff/${id}`, (id, d) => d, 'Staff'),
    remove: (id)     => api.delete(`/staff/${id}`),
}

export const payrollAPI = {
    list:   () => api.get('/payments'),
    create: wrapWithFailover('POST', '/payments', (d) => d, 'Payroll'),
}

export const domesticHelpAPI = {
    list:   (params) => api.get('/domestic-help', { params }),
    create: wrapWithFailover('POST',  '/domestic-help', (d) => d, 'DomesticHelp'),
    update: wrapWithFailover('PATCH', (id, d) => `/domestic-help/${id}`, (id, d) => d, 'DomesticHelp'),
    remove: (id)     => api.delete(`/domestic-help/${id}`),
}

export const gatePassesAPI = {
    list:   (params) => api.get('/gate-passes', { params }),
    create: wrapWithFailover('POST', '/gate-passes', (d) => d, 'GatePasses'),
}

export const deliveriesAPI = {
    list:   (params) => api.get('/deliveries', { params }),
    create: wrapWithFailover('POST', '/deliveries', (d) => d, 'Deliveries'),
}

export const rulesAPI = {
    list:   () => api.get('/rules'),
    create: wrapWithFailover('POST', '/rules', (d) => d, 'Rules'),
    update: wrapWithFailover('PATCH', (id, d) => `/rules/${id}`, (id, d) => d, 'Rules'),
}

export const proposalsAPI = {
    list:   () => api.get('/proposals'),
    create: wrapWithFailover('POST', '/proposals', (d) => d, 'Proposals'),
    update: wrapWithFailover('PATCH', (id, d) => `/proposals/${id}`, (id, d) => d, 'Proposals'),
}

export const minutesAPI = {
    list:   ()   => api.get('/minutes'),
    create: wrapWithFailover('POST', '/minutes', (d) => d, 'Minutes'),
    remove: (id) => api.delete(`/minutes/${id}`),
}

export const settingsAPI = {
    list:   ()         => api.get('/settings'),
    update: wrapWithFailover('PATCH', '/settings', (key, val) => ({ key, value: val }), 'Settings'),
}

export const maintenanceAPI = {
    list:   () => api.get('/maintenance'),
    create: wrapWithFailover('POST', '/maintenance', (d) => d, 'MaintenanceTasks'),
    update: wrapWithFailover('PATCH', (id) => `/maintenance/${id}`, (id, d) => d, 'MaintenanceTasks'),
}

export const maintenanceNotifAPI = {
    list: (params) => api.get('/maintenance-notifications', { params }),
    send: wrapWithFailover('POST', '/maintenance-notifications/send', (d) => d, 'MaintenanceNotifications'),
    sendRentReminder: wrapWithFailover('POST', '/maintenance-notifications/rent-reminder', (d) => d, 'MaintenanceNotifications'),
}

export const facilitiesAPI = {
    list:   () => api.get('/facilities'),
    create: wrapWithFailover('POST', '/facilities', (d) => d, 'Facilities'),
    update: wrapWithFailover('PATCH', (id) => `/facilities/${id}`, (id, d) => d, 'Facilities'),
}

export const bookingsAPI = {
    list:   () => api.get('/bookings'),
    create: wrapWithFailover('POST', '/bookings', (d) => d, 'Bookings'),
    update: wrapWithFailover('PATCH', (id) => `/bookings/${id}`, (id, d) => d, 'Bookings'),
}

export const assetsAPI = {
    list:   (params) => api.get('/assets', { params }),
    create: wrapWithFailover('POST', '/assets', (d) => d, 'Assets'),
    update: wrapWithFailover('PATCH', (id) => `/assets/${id}`, (id, d) => d, 'Assets'),
    remove: (id) => api.delete(`/assets/${id}`),
}

export default api
