// This mirrors the Postgres RLS policies exactly — it exists so the UI can
// show/hide nav items and buttons that match what the database will actually
// allow. The database is still the real enforcement layer; this is only for UX.
export const ROLES = {
  admin:       { label: 'Administrator',      tabs: ['dashboard','pos','products','sales','purchases','customers','suppliers','oldgold','repairs','customorders','expenses','reports','settings'], canEdit: true },
  manager:     { label: 'Manager',             tabs: ['dashboard','pos','products','sales','purchases','customers','suppliers','oldgold','repairs','customorders','expenses','reports'], canEdit: true },
  cashier:     { label: 'Cashier',             tabs: ['dashboard','pos','sales','customers'], canEdit: true },
  salesperson: { label: 'Salesperson',         tabs: ['dashboard','pos','sales','customers','oldgold','repairs','customorders'], canEdit: true },
  inventory:   { label: 'Inventory Manager',   tabs: ['dashboard','products','purchases','suppliers'], canEdit: true },
  accountant:  { label: 'Accountant',          tabs: ['dashboard','expenses','reports','customers','suppliers'], canEdit: true },
  purchase:    { label: 'Purchase Manager',    tabs: ['dashboard','purchases','suppliers'], canEdit: true },
  readonly:    { label: 'Read-only / Auditor', tabs: ['dashboard','sales','products','reports'], canEdit: false },
};

export function tabsForRole(role) {
  return ROLES[role]?.tabs || [];
}
export function canEditForRole(role) {
  return ROLES[role]?.canEdit ?? false;
}
