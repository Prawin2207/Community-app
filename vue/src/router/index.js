import { createRouter, createWebHashHistory } from 'vue-router'


import { useAuthStore } from '../stores/authStore'
import { ROLES } from '../data/mockData'

// Layouts
const AdminLayout = () => import('../layouts/AdminLayout.vue')
const ResidentLayout = () => import('../layouts/ResidentLayout.vue')
const SecurityLayout = () => import('../layouts/SecurityLayout.vue')
const AccountantLayout = () => import('../layouts/AccountantLayout.vue')
const HRLayout = () => import('../layouts/HRLayout.vue')
const CommitteeLayout = () => import('../layouts/CommitteeLayout.vue')
const TechnicianLayout = () => import('../layouts/TechnicianLayout.vue')
const DeliveryLayout = () => import('../layouts/DeliveryLayout.vue')

// Auth
const LoginView = () => import('../views/auth/LoginView.vue')
const SignupView = () => import('../views/auth/SignupView.vue')
const ProcureNexus = () => import('../views/ProcureNexus.vue')

// Super Admin
const AdminDashboard = () => import('../views/admin/AdminDashboard.vue')
const ResidentsManagement = () => import('../views/admin/ResidentsManagement.vue')
const OwnersManagement = () => import('../views/admin/OwnersManagement.vue')
const FinanceDues = () => import('../views/admin/FinanceDues.vue')
const ComplaintsOverview = () => import('../views/admin/ComplaintsOverview.vue')
const Reports = () => import('../views/admin/Reports.vue')
const Notices = () => import('../views/admin/Notices.vue')
const Settings = () => import('../views/admin/Settings.vue')

// Resident
const ResidentDashboard = () => import('../views/resident/ResidentDashboard.vue')
const MyDues = () => import('../views/resident/MyDues.vue')
const MyVisitors = () => import('../views/resident/MyVisitors.vue')
const RaiseComplaint = () => import('../views/resident/RaiseComplaint.vue')
const CommunityFeed = () => import('../views/resident/CommunityFeed.vue')
const ResidentNotices = () => import('../views/resident/ResidentNotices.vue')
const Profile = () => import('../views/resident/Profile.vue')

// Security
const SecurityDashboard = () => import('../views/security/SecurityDashboard.vue')
const VisitorEntry = () => import('../views/security/VisitorEntry.vue')
const ExpectedVisitors = () => import('../views/security/ExpectedVisitors.vue')
const VisitorHistory = () => import('../views/security/VisitorHistory.vue')

// Accountant
const AccountantDashboard = () => import('../views/accountant/AccountantDashboard.vue')
const InvoiceManagement = () => import('../views/accountant/InvoiceManagement.vue')
const PaymentTracking = () => import('../views/accountant/PaymentTracking.vue')
const FinancialReports = () => import('../views/accountant/FinancialReports.vue')
const BudgetPlanning = () => import('../views/accountant/BudgetPlanning.vue')

// HR Manager
const HRDashboard = () => import('../views/hr/HRDashboard.vue')
const StaffDirectory = () => import('../views/hr/StaffDirectory.vue')
const ShiftManagement = () => import('../views/hr/ShiftManagement.vue')
const StaffPerformance = () => import('../views/hr/StaffPerformance.vue')
const Payroll = () => import('../views/hr/Payroll.vue')

// Committee Member
const CommitteeDashboard = () => import('../views/committee/CommitteeDashboard.vue')
const Proposals = () => import('../views/committee/Proposals.vue')
const MeetingMinutes = () => import('../views/committee/MeetingMinutes.vue')
const VotingPortal = () => import('../views/committee/VotingPortal.vue')
const RulesRegulations = () => import('../views/committee/RulesRegulations.vue')

// Technician
const TechnicianDashboard = () => import('../views/technician/TechnicianDashboard.vue')
const MyTasks = () => import('../views/technician/MyTasks.vue')
const WorkOrders = () => import('../views/technician/WorkOrders.vue')
const PartsInventory = () => import('../views/technician/PartsInventory.vue')

// Delivery Agent
const DeliveryDashboard = () => import('../views/delivery/DeliveryDashboard.vue')
const ActiveDeliveries = () => import('../views/delivery/ActiveDeliveries.vue')
const GatePassRequests = () => import('../views/delivery/GatePassRequests.vue')
const DeliveryHistory = () => import('../views/delivery/DeliveryHistory.vue')

// Flat Master (Admin)
const FlatMaster = () => import('../views/admin/FlatMaster.vue')
const FlatDetail = () => import('../views/admin/FlatDetail.vue')
const MaintenanceNotify = () => import('../views/admin/MaintenanceNotify.vue')

// Owner
const OwnerLayout = () => import('../layouts/OwnerLayout.vue')
const OwnerDashboard = () => import('../views/owner/OwnerDashboard.vue')
const TenantManagement = () => import('../views/owner/TenantManagement.vue')
const OwnerFlatHistory = () => import('../views/owner/FlatHistory.vue')

const routes = [
    {
        path: '/',
        redirect: '/login',
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
        meta: { public: true },
    },
    {
        path: '/procurenexus',
        name: 'ProcureNexus',
        component: ProcureNexus,
        meta: { public: true },
    },

    // Super Admin Routes
    {
        path: '/admin',
        component: AdminLayout,
        meta: { requiresAuth: true, role: ROLES.SUPER_ADMIN },
        redirect: '/admin/dashboard',
        children: [
            { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboard },
            { path: 'residents', name: 'ResidentsManagement', component: ResidentsManagement },
            { path: 'owners', name: 'OwnersManagement', component: OwnersManagement },
            { path: 'finance', name: 'FinanceDues', component: FinanceDues },
            { path: 'complaints', name: 'ComplaintsOverview', component: ComplaintsOverview },
            { path: 'reports', name: 'Reports', component: Reports },
            { path: 'notices', name: 'Notices', component: Notices },
            { path: 'settings', name: 'Settings', component: Settings },
            // Flat Master
            { path: 'flats', name: 'FlatMaster', component: FlatMaster },
            { path: 'flats/:id', name: 'FlatDetail', component: FlatDetail },
            { path: 'maintenance-notify', name: 'MaintenanceNotify', component: MaintenanceNotify },
            { path: 'rules', name: 'AdminRules', component: RulesRegulations },
        ],
    },


    // Resident Routes
    {
        path: '/resident',
        component: ResidentLayout,
        meta: { requiresAuth: true, role: ROLES.RESIDENT },
        redirect: '/resident/dashboard',
        children: [
            { path: 'dashboard', name: 'ResidentDashboard', component: ResidentDashboard },
            { path: 'dues', name: 'MyDues', component: MyDues },
            { path: 'visitors', name: 'MyVisitors', component: MyVisitors },
            { path: 'gate-pass', name: 'GatePass', component: () => import('../views/resident/GatePass.vue') },
            { path: 'complaint', name: 'RaiseComplaint', component: RaiseComplaint },
            { path: 'feed', name: 'CommunityFeed', component: CommunityFeed },
            { path: 'notices', name: 'ResidentNotices', component: ResidentNotices },
            { path: 'help', name: 'DomesticHelp', component: () => import('../views/resident/DomesticHelp.vue') },
            { path: 'rules', name: 'ResidentRules', component: RulesRegulations },
            { path: 'profile', name: 'Profile', component: Profile },
        ],
    },

    // Security Routes
    {
        path: '/security',
        component: SecurityLayout,
        meta: { requiresAuth: true, role: ROLES.SECURITY },
        redirect: '/security/dashboard',
        children: [
            { path: 'dashboard', name: 'SecurityDashboard', component: SecurityDashboard },
            { path: 'visitor-entry', name: 'VisitorEntry', component: VisitorEntry },
            { path: 'staff-entry', name: 'StaffEntry', component: () => import('../views/security/StaffEntry.vue') },
            { path: 'expected', name: 'ExpectedVisitors', component: ExpectedVisitors },
            { path: 'history', name: 'VisitorHistory', component: VisitorHistory },
        ],
    },

    // Accountant Routes
    {
        path: '/accountant',
        component: AccountantLayout,
        meta: { requiresAuth: true, role: [ROLES.ACCOUNTANT, ROLES.SUPER_ADMIN] },
        redirect: '/accountant/dashboard',
        children: [
            { path: 'dashboard', name: 'AccountantDashboard', component: AccountantDashboard },
            { path: 'invoices', name: 'InvoiceManagement', component: InvoiceManagement },
            { path: 'payments', name: 'PaymentTracking', component: PaymentTracking },
            { path: 'reports', name: 'FinancialReports', component: FinancialReports },
            { path: 'budget', name: 'BudgetPlanning', component: BudgetPlanning },
        ],
    },

    // HR Manager Routes
    {
        path: '/hr',
        component: HRLayout,
        meta: { requiresAuth: true, role: ROLES.HR_MANAGER },
        redirect: '/hr/dashboard',
        children: [
            { path: 'dashboard', name: 'HRDashboard', component: HRDashboard },
            { path: 'staff', name: 'StaffDirectory', component: StaffDirectory },
            { path: 'shifts', name: 'ShiftManagement', component: ShiftManagement },
            { path: 'performance', name: 'StaffPerformance', component: StaffPerformance },
            { path: 'payroll', name: 'Payroll', component: Payroll },
        ],
    },

    // Committee Member Routes
    {
        path: '/committee',
        component: CommitteeLayout,
        meta: { requiresAuth: true, role: [ROLES.COMMITTEE_MEMBER, ROLES.SUPER_ADMIN, ROLES.RESIDENT] },
        redirect: '/committee/dashboard',
        children: [
            { path: 'dashboard', name: 'CommitteeDashboard', component: CommitteeDashboard },
            { path: 'proposals', name: 'Proposals', component: Proposals },
            { path: 'minutes', name: 'MeetingMinutes', component: MeetingMinutes },
            { path: 'voting', name: 'VotingPortal', component: VotingPortal },
            { path: 'rules', name: 'RulesRegulations', component: RulesRegulations },
        ],
    },

    // Technician Routes
    {
        path: '/technician',
        component: TechnicianLayout,
        meta: { requiresAuth: true, role: ROLES.TECHNICIAN },
        redirect: '/technician/dashboard',
        children: [
            { path: 'dashboard', name: 'TechnicianDashboard', component: TechnicianDashboard },
            { path: 'tasks', name: 'MyTasks', component: MyTasks },
            { path: 'work-orders', name: 'WorkOrders', component: WorkOrders },
            { path: 'complaints', name: 'TechnicianComplaints', component: ComplaintsOverview },
            { path: 'inventory', name: 'PartsInventory', component: PartsInventory },
        ],
    },

    // Delivery Agent Routes
    {
        path: '/delivery',
        component: DeliveryLayout,
        meta: { requiresAuth: true, role: ROLES.DELIVERY_AGENT },
        redirect: '/delivery/dashboard',
        children: [
            { path: 'dashboard', name: 'DeliveryDashboard', component: DeliveryDashboard },
            { path: 'active', name: 'ActiveDeliveries', component: ActiveDeliveries },
            { path: 'history', name: 'DeliveryHistory', component: DeliveryHistory },
        ],
    },

    // Owner Routes
    {
        path: '/owner',
        component: OwnerLayout,
        meta: { requiresAuth: true, role: ROLES.OWNER },
        redirect: '/owner/dashboard',
        children: [
            { path: 'dashboard', name: 'OwnerDashboard', component: OwnerDashboard },
            { path: 'tenants', name: 'TenantManagement', component: TenantManagement },
            { path: 'history', name: 'OwnerFlatHistory', component: OwnerFlatHistory },
            { path: 'rules', name: 'OwnerRules', component: RulesRegulations },
        ],
    },

    // Catch-all
    { path: '/signup', name: 'Signup', component: SignupView },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/login',
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

// Route guard
router.beforeEach((to, _from, next) => {
    const auth = useAuthStore()

    if (to.meta.public) {
        if (auth.isAuthenticated) {
            return next(getRoleHomePath(auth.role))
        }
        return next()
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        auth.restoreSession()
        if (!auth.isAuthenticated) {
            return next('/login')
        }
    }

    if (to.meta.role) {
        const allowed = Array.isArray(to.meta.role) ? to.meta.role : [to.meta.role]
        if (!allowed.includes(auth.role)) {
            return next(getRoleHomePath(auth.role))
        }
    }

    next()
})


export function getRoleHomePath(role) {
    const paths = {
        [ROLES.SUPER_ADMIN]: '/admin/dashboard',
        [ROLES.RESIDENT]: '/resident/dashboard',
        [ROLES.SECURITY]: '/security/dashboard',
        [ROLES.ACCOUNTANT]: '/accountant/dashboard',
        [ROLES.HR_MANAGER]: '/hr/dashboard',
        [ROLES.COMMITTEE_MEMBER]: '/committee/dashboard',
        [ROLES.TECHNICIAN]: '/technician/dashboard',
        [ROLES.DELIVERY_AGENT]: '/delivery/dashboard',
        [ROLES.OWNER]: '/owner/dashboard',
    }
    return paths[role] || '/login'
}

export default router
