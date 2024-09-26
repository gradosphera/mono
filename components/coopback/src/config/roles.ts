const user = [
  'getSelf',
  'initialPayment',
  'generateDocument',
  'getMyDocuments',
  'getMyOrders',
  'sendVerificationEmail',
  'manageMyMethods',
  'createDeposit',
  'joinCooperative',
  'getVars',
];

const member = ['getUsers', 'manageUsers', 'loadAgenda', 'loadStaff', 'getDocuments', 'loadInfo', 'manageOrders'];

const chairman = [...user, ...member, 'addUser', 'setVars', 'manageSettings'];

const allRoles = {
  user,
  member,
  chairman,
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
