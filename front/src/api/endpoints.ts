export const ENDPOINTS = {
  // admin endpoints
  ADMIN: {
    USERS: {
      ALL: "/accounts/",
      COUNT: "/accounts/count/",
      UPDATE_PASSWORD: (id_account: number) =>
        `/accounts/${id_account}/password/`,
      BAN: (id_account: number) => `/accounts/${id_account}/ban/`,
      RECOVER: (id_account: number) => `/accounts/${id_account}/recover/`,
      STATS: (id_account: number) => `/accounts/${id_account}/stats/`,
      UPDATE: (id_account: number) => `/accounts/${id_account}/`,
    },

    CONTAINERS: {
      ALL: "/containers/",
      COUNT: "/containers/count/",
    },

    VALIDATIONS: {
      DEPOSITS: "/admin/validations/deposits",
      LISTINGS: "/admin/validations/listings",
      EVENTS: "/admin/validations/events",
      STATS: "/admin/validations/stats",
      ACTION: (entityType: string, id: number) =>
        `/admin/validations/${entityType}/${id}`,
      HISTORY: "/admin/items/history",
    },

    EVENTS: {
      ALL: "/events/",
      STATS: "/events/count/",
      ASSIGN: (id_event: number) => `/events/${id_event}/assign/`,
      ASSIGNED_EMPLOYEES: (id_event: number) =>
        `/events/employees/${id_event}/`,
    },

    EMPLOYEES: {
      AVAILABLE: "/employees/available/",
    },
  },

  AUTH: {
    LOGIN: "/login/",
    REFRESH: "/refresh/",
    REGISTER: "/register/",
  },
} as const;
