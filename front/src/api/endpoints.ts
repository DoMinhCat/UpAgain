export const ENDPOINTS = {
  // admin endpoints
  ADMIN: {
    USERS: "/accounts/",
    VALIDATIONS: {
      PENDING: "/admin/validations/pending",
      ACTION: (entityType: string, id: number) => `/admin/validations/${entityType}/${id}`,
    },
  },

  AUTH: {
    LOGIN: "/login/",
    REFRESH: "/refresh/",
    REGISTER: "/register/",
  },
} as const;
