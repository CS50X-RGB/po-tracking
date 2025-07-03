export const accountRoutes = {
  login: "/user/login",
  signin: "/user/signin",
  updateImage: "/user/update/photo",
  block: "/user/block",
  getMyProfile: "/user/profile",
  getMineProfile: "/user/my/user",
  deleteById: "/user/remove",
  updateUser: "/user/update/",
  createUser: "/user/create",
  allUsers: "/user/all-users",
};
export const rolesRoutes = {
  getAll: "/role/all/roles",
  getPermission: "/role/all/permissions",
  update: "/role/update/permissions",
};

export const partNumbersRoutes = {
  partImport: "/part/create",
  getAllParts: "/part/all",
  deletePartById: "/part/delete",
  searchByPart: "part/search/all",
};
export const poRoutes = {
  createPo: "/po/new/create",
  viewPo: "/po/all/",
  addLineItem: "/po/new/add/li",
  deletePo: "/po/delete",
  singlePo: "/po/single",
  importPo: "/po/import/all",

  //not-accepted
  notAccepted: "/po/non-accepted/",
  notAcceptedLi: "/po/li/not-accepted/",
  //AcceptedLi
  acceptedLi: "/po/li/accept/",
};
export const masterRoutes = {
  createClient: "/master/create/client",
  createSubClients: "/master/create/client_branch",
  getClient: "/master/get/clients/",
  getSubClient: "/master/client/clientId",
  // search
  getPaymentTerms: "/master/get/entity/",
  getClients: "/master/get/clients/",
  getAllClientBranches: "/master/get/client_branch",
  getAllSupplier: "/master/get/supplier",
  //suppliers
  createSupplier: "/master/create/supplier",
  createSubSupplier: "/master/create/supplier_branch",
  getSupplier: "/master/get/supplier/",
  getSubSupplier: "/master/supplier/supplierId",
};

export const uomRoutes = {
  getAllUom: "/uom/all",
};

export const progressUpdate = {
  getAllProgress: "/progressUpdate/all/supplier-progress",
  getSingleProgress: "/progressUpdate/single/supplier-progress/",
  //manage Rm
  manageRm: "/progressUpdate/rawMaterial/create/",

  manageUp: "/progressUpdate/underProcess/create/",
  manageFi: "/progressUpdate/finalInspection/create/",
  manageUsp: "/progressUpdate/underSpecialProcess/create/",

  //getNonAcceptedForClient
  nonQdApproved: "/progressUpdate/client/getNonApprove",
  updateApproval: "/progressUpdate/client/approve/qd/",
  //createcipl
  manageCIPL: "/progressUpdate/cipl/create/",
  //manageDelivery
  mangeDelivery: "/progressUpdate/client/getDelivery",
  //maangeWMS
  managePostDelivery: "/progressUpdate/wms/create/",
  //getCIPL
  manageCIPLGet: "/progressUpdate/client/getCIPL",
  updateCIPL: "/progressUpdate/client/update/cipl/",
  //Final_dispatched
  dispatchLineItem: "/progressUpdate/update/final/",
  //Logistics
  getLogisitcs: "/progressUpdate/client/logistics/",
  //updateLogitics,
  updateLogistics : "/progressUpdate/client/update/logistics/",
};

export const analyticsRoute = {
  getAdminAnalytics: "/adminAnalytics/totalPOCount",
  getSupplierAnalytics: "/supplierAnalytics/analyticsData",
  getClientAnalytics: "/clientAnalytics/analyticsData",
};
