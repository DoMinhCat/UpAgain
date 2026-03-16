export const ENDPOINTS = {
  // admin endpoints
  ADMIN: {
    USERS: "/accounts/",
    CONTAINERS: "/containers/",
    EVENTS: "/events/",
    USERS_COUNT: "/accounts/count/",
    CONTAINERS_COUNT: "/containers/count/",
    EVENTS_COUNT: "/events/count/",
  },

  AUTH: {
    LOGIN: "/login/",
    REFRESH: "/refresh/",
    REGISTER: "/register/",
  },
} as const;
