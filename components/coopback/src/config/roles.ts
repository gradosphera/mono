const allRoles = {
  user: [''],
  service: ['addUser', 'sendNotification', 'install'],
  chairman: ['addUser', 'getUsers', 'manageUsers', 'loadAgenda', 'loadStaff', 'getDocuments', 'loadInfo', 'set-vars'],
  member: ['getUsers', 'manageUsers', 'loadAgenda', 'loadStaff', 'getDocuments', 'loadInfo'],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
