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
      EXPORT_CSV: "/accounts/export/",
    },

    CONTAINERS: {
      ALL: "/containers/",
      COUNT: "/containers/count/",
      AVAILABLE: "/containers/available/",
      SCHEDULE: (id_container: number) =>
        `/containers/${id_container}/schedule/`,
    },

    FINANCE: {
      REVENUE: "/finance/revenue/",
      SETTINGS: "/finance/settings/",
      UPDATE_SETTING: (key: string) => `/finance/settings/${key}/`,
      INVOICES: "/finance/invoices/",
      USER_INVOICES: (userId: number) => `/finance/invoices/${userId}/`,
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
      SCHEDULE: (id_employee: number) => `/employees/${id_employee}/schedule/`,
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
    SUBSCRIPTIONS: {
      ALL: "/subscriptions/",
      PRICE: "/subscriptions/price/",
      TRIAL: "/subscriptions/trial/",
      STATS: "/subscriptions/stats",
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

  ADS: {
    CREATE: "/ads/",
    DELETE: (id_ads: number) => `/ads/${id_ads}/`,
    UPDATE: (id_ads: number) => `/ads/${id_ads}/`,
  },
} as const;
