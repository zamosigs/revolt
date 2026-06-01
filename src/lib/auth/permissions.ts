export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'CEO'
  | 'MD'
  | 'ADMIN'
  | 'OPERATIONS_MANAGER'
  | 'DISPATCH_MANAGER'
  | 'SALES_MANAGER'
  | 'DISPATCHER' 
  | 'SALES_AGENT' 
  | 'ACCOUNTANT';

export type Module = 
  | 'dashboard'
  | 'loads'
  | 'booking'
  | 'clients'
  | 'leads'
  | 'payroll'
  | 'employees'
  | 'reports'
  | 'tasks'
  | 'settings';

export const ROLE_PERMISSIONS: Record<UserRole | string, Module[]> = {
  SUPER_ADMIN: [
    'dashboard', 'loads', 'booking', 'clients', 'leads', 
    'payroll', 'employees', 'reports', 'tasks', 'settings'
  ],
  CEO: [
    'dashboard', 'loads', 'booking', 'clients', 'leads', 
    'payroll', 'employees', 'reports', 'tasks', 'settings'
  ],
  MD: [
    'dashboard', 'loads', 'booking', 'clients', 'leads', 
    'payroll', 'employees', 'reports', 'tasks', 'settings'
  ],
  ADMIN: [
    'dashboard', 'loads', 'booking', 'clients', 'leads', 
    'payroll', 'employees', 'reports', 'tasks', 'settings'
  ],
  OPERATIONS_MANAGER: [
    'dashboard', 'loads', 'booking', 'clients', 'leads', 
    'payroll', 'employees', 'reports', 'tasks', 'settings'
  ],
  DISPATCH_MANAGER: [
    'dashboard', 'loads', 'booking', 'clients', 'employees', 'reports', 'tasks'
  ],
  SALES_MANAGER: [
    'dashboard', 'clients', 'leads', 'employees', 'reports', 'tasks'
  ],
  DISPATCHER: [
    'dashboard', 'loads', 'booking', 'clients', 'tasks', 'reports'
  ],
  SALES_AGENT: [
    'dashboard', 'clients', 'leads', 'tasks'
  ],
  ACCOUNTANT: [
    'dashboard', 'payroll', 'reports'
  ],
};

export const MODULE_PATHS: Record<Module, string[]> = {
  dashboard: ['/dashboard'],
  loads: ['/loads'],
  booking: ['/booking'],
  clients: ['/clients'],
  leads: ['/leads', '/crm'],
  payroll: ['/payroll'],
  employees: ['/employees'],
  reports: ['/reports'],
  tasks: ['/tasks'],
  settings: ['/settings', '/admin'],
};

/**
 * Centralized permission checker
 */
export function hasPermission(role: UserRole | string | string[] | undefined, module: Module): boolean {
  if (!role) return false;
  
  const roles = Array.isArray(role) ? role : [role];
  
  return roles.some(r => {
    const normalizedRole = r.toUpperCase() as UserRole;
    const permissions = ROLE_PERMISSIONS[normalizedRole];
    return permissions && permissions.includes(module);
  });
}

/**
 * Path-based permission checker (for middleware)
 */
export function canAccessPath(role: UserRole | string | string[] | undefined, path: string): boolean {
  if (!role) return false;

  // Find which module this path belongs to
  const moduleEntry = Object.entries(MODULE_PATHS).find(([_, paths]) => 
    paths.some(p => path.startsWith(p))
  );

  if (!moduleEntry) return true; // Paths not in our map are open (or handled by authentication)
  
  return hasPermission(role, moduleEntry[0] as Module);
}

/**
 * Helper to get allowed modules for a role (useful for Sidebar)
 */
export function getAllowedModules(role: UserRole | string | string[] | undefined): Module[] {
  if (!role) return [];
  
  const roles = Array.isArray(role) ? role : [role];
  
  const allowedModules = new Set<Module>();
  
  roles.forEach(r => {
    const normalizedRole = r.toUpperCase() as UserRole;
    const modules = ROLE_PERMISSIONS[normalizedRole] || [];
    modules.forEach(m => allowedModules.add(m));
  });
  
  return Array.from(allowedModules);
}

/**
 * Helper to check if a role is administrative
 */
export function isAdmin(role: UserRole | string | string[] | undefined): boolean {
  if (!role) return false;
  
  const roles = Array.isArray(role) ? role : [role];
  
  return roles.some(r => {
    const normalizedRole = typeof r === 'string' ? r.toUpperCase() : '';
    return normalizedRole === 'SUPER_ADMIN' || 
           normalizedRole === 'ADMIN' || 
           normalizedRole === 'CEO' || 
           normalizedRole === 'MD' ||
           normalizedRole === 'OPERATIONS_MANAGER' ||
           normalizedRole === 'DISPATCH_MANAGER' ||
           normalizedRole === 'SALES_MANAGER';
  });
}
