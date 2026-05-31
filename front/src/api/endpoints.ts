export const ENDPOINTS = {
  // admin endpoints
  ADMIN: {
    USERS: {
      ALL: "/accounts",
      COUNT: "/accounts/count",
      UPDATE_PASSWORD: (id_account: number) =>
        `/accounts/${id_account}/password`,
      BAN: (id_account: number) => `/accounts/${id_account}/ban`,
      RECOVER: (id_account: number) => `/accounts/${id_account}/recover`,
      STATS: (id_account: number) => `/accounts/${id_account}/stats`,
      UPDATE: (id_account: number) => `/accounts/${id_account}/update`,
      SCORE_STATS: "/users/score",
      EXPORT_CSV: "/accounts/export",
    },

    CONTAINERS: {
      ALL: "/containers",
      COUNT: "/containers/count",
      AVAILABLE: "/containers/available",
      SCHEDULE: (id_container: number) =>
        `/containers/${id_container}/schedule`,
      EARLIEST: (id: number) => `/containers/${id}/earliest`,
      NEAREST: "/containers/nearest",
      OPEN: (id: number) => `/containers/${id}/open`,
    },

    FINANCE: {
      REVENUE: "/finance/revenue",
      SETTINGS: "/finance/settings",
      UPDATE_SETTING: (key: string) => `/finance/settings/${key}`,
      INVOICES: "/finance/invoices",
      USER_INVOICES: (userId: number) => `/finance/invoices/${userId}`,
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
      ALL: "/events",
      STATS: "/events/count",
      ASSIGN: (id_event: number) => `/events/${id_event}/assign`,
      ASSIGNED_EMPLOYEES: (id_event: number) => `/events/employees/${id_event}`,
      UNASSIGN: (id_event: number) => `/events/${id_event}/unassign`,
      CANCEL: (id_event: number) => `/events/${id_event}/status`,
      REFUSE: (id_event: number) => `/events/${id_event}/refuse`,
      UPDATE: (id_event: number) => `/events/${id_event}/update`,
      REGISTER: "/events/register",
      CANCEL_REGISTRATION: "/events/cancel",
    },

    EMPLOYEES: {
      AVAILABLE: "/employees/available",
      SCHEDULE: (id_employee: number) => `/employees/${id_employee}/schedule`,
    },

    POSTS: {
      ALL: "/posts",
      STATS: "/posts/count",
      DELETE: (id_post: number) => `/posts/${id_post}`,
      DETAILS: (id_post: number) => `/posts/${id_post}`,
      UPDATE: (id_post: number) => `/posts/${id_post}`,
      COMMENTS: (id_post: number) => `/posts/${id_post}/comments`,
      DELETE_COMMENT: (id_comment: number) => `/comments/${id_comment}`,
      STEPS: (id_post: number) => `/posts/${id_post}/steps`,
      DELETE_STEP: (id_step: number) => `/posts/steps/${id_step}`,
      UPDATE_STEP: (id_step: number) => `/posts/steps/${id_step}`,
      REORDER_STEP: (id_step: number) => `/posts/steps/${id_step}/reorder`,
    },

    HISTORIES: {
      ALL: "/history",
      DETAILS: (id_history: number) => `/history/${id_history}`,
    },

    ITEMS: {
      ALL: "/items",
      COUNT: "/items/count",
      DELETE: (id_item: number) => `/items/${id_item}`,
      DETAILS: (id_item: number) => `/items/${id_item}`,
      TRANSACTIONS: (id_item: number) => `/items/${id_item}/transactions`,
      CANCEL_RESERVATION: (id_item: number) => `/items/${id_item}/cancel`,
    },
    SUBSCRIPTIONS: {
      ALL: "/subscriptions",
      PRICE: "/subscriptions/price",
      TRIAL: "/subscriptions/trial",
      STATS: "/subscriptions/stats",
    },
  },

  AUTH: {
    LOGIN: "/login",
    REFRESH: "/refresh",
    REGISTER: "/register",
  },

  ITEMS: {
    NEW: "/items",
    ME: "/items/me",
    RESERVE: (idItem: number) => `/items/${idItem}/reserve`,
    CANCEL_RESERVATION: (idItem: number) => `/items/${idItem}/cancel`,
    PURCHASE: (idItem: number) => `/items/${idItem}/purchase`,
    LATEST_TRANSACTION: (idItem: number) =>
      `/items/${idItem}/transactions/latest`,
    CONFIRM: (idItem: number) => `/items/${idItem}/confirm`,
  },

  LISTINGS: {
    DETAILS: (id_listing: number) => `/listings/${id_listing}`,
  },

  DEPOSITS: {
    DETAILS: (id_deposit: number) => `/deposits/${id_deposit}`,
    CODES: (id_deposit: number) => `/deposits/${id_deposit}/codes`,
    TRANSFER: (id_deposit: number) => `/deposits/${id_deposit}/transfer`,
  },

  BARCODES: {
    GET: (id_deposit: number) => `/codes/${id_deposit}`,
    DOWNLOAD: (id_deposit: number) => `/codes/${id_deposit}/download`,
  },

  ADS: {
    CREATE: "/ads",
    DELETE: (id_ads: number) => `/ads/${id_ads}`,
    UPDATE: (id_ads: number) => `/ads/${id_ads}`,
  },

  USER: {
    GLOBAL_IMPACT: "/users/impact/global",
    POSTS: {
      ALL: "/posts",
      DETAILS: (id_post: number) => `/posts/${id_post}`,
      COMMENTS: (id_post: number) => `/posts/${id_post}/comments`,
      ADD_COMMENT: (id_post: number) => `/posts/${id_post}/comments`,
      LIKE: (id_post: number) => `/posts/${id_post}/like`,
      SAVE: (id_post: number) => `/posts/${id_post}/save`,
      VIEW: (id_post: number) => `/posts/${id_post}/view`,
      LIKE_COMMENT: (id_comment: number) => `/comments/${id_comment}/like`,
      SAVED: "/posts/saved",
      MY_POSTS: "/posts/me",
    },
    IMPACT: "/users/impact",
    ITEMS: "/users/items",
  },
  EVENTS: {
    MY_EVENTS: "/events/me",
  },

  ACCOUNTS: {
    UPDATE_AVATAR: (id_account: number) => `/accounts/${id_account}/avatar`,
    NOTIFICATIONS: (id_account: number) =>
      `/accounts/${id_account}/notifications`,
    ONBOARDING: "/accounts/onboarding",
  },

  // external providers
  STRIPE: {
    VERIFY: "/payments/verify",
  },

  LOCATION: {
    GET_COOR: "/location/coordinates",
    GET_ADDRESS: "/location/address",
  },
} as const;
