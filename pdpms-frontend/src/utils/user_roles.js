// Utility functions for handling user roles and module visibility
// This centralizes all role-based access logic so it can be updated in one place

// Maps various raw role strings coming from the backend / user record to a canonical identifier
export const normalizeRole = (rawRole = '') => {
  const role = rawRole.toString().toLowerCase().trim();

  if (['admin', 'administrator'].includes(role)) return 'admin';
  if (['document_manager', 'document manager', 'doc manager', 'doc_manager'].includes(role)) {
    return 'document_manager';
  }
  if ([
    'information_officer',
    'information access officer',
    'information officer',
    'information_access_officer',
    'informationaccessofficer',
  ].includes(role)) {
    return 'information_officer';
  }

  // Fallback – replace spaces with underscores so "Project Manager" => "project_manager"
  return role.replace(/\s+/g, '_');
};

// Given a canonical role, returns the list of modules (with optional sub-modules) that should be visible.
// This can be expanded easily as more roles are introduced.
export const filterModulesByRole = (role, allModules) => {
  switch (role) {
    case 'admin':
      return allModules; // full access

    case 'document_manager':
      // Document Managers may not access the Admin module
      return allModules.filter(m => m.id !== 'Admin');

    case 'information_officer':
      // Information Access Officers can only view Dashboard and Reports
      return allModules.filter(m => ['Dashboard', 'Reports'].includes(m.id));

    default:
      // By default, hide the Admin module for non-admin roles
      return allModules.filter(m => m.id !== 'Admin');
  }
};
