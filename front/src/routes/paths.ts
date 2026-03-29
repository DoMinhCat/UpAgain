// for navigations ONLY, routes in routes/ should use relative path

export const PATHS = {
  // common endpoints here for all roles
  HOME: "/",

  // admin endpoints
  ADMIN: {
    HOME: "/admin",
    USERS: {
      ALL: "/admin/users",
      DELETED: "/admin/users/deleted",
    },
    VALIDATIONS: {
      ALL: "/admin/validations",
    },
    FINANCE: {
      ALL: "/admin/finance",
    },
    CONTAINERS: "/admin/containers",
    POSTS: "/admin/posts",
    EVENTS: {
      ALL: "/admin/events",
    },
    HISTORY: {
      ALL: "/admin/history",
      DETAILS: "/admin/history/:id",
    },
    LISTINGS: "/admin/listings",
    SUBSCRIPTIONS: "/admin/subscriptions",
  },
  USER: {
    // paths for user espace here
  },
  PRO: {
    // paths for pro/artisans espace here
  },
  GUEST: {
    LOGIN: "/login",
    REGISTER: "/register",
    REGISTER_PRO: "/register/pro",
    ABOUT: "/about",
    PRICING: "/pricing",
    POSTS: "/posts",
    CONTACT: "/contact",
    FORGOT: "/forgot",
  },
} as const;
