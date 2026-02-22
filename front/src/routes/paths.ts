export const PATHS = {
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
    // paths for user espace
  },
  GUEST: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    ABOUT: "/about",
    PRICING: "/pricing",
    POSTS: "/posts",
    CONTACT: "/contact",
  },
} as const;
