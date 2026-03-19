export const ENDPOINTS = {
  // admin endpoints
  ADMIN: {
    USERS: "/accounts/",
    VALIDATIONS: {
      DEPOSITS: "/admin/validations/deposits",
      LISTINGS: "/admin/validations/listings",
      EVENTS: "/admin/validations/events",
      STATS: "/admin/validations/stats",
      ACTION: (entityType: string, id: number) =>
        `/admin/validations/${entityType}/${id}`,
      HISTORY: "/admin/items/history",
    },
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