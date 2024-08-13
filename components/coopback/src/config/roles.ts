const allRoles = {
  user: [''],
  service: ['addUser', 'sendNotification'],
  chairman: ['addUser', 'getUsers', 'manageUsers', 'loadAgenda', 'loadStaff', 'getDocuments', 'loadInfo'],
  member: ['getUsers', 'manageUsers', 'loadAgenda', 'loadStaff', 'getDocuments', 'loadInfo'],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
