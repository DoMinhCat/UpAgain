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
    SUBSCRIPTIONS: {
      ALL: "/admin/subscriptions",
      DETAILS: "/admin/subscriptions/:id",
    },
  },
  USER: {
    // paths for user espace here
    SCORE: "/score",
    PROFILE: "/profile",
    POSTS: {
      ALL: "/community",
      DETAILS: "/community/:id",
      DETAILS_FN: (id: number) => `/community/${id}`,
    },
  },
  PRO: {
    // paths for pro/artisans espace here
  },
  GUEST: {
    LOGIN: "/login",
    REGISTER: "/register",
    ABOUT: "/about",
    PRICING: "/pricing",
    POSTS: "/posts",
    CONTACT: "/contact",
    FORGOT: "/forgot",
  },
  ERROR: {
    NOT_FOUND: "/404",
    UNAUTHORIZED: "/403",
    INTERNAL_SERVER_ERROR: "/500",
  },
  MARKETPLACE: {
    HOME: "/marketplace",
    LISTINGS: "/marketplace/listings",
    DEPOSITS: "/marketplace/deposits",
  },
  EVENTS: {
    HOME: "/events",
  },
  POSTS: {
    HOME: "/posts",
  },
} as const;
