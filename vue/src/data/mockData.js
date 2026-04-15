// src/data/mockData.js
// All mock data for CommunityHub Pro

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    RESIDENT: 'resident',
    SECURITY: 'security',
    ACCOUNTANT: 'accountant',
    HR_MANAGER: 'hr_manager',
    COMMITTEE_MEMBER: 'committee_member',
    TECHNICIAN: 'technician',
    DELIVERY_AGENT: 'delivery_agent',
    OWNER: 'owner',
}

export const mockUsers = [
    {
        id: 1,
        name: 'Rajan Mehta',
        email: 'rajan@communityhub.com',
        role: ROLES.SUPER_ADMIN,
        avatar: null,
        apartment: null,
        phone: '+91 98765 43210',
        permissions: ['all'],
    },
    {
        id: 99,
        name: 'Vikram Singh',
        email: 'vikram@owner.com',
        role: ROLES.OWNER,
        avatar: null,
        apartment: 'B-204', // Matches resident apartment for demo
        phone: '+91 98765 99999',
        permissions: ['manage_flat', 'manage_tenant'],
    },
    {
        id: 2,
        name: 'Priya Sharma',
        email: 'priya@resident.com',
        role: ROLES.RESIDENT,
        avatar: null,
        apartment: 'B-204',
        phone: '+91 98765 11111',
        permissions: ['view_dues', 'raise_complaint', 'book_facility', 'view_notices'],
    },
    {
        id: 3,
        name: 'Arjun Singh',
        email: 'arjun@security.com',
        role: ROLES.SECURITY,
        avatar: null,
        apartment: null,
        phone: '+91 98765 22222',
        permissions: ['manage_visitors', 'emergency_alerts'],
    },

    {
        id: 5,
        name: 'Sunil Bhatia',
        email: 'sunil@accounts.com',
        role: ROLES.ACCOUNTANT,
        avatar: null,
        apartment: null,
        phone: '+91 98765 44444',
        permissions: ['manage_invoices', 'view_payments', 'manage_budget', 'financial_reports'],
    },
    {
        id: 6,
        name: 'Neha Kapoor',
        email: 'neha@hr.com',
        role: ROLES.HR_MANAGER,
        avatar: null,
        apartment: null,
        phone: '+91 98765 55555',
        permissions: ['manage_staff', 'manage_shifts', 'manage_payroll', 'performance_reviews'],
    },
    {
        id: 7,
        name: 'Prakash Iyer',
        email: 'prakash@committee.com',
        role: ROLES.COMMITTEE_MEMBER,
        avatar: null,
        apartment: 'A-501',
        phone: '+91 98765 66666',
        permissions: ['create_proposals', 'vote', 'view_minutes', 'manage_rules'],
    },
    {
        id: 8,
        name: 'Ramesh Patil',
        email: 'ramesh@technician.com',
        role: ROLES.TECHNICIAN,
        avatar: null,
        apartment: null,
        phone: '+91 98765 77777',
        permissions: ['view_work_orders', 'update_task_status', 'manage_inventory'],
    },
    {
        id: 9,
        name: 'Mohan Das',
        email: 'mohan@delivery.com',
        role: ROLES.DELIVERY_AGENT,
        avatar: null,
        apartment: null,
        phone: '+91 98765 88888',
        permissions: ['manage_deliveries', 'view_delivery_history'],
    },
]

export const mockStaff = [
    { id: 1, ROWID: 'staff1', name: 'Ramesh Patil', role: 'TECHNICIAN', dept: 'Maintenance', phone: '+91 98765 77777', email: 'ramesh@technician.com', status: 'active' },
    { id: 2, ROWID: 'staff2', name: 'Suresh Kumar', role: 'TECHNICIAN', dept: 'Electrical', phone: '+91 98765 88888', email: 'suresh@technician.com', status: 'active' },
]

export const mockResidents = [
    { id: 1, name: 'Priya Sharma', apartment: 'B-204', phone: '+91 98765 11111', email: 'priya@email.com', status: 'active', type: 'Owner', joinDate: '2022-01-15', dues: 2500, vehicleNo: 'TN 01 AB 1234', vehicleMake: 'Honda City', parkingSpot: 'P-105', documentProof: 'ABCDE1234F' },
    { id: 2, name: 'Amit Verma', apartment: 'A-101', phone: '+91 98765 44444', email: 'amit@email.com', status: 'active', type: 'Tenant', joinDate: '2021-06-10', dues: 0, vehicleNo: 'MH 12 CD 5678', vehicleMake: 'Hyundai Creta', parkingSpot: 'P-101', documentProof: 'LMNOP5678Q' },
    { id: 3, name: 'Sunita Rao', apartment: 'C-305', phone: '+91 98765 55555', email: 'sunita@email.com', status: 'active', type: 'Owner', joinDate: '2020-03-22', dues: 5000, vehicleNo: 'KA 03 EF 9012', vehicleMake: 'Maruti Baleno', parkingSpot: 'P-201', documentProof: 'GHIJK7890R' },
    { id: 4, name: 'Rajesh Gupta', apartment: 'D-402', phone: '+91 98765 66666', email: 'rajesh@email.com', status: 'inactive', type: 'Tenant', joinDate: '2023-08-01', dues: 0, vehicleNo: null, vehicleMake: null, parkingSpot: null, documentProof: 'STUVW4321S' },
    { id: 5, name: 'Kavita Nair', apartment: 'B-101', phone: '+91 98765 77777', email: 'kavita@email.com', status: 'active', type: 'Owner', joinDate: '2019-11-05', dues: 1200, vehicleNo: 'DL 04 GH 3456', vehicleMake: 'Tata Nexon', parkingSpot: 'P-050', documentProof: 'XYZPQ9999T' },
    { id: 6, name: 'Vikram Joshi', apartment: 'A-303', phone: '+91 98765 88888', email: 'vikram@email.com', status: 'active', type: 'Owner', joinDate: '2021-02-18', dues: 0, vehicleNo: 'TS 09 IJ 7890', vehicleMake: 'Kia Seltos', parkingSpot: 'P-088', documentProof: 'RSTUV8888U' },
    { id: 7, name: 'Meena Pillai', apartment: 'C-202', phone: '+91 98765 99999', email: 'meena@email.com', status: 'active', type: 'Tenant', joinDate: '2022-09-30', dues: 0, vehicleNo: 'KL 07 KL 1122', vehicleMake: 'Swift Dzire', parkingSpot: 'P-112', documentProof: 'JKLM9876V' },
    { id: 8, name: 'Suresh Kumar', apartment: 'D-104', phone: '+91 98766 10101', email: 'suresh@email.com', status: 'pending', type: 'Owner', joinDate: '2024-01-10', dues: 3500, vehicleNo: null, vehicleMake: null, parkingSpot: 'P-205', documentProof: 'DEFGH5555W' },
    { id: 9, name: 'Rahul Khanna', apartment: 'B-204', phone: '+91 98765 00001', email: 'rahul@tenant.com', status: 'active', type: 'Tenant', joinDate: '2023-10-15', dues: 0, vehicleNo: 'KA 01 XY 7777', vehicleMake: 'Tesla Model 3', parkingSpot: 'P-105-B', documentProof: 'TEN1234567' },
]

export const mockInvoices = [
    { id: 'INV-001', resident: 'Priya Sharma', apartment: 'B-204', amount: 2500, dueDate: '2024-01-31', status: 'pending', type: 'Maintenance', month: 'January 2024', payerResponsibility: 'Resident' },
    { id: 'INV-002', resident: 'Amit Verma', apartment: 'A-101', amount: 2500, dueDate: '2024-01-31', status: 'paid', type: 'Maintenance', month: 'January 2024', payerResponsibility: 'Resident' },
    { id: 'INV-003', resident: 'Sunita Rao', apartment: 'C-305', amount: 2500, dueDate: '2023-12-31', status: 'overdue', type: 'Maintenance', month: 'December 2023', payerResponsibility: 'Owner' },
    { id: 'INV-004', resident: 'Rajesh Gupta', apartment: 'D-402', amount: 2500, dueDate: '2024-01-31', status: 'paid', type: 'Maintenance', month: 'January 2024', payerResponsibility: 'Resident' },
    { id: 'INV-005', resident: 'Kavita Nair', apartment: 'B-101', amount: 1200, dueDate: '2024-01-31', status: 'pending', type: 'Club House', month: 'January 2024', payerResponsibility: 'Owner' },
    { id: 'INV-006', resident: 'Vikram Joshi', apartment: 'A-303', amount: 2500, dueDate: '2024-01-31', status: 'paid', type: 'Maintenance', month: 'January 2024', payerResponsibility: 'Owner' },
    { id: 'INV-007', resident: 'Meena Pillai', apartment: 'C-202', amount: 2500, dueDate: '2023-11-30', status: 'overdue', type: 'Maintenance', month: 'November 2023', payerResponsibility: 'Resident' },
    { id: 'INV-008', resident: 'Suresh Kumar', apartment: 'D-104', amount: 3500, dueDate: '2024-01-31', status: 'pending', type: 'Maintenance + Parking', month: 'January 2024', payerResponsibility: 'Owner' },
    { id: 'INV-009', resident: 'Vikram Singh', apartment: 'B-204', amount: 4500, dueDate: '2024-02-15', status: 'pending', type: 'Property Tax Sync', month: 'February 2024', payerResponsibility: 'Owner' },
]

export const mockComplaints = [
    { id: 'CMP-001', residentId: 1, resident: 'Priya Sharma', apartment: 'B-204', title: 'Water leakage in bathroom', category: 'Plumbing', priority: 'high', status: 'open', date: '2024-01-28', description: 'There is a water leakage from the ceiling in the master bathroom.' },
    { id: 'CMP-002', residentId: 2, resident: 'Amit Verma', apartment: 'A-101', title: 'Lift not working', category: 'Electrical', priority: 'critical', status: 'in_progress', date: '2024-01-27', description: 'The lift in A block has been non-functional for 2 days.', assignedTo: 'staff1' },
    { id: 'CMP-003', residentId: 3, resident: 'Sunita Rao', apartment: 'C-305', title: 'Noise complaint', category: 'Noise', priority: 'low', status: 'resolved', date: '2024-01-20', description: 'Loud music from neighboring apartment during night hours.', assignedTo: 'staff2' },
    { id: 'CMP-004', residentId: 5, resident: 'Kavita Nair', apartment: 'B-101', title: 'Parking space occupied', category: 'Parking', priority: 'medium', status: 'open', date: '2024-01-29', description: 'My designated parking space is being used by an unknown vehicle.' },
    { id: 'CMP-005', residentId: 6, resident: 'Vikram Joshi', apartment: 'A-303', title: 'Garden lights out', category: 'Electrical', priority: 'low', status: 'resolved', date: '2024-01-15', description: 'The garden area lights have been non-functional for a week.', assignedTo: 'staff1' },
    { id: 'CMP-006', residentId: 1, resident: 'Priya Sharma', apartment: 'B-204', title: 'Frequent Power Outage', category: 'Electrical', priority: 'high', status: 'open', date: '2024-01-30', description: 'Power goes out every few hours in B block.' },
]

export const mockVisitors = [
    { id: 1, name: 'Vijay Reddy', phone: '+91 99999 12345', purpose: 'Personal', hostResident: 'Priya Sharma', hostApartment: 'B-204', status: 'inside', entryTime: '10:30 AM', exitTime: null, vehicleNo: 'TN 01 AB 1234', date: '2024-01-30' },
    { id: 2, name: 'Delivery - Swiggy', phone: '+91 88888 56789', purpose: 'Delivery', hostResident: 'Amit Verma', hostApartment: 'A-101', status: 'exited', entryTime: '11:15 AM', exitTime: '11:20 AM', vehicleNo: null, date: '2024-01-30' },
    { id: 3, name: 'Rahul Kapoor', phone: '+91 77777 11223', purpose: 'Work', hostResident: 'Sunita Rao', hostApartment: 'C-305', status: 'waiting', entryTime: null, exitTime: null, vehicleNo: 'MH 02 CD 5678', date: '2024-01-30' },
    { id: 4, name: 'Plumber Service', phone: '+91 66666 33445', purpose: 'Service', hostResident: 'Kavita Nair', hostApartment: 'B-101', status: 'inside', entryTime: '9:00 AM', exitTime: null, vehicleNo: null, date: '2024-01-30' },
    { id: 5, name: 'Ananya Mehta', phone: '+91 55555 66778', purpose: 'Personal', hostResident: 'Vikram Joshi', hostApartment: 'A-303', status: 'exited', entryTime: '2:00 PM', exitTime: '5:00 PM', vehicleNo: 'KA 03 EF 9012', date: '2024-01-30' },
    { id: 6, name: 'Guest of Rajan', phone: '+91 55555 11111', purpose: 'Guest', hostResident: 'Rajan Mehta', hostApartment: 'Admin Office', status: 'inside', entryTime: '4:00 PM', exitTime: null, vehicleNo: null, date: '2024-01-30' },
]

export const mockNotices = [
    { id: 1, title: 'Annual General Meeting - 2024', content: 'The Annual General Meeting of the Residential Welfare Association will be held on February 15, 2024 at 6:30 PM in the Clubhouse. All residents are requested to attend. Agenda items include budget approval, election of new committee members, and discussion of upcoming projects.', category: 'Meeting', priority: 'high', date: '2024-01-28', author: 'Rajan Mehta', pinned: true },
    { id: 2, title: 'Water Supply Interruption', content: 'Water supply will be interrupted on February 2, 2024 from 9 AM to 1 PM due to maintenance work on the overhead tank. Please store sufficient water in advance.', category: 'Maintenance', priority: 'medium', date: '2024-01-29', author: 'Rajan Mehta', pinned: false },
    { id: 3, title: 'New Gym Equipment Installed', content: 'We are pleased to announce that new state-of-the-art gym equipment has been installed in the fitness center. The gym is now equipped with 3 treadmills, 2 ellipticals, and a full set of free weights.', category: 'Announcement', priority: 'low', date: '2024-01-25', author: 'Rajan Mehta', pinned: false },
    { id: 4, title: 'Parking Rules Reminder', content: 'Residents are reminded that unauthorized vehicles parked in designated spaces will be towed at the vehicle owner\'s expense. Please ensure your visitors park in the visitor parking area.', category: 'Rules', priority: 'medium', date: '2024-01-22', author: 'Rajan Mehta', pinned: false },
    { id: 5, title: 'Security Drill', content: 'A routine security drill will be conducted this Sunday between 11 AM to 12 PM. Internal alarms may sound.', category: 'Announcement', priority: 'medium', date: '2024-01-30', author: 'Security Office', pinned: false },
]

export const mockMaintenanceTasks = [
    { id: 1, title: 'Swimming Pool Cleaning', facility: 'Swimming Pool', assignedTo: 'staff1', priority: 'high', status: 'in_progress', dueDate: '2024-02-01', description: 'Weekly pool cleaning and chemical treatment' },
    { id: 2, title: 'Lift Servicing - A Block', facility: 'Common Area', assignedTo: 'staff1', priority: 'critical', status: 'pending', dueDate: '2024-01-31', description: 'Annual servicing of lifts in A Block' },
    { id: 3, title: 'Tennis Court Resurfacing', facility: 'Tennis Court', assignedTo: 'staff2', priority: 'medium', status: 'pending', dueDate: '2024-02-10', description: 'Resurface the tennis court due to wear and tear' },
    { id: 4, title: 'Gym Equipment Calibration', facility: 'Gym', assignedTo: 'staff2', priority: 'low', status: 'completed', dueDate: '2024-01-28', description: 'Monthly calibration of gym equipment' },
    { id: 5, title: 'Garden Sprinkler Repair', facility: 'Garden', assignedTo: 'staff1', priority: 'medium', status: 'in_progress', dueDate: '2024-02-02', description: 'Fix broken sprinklers in the east garden' },
    { id: 6, title: 'Main Gate Painting', facility: 'Security Gate', assignedTo: 'staff1', priority: 'low', status: 'pending', dueDate: '2024-02-05', description: 'Fresh coat of paint for the main entrance gate' },
    { id: 7, title: 'CCTV Camera Audit', facility: 'Security', assignedTo: 'staff2', priority: 'high', status: 'in_progress', dueDate: '2024-02-03', description: 'Check all 124 cameras for clarity and recording status' },
]

export const mockCommunityFeed = [
    { id: 1, author: 'Priya Sharma', apartment: 'B-204', content: 'Has anyone found a brown wallet near the swimming pool area? Please contact me at B-204 if found.', category: 'Lost & Found', date: '2024-01-30 2:30 PM', likes: 3, comments: 2 },
    { id: 2, author: 'Amit Verma', apartment: 'A-101', content: 'Recommending Raj Electricals for home wiring work. They did a great job at my place at a reasonable price. Contact: 9876554321', category: 'Recommendation', date: '2024-01-29 5:00 PM', likes: 12, comments: 5 },
    { id: 3, author: 'Sunita Rao', apartment: 'C-305', content: 'Organizing a Holi celebration on March 25th in the garden area. All residents are welcome! Bring your colors and water guns 🎉', category: 'Event', date: '2024-01-28 8:00 PM', likes: 28, comments: 15 },
    { id: 4, author: 'Kavita Nair', apartment: 'B-101', content: 'Selling baby items: crib, high chair, and stroller. All in excellent condition. Interested parties can contact me.', category: 'For Sale', date: '2024-01-27 11:00 AM', likes: 5, comments: 8 },
]

export const mockRules = [
    { id: 1, ROWID: 'r1', title: 'Quiet Hours', content: 'Designated quiet hours are from 10:00 PM to 7:00 AM daily. Please minimize noise in common areas and apartments during these times to ensure comfort for all residents.', editable: false },
    { id: 2, ROWID: 'r2', title: 'Garbage Disposal & Segregation', content: 'Residents must segregate waste into Dry (Blue bin), Wet (Green bin), and Hazardous (Red bin). Garbage collection starts at 8:00 AM. Please do not leave trash in corridors.', editable: false },
    { id: 3, ROWID: 'r3', title: 'Visitor Parking Policy', content: 'Visitors must park only in designated visitor slots (V1-V20). Unauthorized parking in resident slots will result in immediate wheel clamping and a fine of ₹500.', editable: false },
    { id: 4, ROWID: 'r4', title: 'Pool & Clubhouse Safety', content: 'The swimming pool is open from 6:00 AM to 9:00 PM. Children under 12 must be accompanied by an adult. Proper swimwear is mandatory. No food or glassware allowed in the pool area.', editable: false },
    { id: 5, ROWID: 'r5', title: 'Renovation & Interior Work', content: 'Interior work is permitted from Monday to Friday (9:00 AM - 6:00 PM) and Saturday (10:00 AM - 4:00 PM). No work allowed on Sundays or Public Holidays. Prior written permission from the RWA is required.', editable: false },
    { id: 6, ROWID: 'r6', title: 'Pet Guidelines', content: 'Pets must be leashed at all times in common areas. Pet owners are responsible for cleaning up any mess created by their pets. Pets are not allowed in the clubhouse or gym.', editable: false },
    { id: 7, ROWID: 'r7', title: 'Moving In/Out Protocol', content: 'Notice of 48 hours is required for moving in or out. Moving is permitted between 9:00 AM and 6:00 PM only. Moving elevators must be padded to prevent damage.', editable: false },
    { id: 8, ROWID: 'r8', title: 'Security & Access Control', content: 'All residents must register their domestic help and regular visitors. Tailgating at the main gate is strictly prohibited for security reasons.', editable: false },
]

export const mockAlerts = [
    { id: 1, ROWID: 'a1', type: 'Medical Emergency', location: 'D Block, Level 2', description: 'Elderly resident needs assistance.', status: 'active', CREATEDTIME: '2024-01-30T10:00:00Z' },
    { id: 2, ROWID: 'a2', type: 'Security Breach', location: 'Main Gate', description: 'Unauthorized vehicle attempted entry.', status: 'resolved', CREATEDTIME: '2024-01-29T22:00:00Z' },
]

export const chartData = {
    monthlyCollection: {
        labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
        datasets: [{
            label: 'Collection (₹ in thousands)',
            data: [200, 192, 178, 210, 198, 245],
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            borderColor: '#6366f1',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
        }],
    },
    facilityUsage: {
        labels: ['Pool', 'Gym', 'Clubhouse', 'Tennis', 'Badminton', 'Library'],
        datasets: [{
            label: 'Usage %',
            data: [75, 88, 45, 20, 65, 30],
            backgroundColor: [
                'rgba(99, 102, 241, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(6, 182, 212, 0.8)',
            ],
            borderWidth: 0,
        }],
    },
    visitorsChart: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Expected',
                data: [15, 22, 18, 25, 30, 45, 35],
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderRadius: 6,
            },
            {
                label: 'Arrived',
                data: [12, 20, 16, 22, 28, 40, 32],
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderRadius: 6,
            },
        ],
    },
    complaintsByCategory: {
        labels: ['Plumbing', 'Electrical', 'Noise', 'Parking', 'Other'],
        datasets: [{
            data: [40, 30, 10, 15, 5],
            backgroundColor: [
                'rgba(99, 102, 241, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(148, 163, 184, 0.8)',
            ],
            borderWidth: 0,
            hoverOffset: 4,
        }],
    },
}

export const mockDomesticHelp = [
    { id: 1, name: 'Savitri Devi', type: 'Maid', resident: 'Priya Sharma', apartment: 'B-204', rating: 4.8, status: 'inside', entryTime: '08:15 AM', photo: null },
    { id: 2, name: 'Ram Kumar', type: 'Driver', resident: 'Amit Verma', apartment: 'A-101', rating: 4.5, status: 'outside', entryTime: null, photo: null },
    { id: 3, name: 'Anita Singh', type: 'Cook', resident: 'Sunita Rao', apartment: 'C-305', rating: 4.9, status: 'inside', entryTime: '11:30 AM', photo: null },
]

export const mockProposals = [
    { id: 1, ROWID: 'prop1', title: 'Solar Panel Installation', description: 'Install solar panels on B and C block roofs to reduce common electricity costs.', author: 'Prakash Iyer', status: 'open', votesFor: 45, votesAgainst: 3, date: '2024-01-15' },
    { id: 2, ROWID: 'prop2', title: 'New Visitor Management App', description: 'Switch to a dedicated mobile app for visitor pre-approvals.', author: 'Rajan Mehta', status: 'passed', votesFor: 88, votesAgainst: 12, date: '2023-12-20' },
]

export const mockMinutes = [
    { id: 1, ROWID: 'min1', title: 'January General Body Meeting', date: '2024-01-15', author: 'Rajan Mehta', preview: 'Discussed annual budget, building maintenance, and new security guard contracts.' },
    { id: 2, ROWID: 'min2', title: 'Emergency Committee Meeting', date: '2023-12-28', author: 'Prakash Iyer', preview: 'Urgent meeting regarding water main break in Block A.' },
]

export const mockPayroll = [
    { id: 1, staffName: 'Suresh Kumar', amount: 18000, month: 'January 2024', status: 'paid', date: '2024-01-31' },
    { id: 2, staffName: 'Ramesh Patil', amount: 22000, month: 'January 2024', status: 'pending', date: '2024-01-31' },
]

export const mockShifts = [
    { id: 1, staffName: 'Sunil Singh', role: 'Security', shift: 'Night', status: 'on-duty' },
    { id: 2, staffName: 'Anita Rao', role: 'Housekeeping', shift: 'Morning', status: 'off-duty' },
]

export const mockInventory = [
    { id: 1, item: 'LED Bulbs 12W', category: 'Electrical', quantity: 45, unit: 'pcs', minLevel: 10 },
    { id: 2, item: 'Chlorine Tablets', category: 'Plumbing', quantity: 12, unit: 'kg', minLevel: 5 },
]

export const mockFlats = [
    { id: 1, number: 'A-101', block: 'A', floor: 1, sqft: 1250, maintenanceRate: 3.5, owner: 'Amit Verma', status: 'occupied' },
    { id: 2, number: 'B-204', block: 'B', floor: 2, sqft: 1550, maintenanceRate: 3.5, owner: 'Priya Sharma', status: 'occupied' },
    { id: 3, number: 'C-305', block: 'C', floor: 3, sqft: 1250, maintenanceRate: 3.5, owner: 'Sunita Rao', status: 'occupied' },
]

export const mockOwners = [
    { id: 1, name: 'Amit Verma', phone: '+91 98765 44444', email: 'amit@owner.com', flatsOwned: ['A-101', 'D-402'], residenceStatus: 'Resident' },
    { id: 2, name: 'Vikram Singh', phone: '+91 98765 99999', email: 'vikram@owner.com', flatsOwned: ['B-204'], residenceStatus: 'Non-Resident' },
]

export const mockTenants = [
    { id: 1, name: 'Amit Verma', apartment: 'A-101', phone: '+91 98765 44444', status: 'active', leaseStart: '2023-01-10', leaseEnd: '2024-01-10' },
    { id: 2, name: 'Rajesh Gupta', apartment: 'D-402', phone: '+91 98765 66666', status: 'active', leaseStart: '2023-08-01', leaseEnd: '2024-08-01' },
    { id: 3, name: 'Rahul Khanna', apartment: 'B-204', phone: '+91 98765 00001', status: 'active', leaseStart: '2023-10-15', leaseEnd: '2024-10-15' },
]

export const mockGatePasses = [
    { id: 1, visitorName: 'Vijay Reddy', apartment: 'B-204', type: 'Guest', expiry: '2024-01-31', status: 'active', passCode: 'GP-1234' },
    { id: 2, visitorName: 'Rahul Kapoor', apartment: 'C-305', type: 'Worker', expiry: '2024-02-05', status: 'active', passCode: 'GP-5678' },
]

export const mockDeliveries = [
    { id: 1, supplier: 'Swiggy', apartment: 'A-101', type: 'Food', status: 'at_gate', date: '2024-01-30' },
    { id: 2, supplier: 'Amazon', apartment: 'B-204', type: 'Courier', status: 'delivered', date: '2024-01-30' },
]

export const mockFacilities = [
    { id: 1, name: 'Clubhouse', location: 'Ground Floor, A Block', status: 'active', icon: 'Home' },
    { id: 2, name: 'Swimming Pool', location: 'Garden Area', status: 'active', icon: 'Wind' },
    { id: 3, name: 'Gym', location: 'Level 1, Clubhouse', status: 'active', icon: 'Dumbbell' },
    { id: 4, name: 'Tennis Court', location: 'Garden Area', status: 'active', icon: 'Target' },
]

export const mockAssets = [
    { id: 1, name: 'Main Power Backup Generator', category: 'Electrical', status: 'operational' },
    { id: 2, name: 'Lift A1', category: 'Common Area', status: 'operational' },
    { id: 3, name: 'Lift B1', category: 'Common Area', status: 'under_maintenance' },
]

export const mockBookingRequests = [
    { id: 1, facilityName: 'Clubhouse', residentName: 'Priya Sharma', date: '2024-02-10', status: 'approved' },
    { id: 2, facilityName: 'Tennis Court', residentName: 'Amit Verma', date: '2024-02-05', status: 'pending' },
]
