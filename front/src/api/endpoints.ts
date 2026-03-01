export const ENDPOINTS = {
  // admin endpoints
  ADMIN: {
    USERS: "/admin/accounts/",
    REGISTER: "/admin/register/",
  },

  AUTH: {
    LOGIN: "/login/",
    REFRESH: "/refresh/",
  },

  GUEST: {
    REGISTER: "/register/",
  },

  USER: {
    DELETE: "/user/delete/",
  },
} as const;
