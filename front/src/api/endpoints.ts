export const ENDPOINTS = {
  // admin endpoints
  ADMIN: {
    USERS: "/accounts/",
    CONTAINERS: "/containers/",
    USERS_COUNT: "/accounts/count/",
    CONTAINERS_COUNT: "/containers/count/",
  },

  AUTH: {
    LOGIN: "/login/",
    REFRESH: "/refresh/",
    REGISTER: "/register/",
  },
} as const;
