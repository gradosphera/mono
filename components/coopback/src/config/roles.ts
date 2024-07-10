const allRoles = {
  user: [''],
  service: ['sendNotification'],
  admin: ['getUsers', 'manageUsers', 'loadAgenda', 'loadStaff', 'loadMembers', 'getDocuments'],
  chairman: ['getUsers', 'manageUsers', 'loadAgenda', 'loadStaff', 'loadMembers', 'getDocuments'],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
