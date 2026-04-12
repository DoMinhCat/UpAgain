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
      SCORE_STATS: "/users/score/",
    },

    CONTAINERS: {
      ALL: "/containers/",
      COUNT: "/containers/count/",
      AVAILABLE: "/containers/available/",
    },

    FINANCE: {
      REVENUE: "/admin/finance/revenue/",
      INVOICES: "/admin/finance/invoices/",
      USER_INVOICES: (userId: number) => `/admin/finance/invoices/${userId}/`,
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
      UNASSIGN: (id_event: number) => `/events/${id_event}/unassign/`,
      CANCEL: (id_event: number) => `/events/${id_event}/status/`,
      UPDATE: (id_event: number) => `/events/${id_event}/update/`,
    },

    EMPLOYEES: {
      AVAILABLE: "/employees/available/",
    },

    POSTS: {
      ALL: "/posts/",
      STATS: "/posts/count/",
      DELETE: (id_post: number) => `/posts/${id_post}/delete/`,
      DETAILS: (id_post: number) => `/posts/${id_post}/`,
      UPDATE: (id_post: number) => `/posts/${id_post}/`,
      COMMENTS: (id_post: number) => `/posts/${id_post}/comments/`,
      DELETE_COMMENT: (id_comment: number) => `/comments/${id_comment}/`,
      STEPS: (id_post: number) => `/posts/${id_post}/steps/`,
      DELETE_STEP: (id_step: number) => `/posts/steps/${id_step}/`,
    },

    HISTORIES: {
      ALL: "/history/",
      DETAILS: (id_history: number) => `/history/${id_history}/`,
    },

    ITEMS: {
      ALL: "/items/",
      COUNT: "/items/count/",
      DELETE: (id_item: number) => `/items/${id_item}/`,
      DETAILS: (id_item: number) => `/items/${id_item}/`,
      TRANSACTIONS: (id_item: number) => `/items/${id_item}/transactions/`,
      CANCEL_TRANSACTION: (id_item: number, transactionUuid: string) =>
        `/items/${id_item}/transactions/${transactionUuid}/cancel/`,
    },
  },

  AUTH: {
    LOGIN: "/login/",
    REFRESH: "/refresh/",
    REGISTER: "/register/",
  },

  LISTINGS: {
    DETAILS: (id_listing: number) => `/listings/${id_listing}/`,
  },

  DEPOSITS: {
    DETAILS: (id_deposit: number) => `/deposits/${id_deposit}/`,
    CODES: (id_deposit: number) => `/deposits/${id_deposit}/codes/`,
    TRANSFER: (id_deposit: number) => `/deposits/${id_deposit}/transfer/`,
  },
} as const;
