export const PATHS = {
  // common endpoints here for all roles
  HOME: "/",

  // admin endpoints
  ADMIN: {
    HOME: "/admin",
    USERS: "/admin/users",
    VALIDATIONS: "/admin/validations",
    FINANCE: "/admin/finance",
    CONTAINERS: "/admin/containers",
    POSTS: "/admin/posts",
    EVENTS: "/admin/events",
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
