'use strict';

/**
 * Single source of truth for all Catalyst DataStore table names.
 * Import this wherever you need to reference a table.
 */
const TABLES = {
  // Core identity
  COMMUNITIES:            'Communities',
  USERS:                  'Users',

  // Flat management
  FLATS:                  'Flats',
  FLAT_OWNERS:            'FlatOwners',
  FLAT_OCCUPANTS:         'FlatOccupants',
  FLAT_HISTORY:           'FlatHistory',

  // Occupancy
  TENANCIES:              'Tenancies',  // replaces old Tenants

  // Community content
  NOTICES:                'Notices',
  COMPLAINTS:             'Complaints',
  COMPLAINT_COMMENTS:     'ComplaintComments',
  FEED:                   'Feed',

  // Finance
  MAINTENANCE_INVOICES:   'MaintenanceInvoices',
  PAYMENTS:               'Payments',
  MAINTENANCE_NOTIFICATIONS: 'MaintenanceNotifications',

  // Access control
  VISITORS:               'Visitors',
  GATE_PASSES:            'GatePasses',
  DELIVERIES:             'Deliveries',

  // Amenities
  AMENITIES:              'Amenities',
  BOOKINGS:               'Bookings',
  FACILITIES:             'Facilities',

  // Staff & operations
  STAFF:                  'Staff',
  TASKS:                  'Tasks',
  DOMESTIC_HELP:          'DomesticHelp',
  INVENTORY:              'Inventory',
  PAYROLL:                'Payroll',
  MAINTENANCE:            'Maintenance',
  ASSETS:                 'Assets',

  // Engagement
  POLLS:                  'Proposals',   // reuses existing Proposals table
  POLL_VOTES:             'PollVotes',
  RULES:                  'Rules',
  MINUTES:                'Minutes',

  // System
  ALERTS:                 'Alerts',
  NOTIFICATIONS:          'Notifications',
  AUDIT_LOGS:             'AuditLogs',
  COMMUNITY_SETTINGS:     'CommunitySettings',
  RESIDENTS:              'Residents',   // legacy — keep for backward compat
  OWNERS:                 'Owners',      // legacy — keep for backward compat
};

module.exports = TABLES;
